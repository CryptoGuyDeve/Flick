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
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
    mutationFn: () =>
      updateProfile(user!.id, {
        id: user!.id,
        full_name: fullName,
        bio: bio,
        username: username,
        website: website,
        avatar_url: avatarUrl,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      router.back();
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
      setUsername(profile.username ?? "");
      setWebsite(profile.website ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

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
        <View className="items-center mb-8">
          <View
            className="w-28 h-28 rounded-full bg-gray-800 overflow-hidden justify-center items-center"
            style={{ shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 10 }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 text-xl">No Avatar</Text>
            )}
          </View>
          {/* <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="Paste Avatar URL"
            placeholderTextColor="#666"
            className="mt-3 px-4 py-2 w-full border border-gray-700 rounded-full text-white text-center bg-[#1E1E1E]"
            autoCapitalize="none"
            keyboardType="url"
            returnKeyType="done"
          /> */}
        </View>

        {/* Input Fields */}
        {[
          { label: "Name", value: fullName, setValue: setFullName, placeholder: "Full Name" },
          { label: "Username", value: username, setValue: setUsername, placeholder: "Username", autoCapitalize: "none" },
          { label: "Bio", value: bio, setValue: setBio, placeholder: "Bio", multiline: true, numberOfLines: 3 },
          { label: "Website", value: website, setValue: setWebsite, placeholder: "Website URL", keyboardType: "url", autoCapitalize: "none" },
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
              autoCapitalize={autoCapitalize ?? "sentences"}
              className={`border border-gray-700 rounded-lg px-4 py-3 text-white ${
                multiline ? "text-base h-auto" : "text-base"
              } bg-[#1E1E1E]`}
              style={{ textAlignVertical: multiline ? "top" : "center" }}
            />
          </View>
        ))}

      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#121212] border-t border-gray-700">
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

    // 
  );
}
