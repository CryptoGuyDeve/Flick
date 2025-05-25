import { View, Text, FlatList, Pressable, ActivityIndicator, Image, TextInput, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import PostListItem from '@/components/PostListItem';
import { PostWithUser } from '@/types/post';
import { useState, useMemo, useCallback } from 'react';

type TrendingHashtag = {
  tag: string;
  count: number;
};

type TrendingUser = {
  id: string;
  username: string;
  avatar_url: string;
  post_count: number;
};

const categories = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'tech', name: 'Tech', icon: 'code' },
  { id: 'music', name: 'Music', icon: 'musical-notes' },
  { id: 'art', name: 'Art', icon: 'image' },
  { id: 'food', name: 'Food', icon: 'restaurant' },
  { id: 'travel', name: 'Travel', icon: 'location' },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch trending posts
  const { data: trendingPosts, isLoading: isLoadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['trending-posts', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:profiles(*),
          likes:likes(*),
          replies:posts!parent_id(*)
        `)
        .is('parent_id', null);

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.ilike('content', `%#${selectedCategory}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(10);
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      return data as PostWithUser[];
    },
  });

  // Fetch trending hashtags
  const { data: trendingHashtags, isLoading: isLoadingHashtags, refetch: refetchHashtags } = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('content')
        .is('parent_id', null);

      if (error) {
        console.error('Error fetching hashtags:', error);
        throw error;
      }

      const hashtagCounts = new Map<string, number>();
      posts?.forEach(post => {
        const hashtags = post.content.match(/#\w+/g) || [];
        hashtags.forEach(tag => {
          hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
        });
      });

      return Array.from(hashtagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // Fetch trending users
  const { data: trendingUsers, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['trending-users'],
    queryFn: async () => {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('user_id')
        .is('parent_id', null);

      if (postsError) {
        console.error('Error fetching user posts:', postsError);
        throw postsError;
      }

      const userPostCounts = new Map<string, number>();
      posts?.forEach(post => {
        userPostCounts.set(post.user_id, (userPostCounts.get(post.user_id) || 0) + 1);
      });

      const userIds = Array.from(userPostCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      return users?.map(user => ({
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        post_count: userPostCounts.get(user.id) || 0,
      })) as TrendingUser[];
    },
  });

  // Filter hashtags based on search query
  const filteredHashtags = useMemo(() => {
    if (!searchQuery) return trendingHashtags;
    return trendingHashtags?.filter(hashtag => 
      hashtag.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trendingHashtags, searchQuery]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return trendingUsers;
    return trendingUsers?.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trendingUsers, searchQuery]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchPosts(),
      refetchHashtags(),
      refetchUsers(),
    ]);
  }, [refetchPosts, refetchHashtags, refetchUsers]);

  const renderHashtag = ({ item }: { item: TrendingHashtag }) => (
    <Link href={`/hashtag/${item.tag}`} asChild>
      <Pressable className="p-4 border-b border-neutral-800">
        <Text className="text-blue-500 text-lg font-bold">{item.tag}</Text>
        <Text className="text-neutral-500">{item.count} posts</Text>
      </Pressable>
    </Link>
  );

  const renderUser = ({ item }: { item: TrendingUser }) => (
    <Link href={`/profile/${item.id}`} asChild>
      <Pressable className="flex-row items-center p-4 border-b border-neutral-800">
        <Image
          source={{ uri: item.avatar_url }}
          className="w-12 h-12 rounded-full mr-4"
        />
        <View>
          <Text className="text-white font-bold">{item.username}</Text>
          <Text className="text-neutral-500">{item.post_count} posts</Text>
        </View>
      </Pressable>
    </Link>
  );

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <Pressable 
      className="items-center p-4"
      onPress={() => setSelectedCategory(item.id)}
    >
      <View className={`w-16 h-16 rounded-full ${selectedCategory === item.id ? 'bg-blue-500' : 'bg-neutral-800'} items-center justify-center mb-2`}>
        <Ionicons name={item.icon as any} size={24} color="#fff" />
      </View>
      <Text className={`${selectedCategory === item.id ? 'text-blue-500' : 'text-white'}`}>{item.name}</Text>
    </Pressable>
  );

  const isLoading = isLoadingPosts || isLoadingHashtags || isLoadingUsers;

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="p-4 border-b border-neutral-800">
        <Text className="text-white text-2xl font-bold">Explore</Text>
      </View>

      {/* Search Bar */}
      <View className="p-4 border-b border-neutral-800">
        <View className="flex-row items-center bg-neutral-800 rounded-full px-4">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 text-white p-2"
            placeholder="Search hashtags and users..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={[1]} // Single item to render the entire content
          renderItem={() => (
            <>
              {/* Categories */}
              <View className="border-b border-neutral-800">
                <View className="p-4 border-b border-neutral-800">
                  <Text className="text-white text-lg font-bold">Categories</Text>
                </View>
                <FlatList
                  data={categories}
                  renderItem={renderCategory}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                />
              </View>

              {/* Trending Hashtags */}
              <View className="border-b border-neutral-800">
                <View className="p-4 border-b border-neutral-800">
                  <Text className="text-white text-lg font-bold">Trending Hashtags</Text>
                </View>
                <FlatList
                  data={filteredHashtags}
                  renderItem={renderHashtag}
                  keyExtractor={(item) => item.tag}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                  ListEmptyComponent={
                    <View className="p-4">
                      <Text className="text-neutral-500">No hashtags found</Text>
                    </View>
                  }
                />
              </View>

              {/* Trending Users */}
              <View className="border-b border-neutral-800">
                <View className="p-4 border-b border-neutral-800">
                  <Text className="text-white text-lg font-bold">Trending Users</Text>
                </View>
                <FlatList
                  data={filteredUsers}
                  renderItem={renderUser}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                  ListEmptyComponent={
                    <View className="p-4">
                      <Text className="text-neutral-500">No users found</Text>
                    </View>
                  }
                />
              </View>

              {/* Trending Posts */}
              <View className="flex-1">
                <View className="p-4 border-b border-neutral-800">
                  <Text className="text-white text-lg font-bold">
                    {selectedCategory === 'all' ? 'Trending Posts' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Posts`}
                  </Text>
                </View>
                {trendingPosts?.map((post) => (
                  <PostListItem key={post.id} post={post} />
                ))}
                {(!trendingPosts || trendingPosts.length === 0) && (
                  <View className="p-4">
                    <Text className="text-neutral-500 text-center">No posts found</Text>
                  </View>
                )}
              </View>
            </>
          )}
          keyExtractor={() => 'explore-content'}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#fff"
            />
          }
        />
      )}
    </View>
  );
} 