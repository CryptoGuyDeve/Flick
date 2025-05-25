import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';

export const followUser = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('followers')
    .insert({ 
      follower_id: user.id,
      following_id: followingId 
    });

  if (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getFollowers = async (userId: string): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      follower:profiles!follower_id(*)
    `)
    .eq('following_id', userId);

  if (error) {
    console.error('Error getting followers:', error);
    throw error;
  }

  return data.map(item => item.follower);
};

export const getFollowing = async (userId: string): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      following:profiles!following_id(*)
    `)
    .eq('follower_id', userId);

  if (error) {
    console.error('Error getting following:', error);
    throw error;
  }

  return data.map(item => item.following);
};

export const isFollowing = async (followingId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking follow status:', error);
    throw error;
  }

  return !!data;
}; 