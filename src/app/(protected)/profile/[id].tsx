import { ActivityIndicator, FlatList, View } from "react-native";
import { Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getPostsByUserId } from "@/services/post";
import PostListItem from "@/components/PostListItem";
import { getProfileById } from "@/services/profiles";
import { useLocalSearchParams } from "expo-router";
import SupabaseImage from "@/components/SupabaseImage";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => getProfileById(id),
    enabled: !!id,
  });

  const {
    data: posts,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useQuery({
    queryKey: ["posts", { user_id: id }],
    queryFn: () => getPostsByUserId(id),
    enabled: !!id,
  });

  if (isLoadingProfile || isLoadingPosts) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (profileError || postsError) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Error: {profileError?.message || postsError?.message}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Profile not found</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View className="p-4 gap-4">
      <View className="flex-row items-center justify-between gap-2">
        <View className="gap-1">
          <Text className="text-white text-2xl font-bold">
            {profile?.full_name || 'Anonymous'}
          </Text>
          <Text className="text-neutral-200 text-lg">
            @{profile?.username || 'user'}
          </Text>
        </View>

        {profile?.avatar_url ? (
          <SupabaseImage 
            bucket="avatars"
            path={profile.avatar_url.replace(/^.*\/avatars\//, '')}
            className="w-20 h-20 rounded-full"
          />
        ) : (
          <View className="w-20 h-20 rounded-full bg-neutral-700 items-center justify-center">
            <Text className="text-white text-2xl">
              {profile?.full_name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
      </View>
      
      {profile?.bio && (
        <Text className="text-neutral-200 leading-snug">{profile.bio}</Text>
      )}

      <Text className="text-white text-lg font-bold mt-4">
        Flicks
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={posts || []}
        renderItem={({ item }) => <PostListItem post={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View className="p-4">
            <Text className="text-neutral-500 text-center">No posts yet</Text>
          </View>
        }
      />
    </View>
  );
} 