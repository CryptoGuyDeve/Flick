import { View, Text, FlatList, Pressable, Image, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import PostListItem from '@/components/PostListItem';
import { PostWithUser } from '@/types/post';
import { followUser, unfollowUser, isFollowing } from '@/services/followers';
import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { getProfile } from '@/services/profile';
import { getPostsByUserId } from '@/services/post';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Get profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id as string),
    enabled: !!id,
  });

  // Get posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts', 'user', id],
    queryFn: () => getPostsByUserId(id as string),
    enabled: !!id,
  });

  // Check if following
  const { data: following } = useQuery({
    queryKey: ['following', id],
    queryFn: () => isFollowing(id),
    enabled: !!user && user.id !== id,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (following) {
        await unfollowUser(id);
      } else {
        await followUser(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', id] });
    },
  });

  // Get follower count
  const { data: followerCount } = useQuery({
    queryKey: ['follower-count', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_follower_count', { user_id: id });

      if (error) {
        console.error('Error getting follower count:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  // Get following count
  const { data: followingCount } = useQuery({
    queryKey: ['following-count', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_following_count', { user_id: id });

      if (error) {
        console.error('Error getting following count:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', id] }),
        queryClient.invalidateQueries({ queryKey: ['posts', 'user', id] }),
        queryClient.invalidateQueries({ queryKey: ['follower-count', id] }),
        queryClient.invalidateQueries({ queryKey: ['following-count', id] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, id]);

  if (isLoadingProfile || isLoadingPosts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!profile || !posts) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => setAvatarError(false)}>
            <Image 
              source={{ 
                uri: avatarError ? DEFAULT_AVATAR : (profile.avatar_url || DEFAULT_AVATAR)
              }} 
              style={styles.avatar}
              onError={() => setAvatarError(true)}
            />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.username}>{profile.username}</Text>
            <Text style={styles.bio}>{profile.bio || 'No bio yet'}</Text>
          </View>
          {isOwnProfile && (
            <Pressable 
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </Pressable>
          )}
        </View>

        {/* Follow Button */}
        {!isOwnProfile && (
          <Pressable
            style={[styles.followButton, following && styles.followingButton]}
            onPress={() => followMutation.mutate()}
            disabled={followMutation.isPending}
          >
            <Text style={styles.followButtonText}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Pressable 
            style={styles.statItem}
            onPress={() => router.push(`/followers?userId=${id}`)}
          >
            <Text style={styles.statValue}>{followerCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </Pressable>
          <Pressable 
            style={styles.statItem}
            onPress={() => router.push(`/following?userId=${id}`)}
          >
            <Text style={styles.statValue}>{followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </Pressable>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostListItem post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#333',
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    color: '#888',
  },
  settingsButton: {
    padding: 8,
  },
  followButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  followingButton: {
    backgroundColor: '#333',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  postsList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
}); 