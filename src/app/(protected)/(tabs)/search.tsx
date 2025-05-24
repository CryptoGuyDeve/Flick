import { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { debounce } from 'lodash';
import SupabaseImage from '@/components/SupabaseImage';
import PostListItem from '@/components/PostListItem';
import { Tables } from '@/types/database.types';
import { PostWithUser } from "@/types/post";

type SearchResult = {
  type: 'user' | 'post';
  data: PostWithUser | any;
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', searchQuery, activeTab],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const results: SearchResult[] = [];

      // Search users
      if (activeTab === 'all' || activeTab === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(5);

        if (users) {
          results.push(...users.map(user => ({ type: 'user' as const, data: user })));
        }
      }

      // Search posts
      if (activeTab === 'all' || activeTab === 'posts') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            *,
            user:profiles(*),
            replies:posts(count)
          `)
          .or(`content.ilike.%${searchQuery}%`)
          .limit(5);

        if (posts) {
          results.push(...posts.map(post => ({
            type: 'post' as const,
            data: {
              ...post,
              replies: post.replies || [{ count: 0 }],
              likes_count: 0,
              reposts_count: 0,
              is_liked: false,
              is_reposted: false
            } as PostWithUser
          })));
        }
      }

      return results;
    },
    enabled: searchQuery.length > 0,
  });

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setSearchQuery(text);
    }, 300),
    []
  );

  const handleSearch = (text: string) => {
    debouncedSearch(text);
  };

  const renderUserItem = ({ item }: { item: SearchResult }) => {
    if (item.type !== 'user') return null;
    const user = item.data as Tables<'profiles'>;

    return (
      <Pressable
        onPress={() => router.push(`/profile/${user.id}`)}
        className="flex-row items-center p-4 border-b border-neutral-800"
      >
        {user.avatar_url ? (
          <SupabaseImage
            bucket="avatars"
            path={user.avatar_url.replace(/^.*\/avatars\//, '')}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center mr-3">
            <Text className="text-white text-lg">
              {user.full_name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-white font-bold">{user.full_name}</Text>
          <Text className="text-gray-500">@{user.username}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#666" />
      </Pressable>
    );
  };

  const renderPostItem = ({ item }: { item: SearchResult }) => {
    if (item.type !== 'post') return null;
    return <PostListItem post={item.data as PostWithUser} />;
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    if (item.type === 'user') {
      return renderUserItem({ item });
    }
    return renderPostItem({ item });
  };

  return (
    <View className="flex-1 bg-black">
      {/* Search Header */}
      <View className="p-4 border-b border-neutral-800">
        <View className="flex-row items-center bg-neutral-800 rounded-full px-4">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search users and posts..."
            placeholderTextColor="#666"
            className="flex-1 py-3 px-2 text-white"
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row border-b border-neutral-800">
        {(['all', 'users', 'posts'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 ${
              activeTab === tab ? 'border-b-2 border-blue-500' : ''
            }`}
          >
            <Text
              className={`text-center capitalize ${
                activeTab === tab ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : searchQuery.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="search" size={50} color="#666" />
          <Text className="text-gray-500 text-center mt-4">
            Search for users or posts
          </Text>
        </View>
      ) : results?.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="search" size={50} color="#666" />
          <Text className="text-gray-500 text-center mt-4">
            No results found for "{searchQuery}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}