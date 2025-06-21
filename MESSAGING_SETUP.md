# Messaging System Setup Guide

This guide will help you activate the real messaging system in your NTS G.R.O.W admin platform.

## Prerequisites

- Supabase project with database access
- Supabase CLI (optional, for local development)

## Database Setup

### 1. Create Database Tables

Run the SQL script `supabase_messaging_setup.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_messaging_setup.sql`
4. Execute the script

This will create:
- `users` table with sample users
- `messages` table for storing messages
- Proper indexes for performance
- Row Level Security (RLS) policies
- Sample data for testing

### 2. Verify Table Creation

After running the script, verify that the tables were created:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'messages');

-- Check sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM messages LIMIT 5;
```

## Features Implemented

### ✅ Real-time Messaging
- Messages are stored in Supabase database
- Real-time updates using Supabase subscriptions
- Automatic message refresh when new messages arrive

### ✅ Message Management
- **Compose**: Create and send new messages
- **Reply**: Reply to existing messages
- **Star**: Mark important messages
- **Archive**: Archive/unarchive messages
- **Delete**: Permanently delete messages
- **Mark as Read**: Automatic read status when viewing

### ✅ Message Organization
- **Inbox**: All received messages
- **Sent**: Messages you've sent
- **Archived**: Archived messages
- **Search**: Search through messages by sender, subject, or content

### ✅ Priority System
- **High**: Red badge for urgent messages
- **Medium**: Orange badge for normal priority
- **Low**: Green badge for low priority

### ✅ User Interface
- Modern, responsive design
- Message previews with sender info
- Unread message indicators
- Real-time statistics
- Loading states and error handling

## Usage

### Sending Messages
1. Click the "Compose" button in the inbox
2. Select a recipient from the dropdown
3. Enter subject and message content
4. Choose priority level
5. Click "Send Message"

### Managing Messages
- **View**: Click on any message to view full content
- **Star**: Click the star icon to mark as important
- **Archive**: Click the archive icon to archive/unarchive
- **Delete**: Click the trash icon to delete
- **Reply**: Use the reply form at the bottom of message view

### Navigation
- Use the tabs to switch between Inbox, Sent, and Archived
- Use the search bar to find specific messages
- View real-time statistics in the cards at the top

## Sample Data

The setup script includes sample users and messages:

**Users:**
- Admin User (admin@ntsgrow.com)
- John Doe (john@ntsgrow.com)
- Jane Smith (jane@ntsgrow.com)
- Mike Davis (mike@ntsgrow.com)
- Sarah Johnson (sarah@ntsgrow.com)

**Sample Messages:**
- Q1 Performance Review (High priority)
- Website Analytics Update (Medium priority, starred)
- Task Calendar Updates (Low priority, read)
- Meeting Schedule (Medium priority)
- Analytics Review (Medium priority, starred)
- Design System Update (Low priority)

## Security

The system includes Row Level Security (RLS) policies that ensure:
- Users can only view messages they sent or received
- Users can only modify their own messages
- All users can view the user list for composing messages

## Troubleshooting

### Messages not loading
- Check your Supabase connection in `src/lib/supabaseClient.ts`
- Verify the tables exist in your database
- Check browser console for errors

### Real-time not working
- Ensure Supabase real-time is enabled in your project
- Check that the subscription is properly set up
- Verify RLS policies allow the current user to access messages

### Compose dialog not working
- Check that the `users` table has data
- Verify the `fetchUsers` function is working
- Check browser console for API errors

## Next Steps

Once the messaging system is working, you can:

1. **Add email notifications** using Supabase Edge Functions
2. **Implement file attachments** for messages
3. **Add message threading** for conversations
4. **Create message templates** for common communications
5. **Add message encryption** for sensitive communications
6. **Implement message scheduling** for future delivery

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all database tables and policies are created correctly
4. Test with the sample data provided 