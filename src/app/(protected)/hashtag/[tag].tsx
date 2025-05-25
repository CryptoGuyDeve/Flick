import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import PostListItem from '@/components/PostListItem';
import { PostWithUser } from '@/types/post';

export default function HashtagScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['hashtag', tag],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(*),
          likes:likes(*),
          replies:posts!parent_id(*)
        `)
        .is('parent_id', null)
        .ilike('content', `%${tag}%`)
        .order('created_at', { ascending: false });

      return data as PostWithUser[];
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="p-4 border-b border-neutral-800">
        <Text className="text-white text-2xl font-bold">{tag}</Text>
        <Text className="text-neutral-500">{posts?.length || 0} posts</Text>
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostListItem post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-neutral-500 text-center">
              No posts found with this hashtag
            </Text>
          </View>
        }
      />
    </View>
  );
} 