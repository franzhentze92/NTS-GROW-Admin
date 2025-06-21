import { supabase } from './supabaseClient';
import { Message, CreateMessageData, UpdateMessageData } from './types';

// Get current user ID from localStorage or context
const getCurrentUserId = (): string => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    const userData = JSON.parse(user);
    return userData.id || '11111111-1111-1111-1111-111111111111'; // Default to admin user ID
  }
  return '11111111-1111-1111-1111-111111111111'; // Default admin user ID
};

// Fetch all messages for the current user (inbox)
export const fetchMessages = async (): Promise<Message[]> => {
  const currentUserId = getCurrentUserId();
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      from_user:users!messages_from_user_id_fkey(id, name, email),
      to_user:users!messages_to_user_id_fkey(id, name, email)
    `)
    .or(`to_user_id.eq.${currentUserId},from_user_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// Fetch sent messages
export const fetchSentMessages = async (): Promise<Message[]> => {
  const currentUserId = getCurrentUserId();
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      from_user:users!messages_from_user_id_fkey(id, name, email),
      to_user:users!messages_to_user_id_fkey(id, name, email)
    `)
    .eq('from_user_id', currentUserId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// Fetch archived messages
export const fetchArchivedMessages = async (): Promise<Message[]> => {
  const currentUserId = getCurrentUserId();
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      from_user:users!messages_from_user_id_fkey(id, name, email),
      to_user:users!messages_to_user_id_fkey(id, name, email)
    `)
    .or(`to_user_id.eq.${currentUserId},from_user_id.eq.${currentUserId}`)
    .eq('is_archived', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// Create a new message
export const createMessage = async (messageData: CreateMessageData): Promise<Message> => {
  const currentUserId = getCurrentUserId();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      from_user_id: currentUserId,
      to_user_id: messageData.to_user_id,
      subject: messageData.subject,
      content: messageData.content,
      priority: messageData.priority,
      is_read: false,
      is_starred: false,
      is_archived: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Update message (mark as read, star, archive)
export const updateMessage = async (messageId: string, updates: UpdateMessageData): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw new Error(error.message);
};

// Fetch all users for compose message
export const fetchUsers = async (): Promise<{ id: string; name: string; email: string }[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  await updateMessage(messageId, { is_read: true });
};

// Toggle message starred status
export const toggleMessageStarred = async (messageId: string, isStarred: boolean): Promise<void> => {
  await updateMessage(messageId, { is_starred: isStarred });
};

// Archive/Unarchive message
export const toggleMessageArchived = async (messageId: string, isArchived: boolean): Promise<void> => {
  await updateMessage(messageId, { is_archived: isArchived });
}; 