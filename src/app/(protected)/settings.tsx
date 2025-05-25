import { View, Text, StyleSheet, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { getProfile } from '@/services/profile';
import { getPostsByUserId } from '@/services/post';
import { getFollowers, getFollowing } from '@/services/followers';

export default function SettingsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Get profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user?.id as string),
    enabled: !!user?.id,
  });

  // Get posts
  const { data: posts } = useQuery({
    queryKey: ['posts', 'user', user?.id],
    queryFn: () => getPostsByUserId(user?.id as string),
    enabled: !!user?.id,
  });

  // Get followers
  const { data: followers } = useQuery({
    queryKey: ['followers', user?.id],
    queryFn: () => getFollowers(user?.id as string),
    enabled: !!user?.id,
  });

  // Get following
  const { data: following } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => getFollowing(user?.id as string),
    enabled: !!user?.id,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['posts', 'user', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['followers', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['following', user?.id] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, user?.id]);

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ 
              uri: profile.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
            }} 
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{profile.username}</Text>
            <Text style={styles.bio}>{profile.bio || 'No bio yet'}</Text>
          </View>
        </View>

        {/* Social Stats */}
        <View style={styles.statsContainer}>
          <Pressable 
            style={styles.statItem}
            onPress={() => router.push(`/followers?userId=${user?.id}`)}
          >
            <Text style={styles.statValue}>{followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </Pressable>
          <Pressable 
            style={styles.statItem}
            onPress={() => router.push(`/following?userId=${user?.id}`)}
          >
            <Text style={styles.statValue}>{following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </Pressable>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts?.length || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Pressable 
          style={styles.settingItem}
          onPress={() => router.push('/edit-profile')}
        >
          <Ionicons name="person-outline" size={24} color="#fff" />
          <Text style={styles.settingText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
        <Pressable style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
        <Pressable style={styles.settingItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#fff" />
          <Text style={styles.settingText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
      </View>

      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <Pressable style={styles.settingItem}>
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
          <Text style={styles.settingText}>Help Center</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
        <Pressable style={styles.settingItem}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
          <Text style={styles.settingText}>About</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <Pressable style={[styles.settingItem, styles.dangerItem]}>
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
          <Text style={[styles.settingText, styles.dangerText]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
      </View>
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
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#333',
  },
  profileInfo: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#ff4444',
  },
}); 