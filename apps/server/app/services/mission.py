from psycopg import Connection
from psycopg.rows import dict_row

def build_mission_payload(
    conn: Connection,
    *,
    members_table: str = "public.members",
    events_table: str = "public.events",
    attendance_table: str = "public.event_attendance",
):
    """Mission analytics: member demographics + event diversity"""

    # Normalize major_category values to a single canonical label
    norm_major_category_sql = """
        COALESCE(
          NULLIF(
            CASE
              WHEN major_category = 'Unknown/other' THEN 'Other/Unknown'
              ELSE major_category
            END,
            ''
          ),
          'Other/Unknown'
        )
    """

    # Count members by major category
    major_dist_sql = f"""
    SELECT
        {norm_major_category_sql} AS major_category,
        COUNT(*)::int AS members
    FROM {members_table}
    GROUP BY 1
    ORDER BY members DESC;
    """

    # Count members by class year
    class_year_sql = f"""
    SELECT 
        COALESCE(NULLIF(class_year, ''), 'Other/Unknown') AS class_year,
        COUNT(*)::int AS members
    FROM {members_table}
    GROUP BY class_year
    ORDER BY 
        CASE class_year
            WHEN 'Freshman' THEN 1
            WHEN 'Sophomore' THEN 2
            WHEN 'Junior' THEN 3
            WHEN 'Senior' THEN 4
            WHEN 'Grad' THEN 5
            ELSE 6
        END;
    """

    # Get top events by total attendance
    event_diversity_sql = f"""
    WITH event_attendance_counts AS (
        SELECT 
            e.id AS event_id,
            e.title AS event_title,
            e.starts_at,
            COUNT(DISTINCT a.attendee_email)::int AS total_attendees
        FROM {events_table} e
        LEFT JOIN {attendance_table} a ON e.id = a.event_id
        GROUP BY e.id, e.title, e.starts_at
        HAVING COUNT(DISTINCT a.attendee_email) > 0
        ORDER BY total_attendees DESC
        LIMIT 10
    ),
    -- Break down member majors per event
    event_major_breakdown AS (
        SELECT 
            a.event_id,
            COALESCE(
              NULLIF(
                CASE
                  WHEN m.major_category = 'Unknown/other' THEN 'Other/Unknown'
                  ELSE m.major_category
                END,
                ''
              ),
              'Other/Unknown'
            ) AS major_category,
            COUNT(*)::int AS count
        FROM {attendance_table} a
        JOIN {members_table} m ON a.member_email = m.email
        WHERE a.event_id IN (SELECT event_id FROM event_attendance_counts)
        GROUP BY a.event_id, 2
    )
    SELECT 
        eac.event_id,
        eac.event_title,
        eac.starts_at,
        eac.total_attendees,
        emb.major_category,
        emb.count,
        ROUND(emb.count::numeric / NULLIF(eac.total_attendees, 0), 4) AS pct
    FROM event_attendance_counts eac
    JOIN event_major_breakdown emb ON eac.event_id = emb.event_id
    ORDER BY eac.total_attendees DESC, emb.count DESC;
    """

    # Run all mission queries
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(major_dist_sql)
        major_dist = cur.fetchall()

        cur.execute(class_year_sql)
        class_year_dist = cur.fetchall()

        cur.execute(event_diversity_sql)
        event_rows = cur.fetchall()

    # Group event rows into API response format
    events_dict = {}
    for row in event_rows:
        event_id = str(row["event_id"])

        if event_id not in events_dict:
            events_dict[event_id] = {
                "event_id": event_id,
                "event_title": row["event_title"],
                "starts_at": row["starts_at"].isoformat() if row["starts_at"] else None,
                "total_attendees": row["total_attendees"],
                "segments": []
            }

        events_dict[event_id]["segments"].append({
            "major_category": row["major_category"],
            "pct": float(row["pct"]),
            "count": row["count"]
        })

    # Return mission payload 
    return {
        "mission": {
            "major_category_distribution": [
                {"major_category": row["major_category"], "members": row["members"]}
                for row in major_dist
            ],
            "class_year_distribution": [
                {"class_year": row["class_year"], "members": row["members"]}
                for row in class_year_dist
            ],
            "event_major_category_percent": list(events_dict.values())
        }
    }