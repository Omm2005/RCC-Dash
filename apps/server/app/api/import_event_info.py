import re
import os
import csv
import io

from datetime import datetime
from typing import Set, Tuple, Dict, Any, List, Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from supabase import create_client, Client

router = APIRouter(prefix="/api/import", tags = ["import"])

# Header aliases
# Use "contains" matching so headers don't need to match exactly
EMAIL_HEADER_ALIASES = [
    "sjsu email",
    "email address",
    "email (sjsu)",
    "email",
    "sjsu email address",
]

MAJOR_HEADER_ALIASES = [
    "degree(s) pursuing (e.g. b.b. bomputer science, humanities bA, minors)",
    "major",
    "major/ program",
    "major / program",
    "major /program",
    "what's your major?",
]

# With data currently have, this is NOT degree program (Undergrad/Grad)
# It's "class year" (Freshman/Sophomore/Grad)
PROGRAM_HEADER_ALIASES = [
    "what year are you?",
    "year",
]

CHECKIN_HEADER_ALIASES = [
    "timestamp",
]

# Supabase Client
def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/server/.env")

    return create_client(url, key)

# ---- Normalize Text for matching ----
'''
Clean string whitespacing
'''
def normalize_text(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"\s+", " ", s)

    return s

def normalize_email(email: str) -> str:
    return re.sub(r"\s+", "", (email or "").strip().lower())

def find_header(headers: List[str], aliases: List[str]) -> Optional[str]:
    #Finds first header whose lowercase form CONTAINS any alias keyword
    normalized_headers = [((h or "").strip().lower(), h) for h in headers]
    for alias in aliases:
        a = alias.strip().lower()
        for (h_norm, h_orig) in normalized_headers:
            if a and a in h_norm:
                return h_orig
    
    return None

def title_case(s: str) -> str:
    return " ".join(
        w[:1].upper() + w[1:]       # capitalize first letter of each word
        for w in (s or "").split()  # split on whitespace 
        if w                        # skip empty tokens
    )

def normalize_program(program_raw: str) -> str:
    '''
    Normalize explicit program strings to Undergraduate/Graduate/Unknown
    Currently not needed 
    '''
    p = normalize_text(program_raw)
    if p in ("", "n/a", "na", "none", "unknown", "undeclared"):
        return "Unknown"
    if any(x in p for x in ("ms", "m.s", "mba", "masters", "phd", "doctor", "graduate")):
        return "Graduate"
    if any(x in p for x in ("bs", "b.s", "ba", "b.a", "bachelors", "undergrad", "undergraduate")):
        return "Undergraduate"
    return "Unknown"

def normalize_class_year_to_program(class_year_raw: str) -> str:
    '''
    Converts year into Undergraduate/Graduate/Unknown
    Represent PROGRAM_HEADER_ALIASES
    '''
    y = normalize_text(class_year_raw)
    if y in ("freshman", "sophomore", "junior", "senior", "undergraduate", "undergrad", "1st year", "2nd year", "3rd year", "4th year"):
        return "Undergraduate"
    if y in ("grad", "graduate", "masters", "phd"):
        return "Graduate"
    if not y:
        return "Unknown"
    return "Unknown"

def infer_degree_program_from_major_raw(major_raw: str) -> Optional[str]:
    # Infer Graduate/Undergraduate from tokens inside major string (e.g. "M.S. CS", "B.S. CS")
    s = normalize_text(major_raw)

    # Search for grad tokens
    if re.search(
        r"(m\.?\s?s\.?)|\bms\b|\bma\b|\bmba\b|\bmph\b|\bmfa\b|\bmm\b|\bmlis\b|\bmpa\b|\bmsw\b|\bmat\b|\bmup\b|\bmbt\b|\bmara\b|master|graduate|\bphd\b|doctor",
        s
    ):
        return "Graduate"

    # Search for string undergrad tokens
    if re.search(
        r"(b\.?\s?s\.?)|\bbs\b|(b\.?\s?a\.?)|\bba\b|\bbfa\b|\bbm\b|bachelor|undergrad",
        s
    ):
        return "Undergraduate"
    
    # If can't infer
    return None 

def major_base_for_matching(major_raw: str) -> str:
    # Retrieve major
    s = normalize_text(major_raw)

    if not s:
        return ""

    s = s.replace("&", " and ")
    s = re.sub(r"[()•]", " ", s)
    s = re.sub(r"[.,:;\'\"`]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()

    # If multiple majors provided, choose only first
    parts = re.split(r"\s*(\+|\/|,| and )\s*", s, flags=re.IGNORECASE)

    if parts:
        s = parts[0].strip()
    
    # Edge case - remove "concentration..." and everything after
    s = re.sub(r"\bconcentration\b.*$", " ", s).strip()

    # Remove degree tokens anywhere in string
    s = re.sub(
        r"\b(b\.?\s?s\.?|b\.?\s?a\.?|m\.?\s?s\.?|mba|phd|bachelors?|masters?|undergrad(uate)?|graduate|bs|ba|ms|ma|mfa|mph|mm|mlis|mpa|msw|mat|mup|mbt|mara|bfa|bm)\b",
        " ",
        s
    ).strip()

    s = re.sub(r"\s+", " ", s).strip()
    return s

def normalize_major_and_category(major_raw: str) -> Tuple[str, str]:
    '''
    Returns (major_normalized, major_category)
    Categories: Technical, Business, Humanities & Arts, Health Sciences, Other/Unknown
    '''
    base = major_base_for_matching(major_raw)

    if not base or re.match(r"^(n\/a|na|none|blank|undeclared|undecided|unknown)$", base, flags=re.I):
        return ("Unknown", "Other/Unknown")

    if "economics" in base or base == "econ":
        return ("Economics", "Business")
    if "psychology" in base or base == "psych":
        return ("Psychology", "Health Sciences")
    if "biology" in base or base == "bio" or "biological sciences" in base:
        return ("Biology", "Health Sciences")
    
    ALIASES = [
        # Technical
        (["computer science", "comp sci", "cs", "bscs", "bs cs", "ms cs"], "Computer Science", "Technical"),
        (["software engineering", "software eng", "swe", "se"], "Software Engineering", "Technical"),
        (["data science", "data sci", "ds"], "Data Science", "Technical"),
        (["artificial intelligence", "ai"], "Artificial Intelligence", "Technical"),
        (["computer engineering"], "Computer Engineering", "Technical"),
        (["informatics"], "Informatics", "Technical"),
        (["information science and data analytics", "information science", "data analytics"], "Information Science and Data Analytics", "Technical"),

        # Business
        (["business administration", "business", "MBA"], "Business", "Business"),
        (["communication studies", "communications", "public relations"], "Business", "Business"),
        (["marketing"], "Business", "Business"),
        (["finance", "economics"], "Business", "Business"),
        (["accounting", "accountancy"], "Business", "Business"),
        (["management information systems", "mis", "business analytics"], "Business", "Business"),
        (["business analytics"], "Business", "Business"),

        # Humanities & Arts
        (["ux", "ui ux", "ui/ux", "interaction design"], "Design", "Humanities & Arts"),
        (["graphic design", "animation", "illustration", "interior design", "industrial design", "studio art", "art history", "photography"], "Arts / Design", "Humanities & Arts"),
        (["english", "history", "philosophy", "linguistics", "humanities", "religious studies"], "Humanities", "Humanities & Arts"),
        (["journalism", "radio television film"], "Humanities & Arts", "Humanities & Arts"),
        (["sociology", "justice studies", "criminology", "anthropology", "political science", "global studies", "chicana", "african american", "american studies", "interdisciplinary studies"], "Humanities & Arts", "Humanities & Arts"),

        # Health Sciences
        (["nursing"], "Nursing", "Health Sciences"),
        (["public health"], "Public Health", "Health Sciences"),
        (["kinesiology"], "Kinesiology", "Health Sciences"),
        (["occupational therapy"], "Occupational Therapy", "Health Sciences"),
        (["speech language pathology"], "Speech Language Pathology", "Health Sciences"),
        (["nutritional science", "nutrition"], "Nutritional Science", "Health Sciences"),
        (["clinical mental health counseling", "counseling"], "Counseling", "Health Sciences"),
    ]

    # Try alias matching first (exact match or substring match)
    for keys, major, cat in ALIASES:
        for k in keys:
            if base == k or k in base:
                return (major, cat)
    
    # If base has certain keywords, can also classify
    if any(w in base for w in [
        "engineering", "computer", "data", "statistics", "mathematics", "math",
        "physics", "chemistry", "geology", "meteorology", "climate",
        "earth system", "forensic science"
    ]):
        return (title_case(base), "Technical")

    if any(w in base for w in [
        "business", "account", "finance", "marketing", "management", "taxation",
        "public administration", "transportation management"
    ]):
        return (title_case(base), "Business")

    if any(w in base for w in [
        "health", "nursing", "therapy", "nutrition", "kinesiology"
    ]):
        return (title_case(base), "Health Sciences")

    if any(w in base for w in [
        "art", "design", "music", "dance", "theatre", "english", "history",
        "philosophy", "journalism", "film", "humanities", "language"
    ]):
        return (title_case(base), "Humanities & Arts")
    
    return ("Unknown", "Other/Unknown")

def parse_datetime_local(dt_str: str) -> str:
    '''
    Parses HTML datetime-local (YYYY-MM-DDTHH:MM)
    Returns ISO string
    '''
    s = (dt_str or "").strip()
    if not s:
        raise ValueError("starts_at is empty")
    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(s, fmt).isoformat()
        except ValueError:
            pass
    return s

def parse_check_in_at(s: str) -> Optional[str]:
    '''
    Strict parser for Google Forms timestamp format:
    11/21/2025 17:33:16  -> %m/%d/%Y %H:%M:%S
    '''
    s = (s or "").strip()
    if not s:
        return None
    try:
        return datetime.strptime(s, "%m/%d/%Y %H:%M:%S").isoformat()
    except ValueError:
        raise HTTPException(status_code=400, detail="Timestamp in csv upload is not consistent with expected format %m/%d/%Y %H:%M:%S")
    
@router.post("/event-attendance")
async def import_event_attendance(
    import_type: str = Form(...), # expect "event_attendance"
    title: str = Form(...),
    starts_at: str = Form(...),
    event_kind: str = Form(...),  # "social" / "nonsocial"
    event_type: str = Form(""),  # Workshop / Panel / etc.
    location: str = Form(""),
    committee: str = Form(""),

    file: UploadFile = File(...),
):
    supabase = get_supabase()

    # Validate import type
    if normalize_text(import_type) != "event_attendance":
        raise HTTPException(status_code=400, detail="import_type must be 'event_attendance' for this endpoint")
    
    # Validate event fields
    title = (title or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Missing event title")
    
    starts_at_iso = parse_datetime_local(starts_at)
    
    ek = normalize_text(event_kind)
    if ek not in ("social", "nonsocial"):
        raise HTTPException(status_code=400, detail="event_kind must be 'social' or 'nonsocial'")

    et = (event_type or "").strip() or None
   
    # Validate file
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a .csv")

    # Read CSV
    raw_bytes = await file.read()
    csv_text = raw_bytes.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(csv_text))
    headers = reader.fieldnames or []

    # Detect email/major/program/checkin columns
    email_col = find_header(headers, EMAIL_HEADER_ALIASES)
    if not email_col:
        raise HTTPException(status_code=400, detail = "CSV must include an email column (Email / SJSU Email / Email Address).")
    
    major_col = find_header(headers, MAJOR_HEADER_ALIASES)
    program_col = find_header(headers, PROGRAM_HEADER_ALIASES) # class year col
    checkin_col = find_header(headers, CHECKIN_HEADER_ALIASES) # timestamp col

    # Insert event into events table
    event_payload = {
        "title": title,
        "starts_at": starts_at_iso,
        "event_kind": ek,
        "event_type": et,
        "location": (location or "").strip() or None,
        "committee": (committee or "").strip() or None,
        "metadata": {
            "source": "admin_import",
            "filename": file.filename,
            "email_column_used": email_col,
            "major_column_used": major_col,
            "program_column_used": program_col,
            "checkin_column_used": checkin_col,
        },
    }

    event_insert = supabase.table("events").insert(event_payload).execute()
    if not event_insert.data:
        raise HTTPException(status_code=500, detail="Failed to insert event")

    event_id = event_insert.data[0]["id"] # Generated UUID

    # Load members once
    members_resp = supabase.table("members").select(
        "email,major_raw,major_normalized,major_category,degree_program"
    ).execute()

    members = members_resp.data or []

    members_by_email = {}
    for m in members:
        email = m.get("email")
        if email:
            key = normalize_email(email)
            members_by_email[key] = m

    rows_received = 0
    rows_skipped = 0
    rows_imported = 0

    warn_missing_major = 0
    warn_missing_program = 0
    warn_bad_checkin = 0
    warn_duplicate_email = 0

    attendance_rows: List[Dict[str, Any]] = []
    seen_emails: Set[str] = set()

    for row in reader:
        # Check for empty or missing row
        if not row or all((v or "").strip() == "" for v in row.values()):
            continue 

        rows_received += 1
        email_raw = (row.get(email_col) or "").strip()
        
        # Think about this design 
        if not email_raw:
            rows_skipped += 1
            continue 

        attendee_email = normalize_email(email_raw)

        # Prevent duplicates inside the same CSV file
        if attendee_email in seen_emails:
            warn_duplicate_email += 1
            rows_skipped += 1
            continue
        seen_emails.add(attendee_email)

        member = members_by_email.get(attendee_email)

        major_raw_csv = (row.get(major_col) or "").strip() if major_col else ""
        # NOTE: way we find program is actually need to do more logic -> based on response "Freshman", "Sophomore", "Junior"... "Grad" -> separates into undergrad and grad
        class_year_raw = (row.get(program_col) or "").strip() if program_col else ""
        # NOTE: always will have check in col 
        checkin_raw = (row.get(checkin_col) or "").strip() if checkin_col else ""

        check_in_iso = None
        check_in_parse_error = None
        if checkin_raw:
            try:
                check_in_iso = parse_check_in_at(checkin_raw)
            except HTTPException as e:
                warn_bad_checkin += 1
                check_in_iso = None
                check_in_parse_error = str(e.detail)
        
        # Program selection
        used_program_source = "unknown"
        attendee_program = "Unknown"
        if class_year_raw:
            used_program_source = "class_year"
            attendee_program = normalize_class_year_to_program(class_year_raw)
            if attendee_program == "Unknown":
                warn_missing_program += 1
        else:
            inferred = infer_degree_program_from_major_raw(major_raw_csv or "")
            if inferred:
                used_program_source = "inferred_from_major"
                attendee_program = inferred
            elif member and (member.get("degree_program") or "").strip():
                used_program_source = "members"
                attendee_program = (member.get("degree_program") or "").strip()
            else:
                warn_missing_program += 1
        
        # Major selection
        used_major_source = "unknown"
        attendee_major_raw = None
        attendee_major_normalized = "Unknown"
        attendee_major_category = "Other/Unknown"

        if major_raw_csv:
            used_major_source = "csv"
            attendee_major_raw = major_raw_csv
            attendee_major_normalized, attendee_major_category = normalize_major_and_category(major_raw_csv)
        elif member:
            used_major_source = "members"
            attendee_major_raw = member.get("major_raw")
            attendee_major_normalized = member.get("major_normalized") or "Unknown"
            attendee_major_category = member.get("major_category") or "Other/Unknown"
        else:
            warn_missing_major += 1
        
        member_email = attendee_email if member else None

        recognized_cols = {email_col}
        if major_col:
            recognized_cols.add(major_col)
        if program_col:
            recognized_cols.add(program_col)
        if checkin_col:
            recognized_cols.add(checkin_col)

        extra_cols = {k: v for k, v in row.items() if k not in recognized_cols}

        attendance_rows.append({
            "event_id": event_id,
            "attendee_email": attendee_email,
            "member_email": member_email,
            "attendee_major_raw": attendee_major_raw,
            "attendee_major_normalized": attendee_major_normalized,
            "attendee_major_category": attendee_major_category,
            "attendee_program": attendee_program,
            "check_in_at": check_in_iso,
            "metadata": {
                "raw_row": row,  # includes everything
                "extra_columns": extra_cols,  # explicitly highlights extras
                "used_major_source": used_major_source,
                "used_program_source": used_program_source,
                "check_in_raw": checkin_raw or None,
                "check_in_parse_error": check_in_parse_error,  # None if ok
            },
        })
    
    if attendance_rows:
        supabase.table("event_attendance").upsert(
            attendance_rows,
            on_conflict = "event_id,attendee_email"
        ).execute()
        rows_imported = len(attendance_rows)

        # Only members can become active
        affected_members = sorted({r["member_email"] for r in attendance_rows if r["member_email"]})
        
        if affected_members:
            supabase.rpc("recompute_active_members", {"emails": affected_members}).execute()
    
    warnings: List[str] = []
    if warn_missing_major:
        warnings.append(f"{warn_missing_major} rows had no major and were not members → Unknown/Other.")
    if warn_missing_program:
        warnings.append(f"{warn_missing_program} rows had no program info → Unknown (or inferred/member).")
    if warn_bad_checkin:
        warnings.append(f"{warn_bad_checkin} rows had invalid timestamp format → check_in_at stored as null.")
    if warn_duplicate_email:
        warnings.append(f"{warn_duplicate_email} duplicate attendee emails found in CSV → skipped duplicates.")

    # Frontend expects these summaries
    validationSummary = {
        "rowsValid": rows_received - rows_skipped,
        "rowsWithErrors": rows_skipped,
    }
    successSummary = {
        "rowsImported": rows_imported,
        "rowsSkipped": rows_skipped,
    }

    return {
        "status": "ok",
        "event_id": event_id,
        "validationSummary": validationSummary,
        "successSummary": successSummary,
        "warnings": warnings,
    }

            

    