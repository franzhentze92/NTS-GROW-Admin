-- Add expense_type column to costs table
-- This script adds a new column to distinguish between monthly and one-time expenses

-- Add the expense_type column
ALTER TABLE costs 
ADD COLUMN IF NOT EXISTS expense_type VARCHAR(20) NOT NULL DEFAULT 'one_time' 
CHECK (expense_type IN ('monthly', 'one_time'));

-- Add an index for better performance on expense_type queries
CREATE INDEX IF NOT EXISTS idx_costs_expense_type ON costs(expense_type);

-- Update the cost_analytics view to include expense_type
DROP VIEW IF EXISTS cost_analytics;
CREATE OR REPLACE VIEW cost_analytics AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    category,
    expense_type,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM costs
GROUP BY user_id, DATE_TRUNC('month', date), category, expense_type
ORDER BY user_id, month DESC, total_amount DESC;

-- Create a new view for monthly vs one-time expense analysis
CREATE OR REPLACE VIEW expense_type_analytics AS
SELECT 
    user_id,
    expense_type,
    category,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(date) as first_expense_date,
    MAX(date) as last_expense_date
FROM costs
GROUP BY user_id, expense_type, category
ORDER BY user_id, expense_type, total_amount DESC;

-- Grant permissions on the new view
GRANT ALL ON expense_type_analytics TO authenticated; 