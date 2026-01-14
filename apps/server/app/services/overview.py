from psycopg import Connection

def build_overview_payload(
    conn: Connection,
    *,
    members_table: str = "public.members",
    attendance_table: str = "public.event_attendance",
):
    """
    Build overview analytics payload for the dashboard.
    
    Returns:
        dict: Contains 'overview' with 'kpis' and 'members_over_time'
    """
    
    # KPI metrics: total members, active members, active %, and 30-day growth rate
    kpis_sql = f"""
    WITH stats AS (
        SELECT 
            COUNT(*)::int AS total_members,
            COUNT(*) FILTER (WHERE is_active_member = TRUE)::int AS active_members
        FROM {members_table}
    ),
    growth AS (
        SELECT 
            COUNT(*) FILTER (WHERE joined_at >= CURRENT_DATE - INTERVAL '30 days')::int AS recent_30d,
            COUNT(*) FILTER (WHERE joined_at >= CURRENT_DATE - INTERVAL '60 days' AND joined_at < CURRENT_DATE - INTERVAL '30 days')::int AS previous_30d
        FROM {members_table}
    )
    SELECT 
        s.total_members,
        s.active_members,
        ROUND(100.0 * s.active_members / NULLIF(s.total_members, 0), 1) AS active_members_pct,
        CASE WHEN g.previous_30d = 0 THEN 0.0 ELSE ROUND(100.0 * (g.recent_30d - g.previous_30d) / g.previous_30d, 1) END AS registered_growth_last_30d_pct
    FROM stats s, growth g;
    """
    
   # Monthly cumulative counts of registered and active members
    time_series_sql = f"""
    SELECT 
        TO_CHAR(date_series, 'YYYY-MM') AS period,
        (SELECT COUNT(*)::int FROM {members_table} WHERE joined_at <= date_series) AS registered_members_cumulative,
        (SELECT COUNT(*)::int FROM {members_table} WHERE is_active_member = TRUE AND active_member_start_date IS NOT NULL AND active_member_start_date <= date_series) AS active_members_cumulative
    FROM generate_series((SELECT DATE_TRUNC('month', MIN(joined_at)) FROM {members_table}), DATE_TRUNC('month', CURRENT_DATE), INTERVAL '1 month') AS date_series
    ORDER BY date_series;
    """
    
    # Execute queries and fetch results
    with conn.cursor() as cur:
        
        cur.execute(kpis_sql)
        kpis_row = cur.fetchone()
        
        cur.execute(time_series_sql)
        time_series_rows = cur.fetchall()
    
    # Format response to match API contract
    return {
        "overview": {
            "kpis": {
                "total_members": kpis_row["total_members"],
                "active_members": kpis_row["active_members"],
                "active_members_pct": float(kpis_row["active_members_pct"]),
                "registered_growth_last_30d_pct": float(kpis_row["registered_growth_last_30d_pct"])
            },
            "members_over_time": [
                {
                    "period": row["period"],
                    "registered_members_cumulative": row["registered_members_cumulative"],
                    "active_members_cumulative": row["active_members_cumulative"]
                } 
                for row in time_series_rows
            ]
        }
    }