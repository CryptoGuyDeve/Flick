import { useAuth } from "@/providers/AuthProvider";
import { AntDesign } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View, Alert, Text } from "react-native";
import { createPost } from "@/services/post";

export default function PostReplyInput({ postId }: { postId: string }) {
  const [text, setText] = useState("");

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      createPost({ 
        content: text, 
        user_id: user!.id, 
        parent_id: postId 
      }),
    onSuccess: (newPost) => {
      setText("");
      
      // Update the parent post's replies in the cache
      queryClient.setQueryData(['post', postId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          replies: [...(oldData.replies || []), newPost]
        };
      });

      // Update the posts list if it exists
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((post: any) => {
          if (post.id === postId) {
            return {
              ...post,
              replies: [...(post.replies || []), newPost]
            };
          }
          return post;
        });
      });

      // Invalidate queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error: any) => {
      console.error('Error creating reply:', error);
      Alert.alert(
        "Error",
        error.message || "Failed to create reply. Please try again."
      );
    },
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    mutate();
  };

  return (
    <View className="p-4">
      <View className="flex-row items-center bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-xl">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add to flicker..."
          placeholderTextColor="#888"
          className="flex-1 text-white text-base"
          multiline
          style={{ textAlignVertical: "top", minHeight: 40 }}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={isPending || !text.trim()}
          className="ml-2"
        >
          <AntDesign
            name="pluscircleo"
            size={24}
            color={isPending || !text.trim() ? "#555" : "gainsboro"}
          />
        </Pressable>
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-2">
          {error.message || "Failed to create reply"}
        </Text>
      )}
    </View>
  );
}
