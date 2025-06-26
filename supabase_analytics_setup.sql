-- Comprehensive Web Analytics Setup for GROW Admin Platform
-- This creates tables to track all web traffic and user behavior

-- 1. Page Views Table - Core tracking
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    page_title TEXT,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    region TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    device_type TEXT, -- desktop, mobile, tablet
    browser TEXT,
    browser_version TEXT,
    operating_system TEXT,
    screen_resolution TEXT,
    language TEXT,
    time_on_page INTEGER, -- seconds
    scroll_depth INTEGER, -- percentage
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Sessions Table - Session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- seconds
    page_count INTEGER DEFAULT 1,
    country TEXT,
    region TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    operating_system TEXT,
    referrer TEXT,
    landing_page TEXT,
    exit_page TEXT,
    is_bounce BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Events Table - Custom events tracking
CREATE TABLE IF NOT EXISTS user_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL, -- click, form_submit, download, etc.
    event_name TEXT NOT NULL,
    page_path TEXT,
    element_id TEXT,
    element_class TEXT,
    element_text TEXT,
    metadata JSONB, -- additional event data
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Geographic Data Table - Cached location data
CREATE TABLE IF NOT EXISTS geographic_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET UNIQUE,
    country TEXT,
    country_code TEXT,
    region TEXT,
    region_code TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone TEXT,
    isp TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Performance Metrics Table - Page load times, etc.
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    load_time INTEGER, -- milliseconds
    dom_content_loaded INTEGER,
    first_contentful_paint INTEGER,
    largest_contentful_paint INTEGER,
    cumulative_layout_shift DECIMAL(5, 4),
    first_input_delay INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON page_views(device_type);

CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country ON user_sessions(country);

CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON user_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_path ON performance_metrics(page_path);

-- RLS Policies
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read analytics data
CREATE POLICY "Allow authenticated users to read analytics" ON page_views
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read sessions" ON user_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read events" ON user_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read geographic data" ON geographic_data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read performance" ON performance_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow public to insert analytics data (for tracking)
CREATE POLICY "Allow public to insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert sessions" ON user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert events" ON user_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert geographic data" ON geographic_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert performance" ON performance_metrics
    FOR INSERT WITH CHECK (true);

-- Functions for analytics
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

-- Function to get top pages
CREATE OR REPLACE FUNCTION get_top_pages(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW(),
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    page_path TEXT,
    page_views BIGINT,
    unique_visitors BIGINT,
    avg_time_on_page NUMERIC,
    bounce_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.page_path,
        COUNT(pv.id)::BIGINT as page_views,
        COUNT(DISTINCT pv.session_id)::BIGINT as unique_visitors,
        ROUND(AVG(pv.time_on_page)::NUMERIC, 2) as avg_time_on_page,
        ROUND(
            (COUNT(CASE WHEN us.is_bounce = true THEN 1 END)::NUMERIC / 
             COUNT(DISTINCT pv.session_id)::NUMERIC) * 100, 2
        ) as bounce_rate
    FROM page_views pv
    LEFT JOIN user_sessions us ON pv.session_id = us.session_id
    WHERE pv.timestamp BETWEEN start_date AND end_date
    GROUP BY pv.page_path
    ORDER BY page_views DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get geographic data
CREATE OR REPLACE FUNCTION get_geographic_data(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    country TEXT,
    region TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    visitors BIGINT,
    page_views BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.country,
        pv.region,
        pv.city,
        pv.latitude,
        pv.longitude,
        COUNT(DISTINCT pv.session_id)::BIGINT as visitors,
        COUNT(pv.id)::BIGINT as page_views
    FROM page_views pv
    WHERE pv.timestamp BETWEEN start_date AND end_date
        AND pv.country IS NOT NULL
    GROUP BY pv.country, pv.region, pv.city, pv.latitude, pv.longitude
    ORDER BY visitors DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get device breakdown
CREATE OR REPLACE FUNCTION get_device_breakdown(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    device_type TEXT,
    browser TEXT,
    operating_system TEXT,
    visitors BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH device_stats AS (
        SELECT 
            COALESCE(pv.device_type, 'Unknown') as device_type,
            COALESCE(pv.browser, 'Unknown') as browser,
            COALESCE(pv.operating_system, 'Unknown') as operating_system,
            COUNT(DISTINCT pv.session_id) as visitors
        FROM page_views pv
        WHERE pv.timestamp BETWEEN start_date AND end_date
        GROUP BY pv.device_type, pv.browser, pv.operating_system
    ),
    total_visitors AS (
        SELECT SUM(visitors) as total FROM device_stats
    )
    SELECT 
        ds.device_type,
        ds.browser,
        ds.operating_system,
        ds.visitors::BIGINT,
        ROUND((ds.visitors::NUMERIC / tv.total::NUMERIC) * 100, 2) as percentage
    FROM device_stats ds, total_visitors tv
    ORDER BY ds.visitors DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO page_views (page_path, page_title, session_id, referrer, user_agent, ip_address, country, region, city, latitude, longitude, device_type, browser, browser_version, operating_system, screen_resolution, language, time_on_page, scroll_depth)
VALUES 
    ('/dashboard', 'Dashboard', 'session_1', 'https://google.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.1', 'Australia', 'New South Wales', 'Sydney', -33.8688, 151.2093, 'desktop', 'Chrome', '120.0.0.0', 'Windows', '1920x1080', 'en-US', 120, 75),
    ('/cost-management', 'Cost Management', 'session_1', '/dashboard', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.1', 'Australia', 'New South Wales', 'Sydney', -33.8688, 151.2093, 'desktop', 'Chrome', '120.0.0.0', 'Windows', '1920x1080', 'en-US', 180, 90),
    ('/financial-analytics', 'Financial Analytics', 'session_2', 'https://bing.com', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.2', 'Australia', 'Victoria', 'Melbourne', -37.8136, 144.9631, 'mobile', 'Safari', '17.0', 'iOS', '390x844', 'en-AU', 90, 60),
    ('/web-traffic-analytics', 'Web Traffic Analytics', 'session_3', 'https://facebook.com', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.3', 'Australia', 'Queensland', 'Brisbane', -27.4698, 153.0251, 'desktop', 'Safari', '17.0', 'macOS', '2560x1440', 'en-AU', 240, 85),
    ('/field-trials', 'Field Trials', 'session_4', 'https://twitter.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.4', 'Australia', 'Western Australia', 'Perth', -31.9505, 115.8605, 'desktop', 'Firefox', '120.0', 'Windows', '1366x768', 'en-US', 150, 70)
ON CONFLICT DO NOTHING;

INSERT INTO user_sessions (session_id, started_at, ended_at, duration, page_count, country, region, city, device_type, browser, operating_system, referrer, landing_page, exit_page, is_bounce)
VALUES 
    ('session_1', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes', 600, 2, 'Australia', 'New South Wales', 'Sydney', 'desktop', 'Chrome', 'Windows', 'https://google.com', '/dashboard', '/financial-analytics', false),
    ('session_2', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 58 minutes', 120, 1, 'Australia', 'Victoria', 'Melbourne', 'mobile', 'Safari', 'iOS', 'https://bing.com', '/financial-analytics', '/financial-analytics', true),
    ('session_3', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 56 minutes', 240, 1, 'Australia', 'Queensland', 'Brisbane', 'desktop', 'Safari', 'macOS', 'https://facebook.com', '/web-traffic-analytics', '/web-traffic-analytics', true),
    ('session_4', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 57 minutes', 150, 1, 'Australia', 'Western Australia', 'Perth', 'desktop', 'Firefox', 'Windows', 'https://twitter.com', '/field-trials', '/field-trials', true)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE page_views IS 'Tracks individual page views with detailed user and geographic information';
COMMENT ON TABLE user_sessions IS 'Tracks user sessions with duration and behavior metrics';
COMMENT ON TABLE user_events IS 'Tracks custom user events like clicks, form submissions, etc.';
COMMENT ON TABLE geographic_data IS 'Cached geographic information for IP addresses';
COMMENT ON TABLE performance_metrics IS 'Tracks page performance metrics like load times'; 