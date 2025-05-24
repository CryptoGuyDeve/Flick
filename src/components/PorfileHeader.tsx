import { useAuth } from "@/providers/AuthProvider";
import { getProfileById } from "@/services/profiles";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ActivityIndicator, Image, Pressable, Text, View, Share, Alert } from "react-native";
import SupabaseImage from "./SupabaseImage";
import { supabase } from "@/lib/supabase";

export default function ProfileHeader() {
  const { user } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfileById(user!.id),
    enabled: !!user?.id,
  });

  const handleShareProfile = async () => {
    try {
      if (!profile) return;

      const profileUrl = `https://flick.app/profile/${profile.username}`;
      const shareMessage = `Check out ${profile.full_name}'s profile on Flick!\n\n${profile.bio ? `Bio: ${profile.bio}\n\n` : ''}${profileUrl}`;

      const result = await Share.share({
        message: shareMessage,
        title: `${profile.full_name}'s Profile`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Failed to share profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View className="p-4 items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4">
        <Text className="text-red-500">Error: {error.message}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="p-4">
        <Text className="text-white">Profile not found</Text>
      </View>
    );
  }

  return (
    <View className="p-4 gap-4">
      <View className="flex-row items-center justify-between gap-2">
        <View className="gap-1">
          <Text className="text-white text-2xl font-bold">
            {profile.full_name || 'Anonymous'}
          </Text>
          <Text className="text-neutral-200 text-lg">
            @{profile.username || 'user'}
          </Text>
        </View>

        {profile.avatar_url ? (
          <SupabaseImage 
            bucket="avatars"
            path={profile.avatar_url.replace(/^.*\/avatars\//, '')}
            className="w-20 h-20 rounded-full"
          />
        ) : (
          <View className="w-20 h-20 rounded-full bg-neutral-700 items-center justify-center">
            <Text className="text-white text-2xl">
              {profile.full_name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
      </View>
      
      {profile.bio && (
        <Text className="text-neutral-200 leading-snug">{profile.bio}</Text>
      )}

      <View className="flex-row gap-2">
        <Link href="/profile/edit" asChild>
          <Pressable className="flex-1 py-2 rounded-lg border-2 bg-neutral-800">
            <Text className="text-center text-neutral-200">Edit Profile</Text>
          </Pressable>
        </Link>

        <Pressable 
          className="flex-1 py-2 rounded-lg border-2 bg-neutral-800"
          onPress={handleShareProfile}
        >
          <Text className="text-center text-neutral-200">Share Profile</Text>
        </Pressable>

        <Pressable 
          className="flex-1 py-2 rounded-lg border-2 bg-neutral-800"
          onPress={() => supabase.auth.signOut()}
        >
          <Text className="text-center text-neutral-200">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
