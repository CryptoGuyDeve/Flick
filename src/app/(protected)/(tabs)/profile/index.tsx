import React from 'react';
import { ActivityIndicator, FlatList, View, Text, StyleSheet, Pressable } from "react-native";
import { router } from 'expo-router';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { getPostsByUserId } from "@/services/post";
import PostListItem from "@/components/PostListItem";
import { getProfileById } from "@/services/profiles";
import ProfileHeader from "@/components/PorfileHeader";
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  const { user } = useAuth();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", { user_id: user?.id }],
    queryFn: () => getPostsByUserId(user!.id),
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text className="text-white">Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Pressable 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </Pressable>
      </View>
      <View className="flex-1 justify-center">
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostListItem post={item} />}
          ListHeaderComponent={() => (
            <>
              <ProfileHeader />
              <Text className="text-white text-lg font-bold mt-4 m-2">
                Flicks
              </Text>
            </>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
});
