-- Supabase Costs Management Setup
-- This file sets up the costs table and related functionality

-- Create the costs table
CREATE TABLE IF NOT EXISTS costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_costs_user_id ON costs(user_id);
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(date);
CREATE INDEX IF NOT EXISTS idx_costs_category ON costs(category);
CREATE INDEX IF NOT EXISTS idx_costs_created_at ON costs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see their own costs
CREATE POLICY "Users can view own costs" ON costs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own costs
CREATE POLICY "Users can insert own costs" ON costs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own costs
CREATE POLICY "Users can update own costs" ON costs
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own costs
CREATE POLICY "Users can delete own costs" ON costs
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_costs_updated_at 
    BEFORE UPDATE ON costs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO costs (user_id, date, category, description, amount) VALUES
--     ('00000000-0000-0000-0000-000000000000', '2024-01-15', 'Fertilizers', 'Nitrogen fertilizer for corn field', 1250.00),
--     ('00000000-0000-0000-0000-000000000000', '2024-01-20', 'Pesticides', 'Herbicide application', 850.00),
--     ('00000000-0000-0000-0000-000000000000', '2024-02-01', 'Equipment', 'Tractor fuel', 320.00),
--     ('00000000-0000-0000-0000-000000000000', '2024-02-10', 'Labor', 'Seasonal worker wages', 1800.00),
--     ('00000000-0000-0000-0000-000000000000', '2024-02-15', 'Seeds', 'Corn seeds for planting', 2100.00);

-- Create a view for cost analytics (optional)
CREATE OR REPLACE VIEW cost_analytics AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    category,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM costs
GROUP BY user_id, DATE_TRUNC('month', date), category
ORDER BY user_id, month DESC, total_amount DESC;

-- Grant necessary permissions
GRANT ALL ON costs TO authenticated;
GRANT ALL ON cost_analytics TO authenticated; 