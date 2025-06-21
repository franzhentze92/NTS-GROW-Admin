import { supabase } from './supabaseClient';
import { User } from './types';

const PROFILE_PICTURES_BUCKET = 'profile-pictures';

export interface UpdateUserData {
  name?: string;
  address?: string;
  phone_number?: string;
  avatar_url?: string;
}

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
};

export const updateUserProfile = async (userId: string, updates: UpdateUserData): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }

    const userString = localStorage.getItem('currentUser');
    if(userString) {
        const currentUser = JSON.parse(userString);
        const updatedUser = { ...currentUser, ...data };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    return data;
};

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}.${fileExtension}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_PICTURES_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading profile picture:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(PROFILE_PICTURES_BUCKET)
    .getPublicUrl(filePath);

  if (!data.publicUrl) {
      throw new Error('Could not get public URL for profile picture.');
  }
  
  const publicUrlWithCacheBuster = `${data.publicUrl}?t=${new Date().getTime()}`;

  await updateUserProfile(userId, { avatar_url: publicUrlWithCacheBuster });

  return publicUrlWithCacheBuster;
}; 