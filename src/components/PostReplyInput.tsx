import { useAuth } from "@/providers/AuthProvider";
import { AntDesign } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { createPost } from "@/services/post";

export default function PostReplyInput({ postId }: { postId: string }) {
  const [text, setText] = useState("");

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      createPost({ content: text, user_id: user!.id, parent_id: postId }),
    onSuccess: (data) => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
      // Alert.alert("Error", error.message);
    },
  });

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
          onPress={() => mutate()}
          disabled={isPending || text.length === 0}
          className="ml-2"
        >
          <AntDesign
            name="pluscircleo"
            size={24}
            color={isPending || text.length === 0 ? "#555" : "gainsboro"}
          />
        </Pressable>
      </View>
    </View>
  );
}
