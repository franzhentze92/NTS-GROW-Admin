import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { fetchUserProfile, updateUserProfile, uploadProfilePicture } from '@/lib/userApi';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@/lib/types';

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setAddress(profileData.address || '');
      setPhone(profileData.phone_number || '');
      setAvatarUrl(profileData.avatar_url || '');
    }
  }, [profileData]);
  
  const updateProfileMutation = useMutation({
    mutationFn: (updates: any) => updateUserProfile(userId!, updates),
    onSuccess: () => {
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: (error) => {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => uploadProfilePicture(userId!, file),
    onSuccess: (newUrl) => {
      toast({ title: 'Avatar Updated', description: 'Your new avatar has been uploaded.' });
      setAvatarUrl(newUrl);
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: (error) => {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAvatarFile) {
      uploadAvatarMutation.mutate(newAvatarFile);
    }
    updateProfileMutation.mutate({ name, address, phone_number: phone });
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'AU';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (isLoadingProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Change Avatar</Label>
                <Input 
                  id="picture" 
                  type="file" 
                  onChange={(e) => setNewAvatarFile(e.target.files ? e.target.files[0] : null)}
                  accept="image/png, image/jpeg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
            <CardFooter className="px-0">
              <Button type="submit" disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending}>
                {updateProfileMutation.isPending || uploadAvatarMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage; 