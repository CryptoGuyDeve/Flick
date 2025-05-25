import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, Link } from 'expo-router';
import { getFollowers, getFollowing } from '@/services/followers';
import { useState } from 'react';

type User = {
  id: string;
  username: string;
  avatar_url: string;
};

export default function FollowersScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'followers' | 'following' }>();
  const [isLoading, setIsLoading] = useState(false);

  const { data: users } = useQuery({
    queryKey: [type, id],
    queryFn: async () => {
      setIsLoading(true);
      try {
        if (type === 'followers') {
          return await getFollowers(id);
        } else {
          return await getFollowing(id);
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const renderUser = ({ item }: { item: User }) => (
    <Link href={`/profile/${item.id}`} asChild>
      <Pressable className="flex-row items-center p-4 border-b border-neutral-800">
        <Image
          source={{ uri: item.avatar_url }}
          className="w-12 h-12 rounded-full mr-4"
        />
        <Text className="text-white font-bold">{item.username}</Text>
      </Pressable>
    </Link>
  );

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
        <Text className="text-white text-2xl font-bold">
          {type === 'followers' ? 'Followers' : 'Following'}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="p-4">
            <Text className="text-neutral-500 text-center">
              No {type} found
            </Text>
          </View>
        }
      />
    </View>
  );
} 