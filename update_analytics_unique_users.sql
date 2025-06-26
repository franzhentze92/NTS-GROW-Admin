-- Update the get_analytics_summary function to properly count unique users
-- This will count authenticated users by user_id and anonymous users by session_id

CREATE OR REPLACE FUNCTION get_analytics_summary(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_page_views BIGINT,
    total_sessions BIGINT,
    unique_users BIGINT,
    avg_session_duration NUMERIC,
    bounce_rate NUMERIC,
    pages_per_session NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(pv.id)::BIGINT as total_page_views,
        COUNT(DISTINCT us.session_id)::BIGINT as total_sessions,
        -- Count unique users: if user_id is not null, count distinct user_ids, otherwise count distinct session_ids
        COALESCE(
            COUNT(DISTINCT CASE WHEN us.user_id IS NOT NULL THEN us.user_id END)::BIGINT,
            0
        ) + COUNT(DISTINCT CASE WHEN us.user_id IS NULL THEN us.session_id END)::BIGINT as unique_users,
        ROUND(AVG(us.duration)::NUMERIC, 2) as avg_session_duration,
        ROUND(
            (COUNT(CASE WHEN us.is_bounce = true THEN 1 END)::NUMERIC / 
             COUNT(us.id)::NUMERIC) * 100, 2
        ) as bounce_rate,
        ROUND(
            COUNT(pv.id)::NUMERIC / COUNT(DISTINCT us.session_id)::NUMERIC, 2
        ) as pages_per_session
    FROM user_sessions us
    LEFT JOIN page_views pv ON us.session_id = pv.session_id
    WHERE us.started_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql; 