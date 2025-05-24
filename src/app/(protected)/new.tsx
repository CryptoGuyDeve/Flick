import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { use, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { createPost } from "@/services/post";
import { Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getProfileById } from "@/services/profiles";
import SupabaseImage from "@/components/SupabaseImage";

export default function NewPostScreen() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfileById(user!.id),
    enabled: !!user?.id,
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!text.trim() && !image) {
        throw new Error("Post cannot be empty");
      }

      setIsUploading(true);
      try {
        let imagePath = null;
        if (image) {
          imagePath = await uploadImage();
        }

        const post = await createPost({
          content: text.trim(),
          user_id: user!.id,
          images: imagePath ? [imagePath] : [],
        });

        return post;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (data) => {
      // Clear form
      setText("");
      setImage(null);
      
      // Update cache optimistically
      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return [data];
        return [data, ...oldData];
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      
      // Navigate back
      router.back();
    },
    onError: (error: Error) => {
      console.error("Post creation error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create post. Please try again."
      );
    },
  });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImage = async () => {
    if (!image) return null;
    
    try {
      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      return data.path;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const handlePost = useCallback(() => {
    if (isPending || isUploading) return;
    mutate();
  }, [isPending, isUploading, mutate]);

  if (isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="p-4 flex-1 bg-[#121212]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 0}
      >
        <View className="flex-row items-start gap-3 mb-4">
          {/* User Avatar */}
          {profile?.avatar_url ? (
            <SupabaseImage
              bucket="avatars"
              path={profile.avatar_url.replace(/^.*\/avatars\//, '')}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center">
              <Text className="text-white text-lg">
                {profile?.full_name?.charAt(0) || '?'}
              </Text>
            </View>
          )}

          {/* User Info and Post Input */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-white font-bold">{profile?.full_name}</Text>
              <Text className="text-gray-500">@{profile?.username}</Text>
            </View>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="What's on your mind?"
              placeholderTextColor="gray"
              className="text-white text-lg"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        </View>

        {image && (
          <View className="relative">
            <Image
              source={{ uri: image.uri }}
              className="w-1/2 rounded-lg my-4"
              style={{ aspectRatio: image.width / image.height }}
            />
            <Pressable
              onPress={() => setImage(null)}
              className="absolute top-2 left-2 bg-black/50 rounded-full p-1"
            >
              <Entypo name="cross" size={20} color="white" />
            </Pressable>
          </View>
        )}

        {error && (
          <Text className="text-red-500 text-sm mt-4">{error.message}</Text>
        )}

        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={pickImage}
              className="p-2 rounded-full bg-neutral-800"
              disabled={isPending || isUploading}
            >
              <Entypo name="images" size={20} color="white" />
            </Pressable>
            {image && (
              <Text className="text-gray-400 text-sm">
                Image selected
              </Text>
            )}
          </View>

          <Text className="text-gray-400 text-sm">
            {text.length}/500
          </Text>
        </View>

        <View className="absolute bottom-9 right-1">
          <Pressable
            onPress={handlePost}
            className={`${
              (isPending || isUploading || (!text.trim() && !image))
                ? "bg-white/50"
                : "bg-white"
            } p-3 px-6 self-end rounded-full`}
            disabled={isPending || isUploading || (!text.trim() && !image)}
          >
            {isPending || isUploading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text className="text-black font-bold">Post</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
