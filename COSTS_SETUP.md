# Costs Management - Supabase Setup Guide

This guide will help you set up the Supabase database for cost management functionality.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and anon key

## Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Run the Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_costs_setup.sql`
4. Run the SQL script

This will create:
- `costs` table with proper schema
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps
- Analytics view

## Step 3: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Cost Management page
3. Try adding a new cost entry
4. Check that data persists after page refresh

## Database Schema

The `costs` table includes:

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- date: DATE (Required)
- category: VARCHAR(100) (Required)
- description: TEXT (Required)
- amount: DECIMAL(10,2) (Required, >= 0)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

## Security Features

- **Row Level Security (RLS)**: Users can only access their own costs
- **User Authentication**: All operations require authenticated users
- **Data Validation**: Amount must be non-negative
- **Automatic Timestamps**: Created and updated timestamps are managed automatically

## API Functions

The integration provides these functions:

- `fetchCosts()`: Get all costs for current user
- `addCost(data)`: Add new cost entry
- `updateCost(id, data)`: Update existing cost
- `deleteCost(id)`: Delete cost entry
- `fetchCostsByDateRange(start, end)`: Filter by date range
- `fetchCostsByCategory(category)`: Filter by category
- `getTotalCosts(startDate?, endDate?)`: Get total for period

## Troubleshooting

### "No authenticated user found" Error
- Ensure you have authentication set up in your app
- Check that the user is logged in before accessing cost features

### Database Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure the SQL setup script ran successfully

### RLS Policy Errors
- Make sure the RLS policies were created correctly
- Verify the user has the correct permissions

## Next Steps

Once the basic setup is working:

1. **Add Authentication**: Implement user login/signup if not already done
2. **Add Real-time Features**: Enable real-time subscriptions for live updates
3. **Add Export Features**: Implement CSV/PDF export functionality
4. **Add Advanced Analytics**: Use the cost_analytics view for reporting

## Sample Data (Optional)

To add sample data for testing, uncomment and modify the INSERT statements in `supabase_costs_setup.sql`:

```sql
INSERT INTO costs (user_id, date, category, description, amount) VALUES
    ('your-user-id', '2024-01-15', 'Fertilizers', 'Nitrogen fertilizer for corn field', 1250.00),
    ('your-user-id', '2024-01-20', 'Pesticides', 'Herbicide application', 850.00);
```

Replace `'your-user-id'` with an actual user ID from your auth.users table. 