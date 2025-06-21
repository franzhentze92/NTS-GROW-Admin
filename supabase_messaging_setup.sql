-- Messaging System Database Setup for Supabase

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_id ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_is_starred ON messages(is_starred);
CREATE INDEX IF NOT EXISTS idx_messages_is_archived ON messages(is_archived);

-- Insert sample users with proper UUIDs
INSERT INTO users (id, name, email, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@ntsgrow.com', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'John Doe', 'john@ntsgrow.com', 'manager'),
    ('33333333-3333-3333-3333-333333333333', 'Jane Smith', 'jane@ntsgrow.com', 'analyst'),
    ('44444444-4444-4444-4444-444444444444', 'Mike Davis', 'mike@ntsgrow.com', 'developer'),
    ('55555555-5555-5555-5555-555555555555', 'Sarah Johnson', 'sarah@ntsgrow.com', 'designer')
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages with proper UUIDs
INSERT INTO messages (from_user_id, to_user_id, subject, content, priority, is_read, is_starred) VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Q1 Performance Review', 'Hi admin, I wanted to discuss the Q1 performance metrics and our upcoming strategies. The results show significant improvement in customer acquisition, but we need to focus more on retention rates. Can we schedule a meeting this week to review the detailed analytics?', 'High', false, false),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Website Analytics Update', 'Hello admin, The latest website traffic data shows interesting trends. We''ve seen a 25% increase in organic traffic and improved conversion rates. I''ve attached the detailed report for your review.', 'Medium', false, true),
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Task Calendar Updates', 'Hi admin, Several tasks have been updated in the calendar system. Please review your assigned tasks and update their status accordingly. The deadline for the monthly report is approaching.', 'Low', true, false),
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Meeting Schedule', 'Hi John, I''ve reviewed your Q1 performance request. Let''s schedule a meeting for this Friday at 2 PM. Please prepare the detailed metrics report.', 'Medium', false, false),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Analytics Review', 'Sarah, great work on the website analytics! The 25% increase is impressive. Let''s discuss how we can maintain this momentum in Q2.', 'Medium', false, true),
    ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Design System Update', 'Admin, I''ve completed the new design system documentation. It includes all the updated components and guidelines. Please review when you have time.', 'Low', false, false)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

-- Create RLS policies for messages table
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = from_user_id::text
    );

CREATE POLICY "Users can update messages they sent or received" ON messages
    FOR UPDATE USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

CREATE POLICY "Users can delete messages they sent or received" ON messages
    FOR DELETE USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 