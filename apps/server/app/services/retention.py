from psycopg import Connection

BUCKETS = ["0", "1", "2", "3", "4+"]

def _fill_buckets(rows):
    """
    rows: list of dicts like:
      {"events_attended_bucket": "2", "people": 17}
    returns all buckets with missing buckets filled with 0
    """
    m = {r["events_attended_bucket"]: int(r["people"]) for r in rows}
    return [{"events_attended_bucket": b, "people": m.get(b, 0)} for b in BUCKETS]

def build_retention_payload(
    conn: Connection,
    *,
    members_table: str = "public.members",
    attendance_table: str = "public.event_attendance",
    members_email_col: str = "email",
    attendance_member_email_col: str = "member_email",   # <-- IMPORTANT
    event_id_col: str = "event_id",
    major_category_col: str = "major_category",
):
    # Overall distribution (members only)
    overall_sql = f"""
    WITH per_member AS (
      SELECT
        m.{members_email_col} AS email,
        COUNT(DISTINCT a.{event_id_col}) AS events_attended
      FROM {members_table} m
      LEFT JOIN {attendance_table} a
        ON a.{attendance_member_email_col} = m.{members_email_col}
      GROUP BY m.{members_email_col}
    )
    SELECT
      CASE WHEN events_attended >= 4 THEN '4+' ELSE events_attended::text END AS events_attended_bucket,
      COUNT(*)::int AS people
    FROM per_member
    GROUP BY 1;
    """

    # Distribution by major_category (members only)
    by_major_sql = f"""
    WITH per_member AS (
      SELECT
        m.{members_email_col} AS email,
        COALESCE(m.{major_category_col}, 'Unknown') AS major_category,
        COUNT(DISTINCT a.{event_id_col}) AS events_attended
      FROM {members_table} m
      LEFT JOIN {attendance_table} a
        ON a.{attendance_member_email_col} = m.{members_email_col}
      GROUP BY m.{members_email_col}, m.{major_category_col}
    )
    SELECT
      major_category,
      CASE WHEN events_attended >= 4 THEN '4+' ELSE events_attended::text END AS events_attended_bucket,
      COUNT(*)::int AS people
    FROM per_member
    GROUP BY major_category, events_attended_bucket;
    """

    with conn.cursor() as cur:
        cur.execute(overall_sql)
        overall_rows = cur.fetchall()  # list[dict]

        cur.execute(by_major_sql)
        by_major_rows = cur.fetchall()  # list[dict]

    overall = _fill_buckets(overall_rows)

    grouped = {}
    for r in by_major_rows:
        grouped.setdefault(r["major_category"], []).append(
            {"events_attended_bucket": r["events_attended_bucket"], "people": r["people"]}
        )

    by_major = [
        {"major_category": major_category, "distribution": _fill_buckets(rows)}
        for major_category, rows in grouped.items()
    ]

    return {
        "retention": {
            "attendance_count_distribution_overall": overall,
            "attendance_count_distribution_by_major_category": by_major,
        }
    }
