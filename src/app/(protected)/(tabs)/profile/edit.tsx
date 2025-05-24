import UserAvatarPicker from "@/components/UserAvatarPicker";
import { useAuth } from "@/providers/AuthProvider";
import { getProfileById, updateProfile } from "@/services/profiles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  KeyboardTypeOptions,
} from "react-native";

export default function ProfileEditScreen() {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfileById(user!.id),
    enabled: !!user?.id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      console.log('Updating profile with avatar URL:', avatarUrl);
      const updatedProfile = await updateProfile(user!.id, {
        id: user!.id,
        full_name: fullName,
        bio: bio,
        username: username,
        website: website,
        avatar_url: avatarUrl,
      });
      console.log('Profile updated successfully:', updatedProfile);
      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      if (!updatedProfile) {
        console.error('Profile update returned null');
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      console.log('Updating cache and invalidating queries');
      
      // Update the profile cache immediately
      queryClient.setQueryData(["profile", user?.id], updatedProfile);
      
      // Update any posts that might show the user's avatar
      const postsQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      postsQueries.forEach(([queryKey, oldData]) => {
        if (Array.isArray(oldData)) {
          const updatedPosts = oldData.map((post: any) => {
            if (post.user?.id === user?.id) {
              return {
                ...post,
                user: {
                  ...post.user,
                  avatar_url: updatedProfile.avatar_url,
                },
              };
            }
            return post;
          });
          queryClient.setQueryData(queryKey, updatedPosts);
        }
      });

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["supabaseImage"] });
      
      router.back();
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });

  useEffect(() => {
    if (profile) {
      console.log('Setting initial profile data:', profile);
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
      setUsername(profile.username ?? "");
      setWebsite(profile.website ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  const handleAvatarUpload = (url: string) => {
    console.log('Avatar uploaded, new URL:', url);
    setAvatarUrl(url);
    
    // Update the profile cache immediately with the new avatar URL
    queryClient.setQueryData(["profile", user?.id], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        avatar_url: url,
      };
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#121212]"
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-semibold mb-6 text-white">Edit Profile</Text>

        {/* Avatar Section */}
        <UserAvatarPicker 
          currentAvatarUrl={profile?.avatar_url ?? ""} 
          onUpload={handleAvatarUpload} 
        />

        {/* Input Fields */}
        {[
          { label: "Name", value: fullName, setValue: setFullName, placeholder: "Full Name" },
          { label: "Username", value: username, setValue: setUsername, placeholder: "Username", autoCapitalize: "none" as const },
          { label: "Bio", value: bio, setValue: setBio, placeholder: "Bio", multiline: true, numberOfLines: 3 },
          { label: "Website", value: website, setValue: setWebsite, placeholder: "Website URL", keyboardType: "url" as KeyboardTypeOptions, autoCapitalize: "none" as const },
        ].map(({ label, value, setValue, placeholder, multiline, numberOfLines, keyboardType, autoCapitalize }) => (
          <View key={label} className="mb-6">
            <Text className="text-gray-300 font-medium mb-1">{label}</Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor="#666"
              multiline={multiline}
              numberOfLines={numberOfLines}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              className={`border border-gray-700 rounded-lg px-4 py-3 text-white ${
                multiline ? "text-base h-auto" : "text-base"
              } bg-[#1E1E1E]`}
              style={{ textAlignVertical: multiline ? "top" : "center" }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#121212]">
        <Pressable
          onPress={() => mutate()}
          disabled={isPending}
          className={`py-4 rounded-full items-center ${
            isPending ? "bg-blue-700" : "bg-blue-500"
          }`}
        >
          <Text className={`text-white font-semibold text-lg`}>
            {isPending ? "Saving..." : "Done"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
