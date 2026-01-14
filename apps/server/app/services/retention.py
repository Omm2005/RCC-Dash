from psycopg import Connection
from psycopg.rows import dict_row

BUCKETS = ["0", "1", "2", "3", "4+"]

def _fill_buckets(rows):
    m = {r["events_attended_bucket"]: int(r["people"]) for r in rows}
    return [{"events_attended_bucket": b, "people": m.get(b, 0)} for b in BUCKETS]

def build_retention_payload(
    conn: Connection,
    *,
    members_table: str = "public.members",
    attendance_table: str = "public.event_attendance",
    members_email_col: str = "email",
    members_major_category_col: str = "major_category",
    attendee_email_col: str = "attendee_email",
    attendee_major_category_col: str = "attendee_major_category",
    event_id_col: str = "event_id",
):
    overall_sql = f"""
    WITH people AS (
      SELECT
        LOWER(TRIM(m.{members_email_col})) AS email,
        COALESCE(NULLIF(m.{members_major_category_col}, ''), 'Unknown') AS major_category
      FROM {members_table} m
      WHERE m.{members_email_col} IS NOT NULL

      UNION

      SELECT
        LOWER(TRIM(a.{attendee_email_col})) AS email,
        COALESCE(NULLIF(a.{attendee_major_category_col}, ''), 'Unknown') AS major_category
      FROM {attendance_table} a
      WHERE a.{attendee_email_col} IS NOT NULL
    ),
    attendance_counts AS (
      SELECT
        LOWER(TRIM(a.{attendee_email_col})) AS email,
        COUNT(DISTINCT a.{event_id_col}) AS events_attended
      FROM {attendance_table} a
      WHERE a.{attendee_email_col} IS NOT NULL
      GROUP BY 1
    ),
    per_person AS (
      SELECT
        p.email,
        COALESCE(ac.events_attended, 0) AS events_attended
      FROM people p
      LEFT JOIN attendance_counts ac
        ON ac.email = p.email
    )
    SELECT
      CASE WHEN events_attended >= 4 THEN '4+' ELSE events_attended::text END AS events_attended_bucket,
      COUNT(*)::int AS people
    FROM per_person
    GROUP BY 1;
    """

    by_major_sql = f"""
    WITH people AS (
      SELECT
        LOWER(TRIM(m.{members_email_col})) AS email,
        COALESCE(NULLIF(m.{members_major_category_col}, ''), 'Unknown') AS major_category
      FROM {members_table} m
      WHERE m.{members_email_col} IS NOT NULL

      UNION

      SELECT
        LOWER(TRIM(a.{attendee_email_col})) AS email,
        COALESCE(NULLIF(a.{attendee_major_category_col}, ''), 'Unknown') AS major_category
      FROM {attendance_table} a
      WHERE a.{attendee_email_col} IS NOT NULL
    ),
    attendance_counts AS (
      SELECT
        LOWER(TRIM(a.{attendee_email_col})) AS email,
        COUNT(DISTINCT a.{event_id_col}) AS events_attended
      FROM {attendance_table} a
      WHERE a.{attendee_email_col} IS NOT NULL
      GROUP BY 1
    ),
    per_person AS (
      SELECT
        p.email,
        p.major_category,
        COALESCE(ac.events_attended, 0) AS events_attended
      FROM people p
      LEFT JOIN attendance_counts ac
        ON ac.email = p.email
    )
    SELECT
      major_category,
      CASE WHEN events_attended >= 4 THEN '4+' ELSE events_attended::text END AS events_attended_bucket,
      COUNT(*)::int AS people
    FROM per_person
    GROUP BY major_category, events_attended_bucket;
    """

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(overall_sql)
        overall_rows = cur.fetchall()
        cur.execute(by_major_sql)
        by_major_rows = cur.fetchall()

    overall = _fill_buckets(overall_rows)

    grouped = {}
    for r in by_major_rows:
        grouped.setdefault(r["major_category"], []).append(
            {"events_attended_bucket": r["events_attended_bucket"], "people": r["people"]}
        )

    by_major = [
        {"major_category": k, "distribution": _fill_buckets(v)}
        for k, v in grouped.items()
    ]

    return {
        "retention": {
            "attendance_count_distribution_overall": overall,
            "attendance_count_distribution_by_major_category": by_major,
        }
    }
