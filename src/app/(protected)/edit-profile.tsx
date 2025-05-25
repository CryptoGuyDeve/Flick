import { View, Text, StyleSheet, TextInput, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/services/profile';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user?.id as string),
    enabled: !!user?.id,
    onSuccess: (data) => {
      setUsername(data.username);
      setBio(data.bio || '');
      setFullName(data.full_name || '');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates: { username: string; bio: string; full_name: string }) =>
      updateProfile(user?.id as string, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      router.back();
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      username,
      bio,
      full_name: fullName,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={updateMutation.isPending}>
          <Text style={styles.saveButton}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <Image
            source={{
              uri: profile?.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
            }}
            style={styles.avatar}
          />
          <Pressable style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>Change Avatar</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Write something about yourself"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    color: '#1DA1F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changeAvatarButton: {
    padding: 8,
  },
  changeAvatarText: {
    color: '#1DA1F2',
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
}); 