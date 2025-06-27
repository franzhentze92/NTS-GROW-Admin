-- Video Management Database Setup for G.R.O.W Education Platform
-- This schema handles video metadata, upload status, and YouTube integration

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    season INTEGER NOT NULL,
    episode INTEGER NOT NULL,
    language VARCHAR(50) NOT NULL,
    tags TEXT[], -- Array of tags
    category_id VARCHAR(10) DEFAULT '27', -- YouTube category ID (27 = Education)
    privacy_status VARCHAR(20) DEFAULT 'unlisted' CHECK (privacy_status IN ('private', 'unlisted', 'public')),
    google_drive_file_id VARCHAR(255),
    youtube_video_id VARCHAR(20),
    upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
    upload_date TIMESTAMP WITH TIME ZONE,
    duration VARCHAR(10), -- Format: MM:SS
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_videos_season_episode ON videos(season, episode);
CREATE INDEX IF NOT EXISTS idx_videos_language ON videos(language);
CREATE INDEX IF NOT EXISTS idx_videos_upload_status ON videos(upload_status);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_video_id);

-- Create video upload logs table for tracking upload progress
CREATE TABLE IF NOT EXISTS video_upload_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'uploading', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video playlists table for organizing videos
CREATE TABLE IF NOT EXISTS video_playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    season INTEGER,
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_videos junction table
CREATE TABLE IF NOT EXISTS playlist_videos (
    playlist_id UUID REFERENCES video_playlists(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (playlist_id, video_id)
);

-- Create video analytics table for tracking views and engagement
CREATE TABLE IF NOT EXISTS video_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    watch_time_minutes INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read videos
CREATE POLICY "Allow authenticated users to read videos" ON videos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow super-admin to manage all videos
CREATE POLICY "Allow super-admin to manage videos" ON videos
    FOR ALL USING (auth.jwt() ->> 'role' = 'super-admin');

-- Policy: Allow admin to manage videos
CREATE POLICY "Allow admin to manage videos" ON videos
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for video_upload_logs table
ALTER TABLE video_upload_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read upload logs
CREATE POLICY "Allow authenticated users to read upload logs" ON video_upload_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow super-admin and admin to manage upload logs
CREATE POLICY "Allow super-admin and admin to manage upload logs" ON video_upload_logs
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('super-admin', 'admin')
    );

-- Create RLS policies for video_playlists table
ALTER TABLE video_playlists ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read playlists
CREATE POLICY "Allow authenticated users to read playlists" ON video_playlists
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow super-admin and admin to manage playlists
CREATE POLICY "Allow super-admin and admin to manage playlists" ON video_playlists
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('super-admin', 'admin')
    );

-- Create RLS policies for playlist_videos table
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read playlist videos
CREATE POLICY "Allow authenticated users to read playlist videos" ON playlist_videos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow super-admin and admin to manage playlist videos
CREATE POLICY "Allow super-admin and admin to manage playlist videos" ON playlist_videos
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('super-admin', 'admin')
    );

-- Create RLS policies for video_analytics table
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read analytics
CREATE POLICY "Allow authenticated users to read analytics" ON video_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow super-admin and admin to manage analytics
CREATE POLICY "Allow super-admin and admin to manage analytics" ON video_analytics
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('super-admin', 'admin')
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_playlists_updated_at BEFORE UPDATE ON video_playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create analytics record when video is created
CREATE OR REPLACE FUNCTION create_video_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO video_analytics (video_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic analytics creation
CREATE TRIGGER create_video_analytics_trigger AFTER INSERT ON videos
    FOR EACH ROW EXECUTE FUNCTION create_video_analytics();

-- Insert sample data for testing
INSERT INTO videos (title, description, season, episode, language, tags, google_drive_file_id, upload_status) VALUES
('Introduction to Soil Health - English', 'Learn the fundamentals of soil health and why it matters for sustainable agriculture.', 1, 1, 'English', ARRAY['soil health', 'basics', 'introduction', 'education'], 'mock-drive-file-id-1', 'pending'),
('Introduction to Soil Health - Spanish', 'Aprende los fundamentos de la salud del suelo y por qué es importante para la agricultura sostenible.', 1, 1, 'Spanish', ARRAY['soil health', 'basics', 'introduction', 'education', 'spanish'], 'mock-drive-file-id-2', 'pending'),
('Microbial Products Overview - English', 'Understanding different types of microbial products and their applications.', 1, 2, 'English', ARRAY['microbial products', 'applications', 'overview', 'education'], 'mock-drive-file-id-3', 'pending'),
('Microbial Products Overview - Spanish', 'Comprensión de diferentes tipos de productos microbianos y sus aplicaciones.', 1, 2, 'Spanish', ARRAY['microbial products', 'applications', 'overview', 'education', 'spanish'], 'mock-drive-file-id-4', 'pending')
ON CONFLICT DO NOTHING;

-- Create sample playlists
INSERT INTO video_playlists (name, description, season, language) VALUES
('Season 1 - English', 'Complete Season 1 in English', 1, 'English'),
('Season 1 - Spanish', 'Complete Season 1 in Spanish', 1, 'Spanish'),
('Soil Health Series', 'Comprehensive soil health education series', NULL, NULL)
ON CONFLICT DO NOTHING; 