import { useAuth } from "@/providers/AuthProvider";
import { AntDesign } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { createPost } from "@/services/post";

export default function PostReplyInput({ postId }: { postId: string }) {
  const [text, setText] = useState("");

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => createPost({ content: text, user_id: user!.id, parent_id: postId }),
    onSuccess: (data) => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["posts", postId, "replies"] });
    },
    onError: (error) => {
      console.error(error);
      // Alert.alert("Error", error.message);
    },
  });

  return (
    <View className="p-4">
      <View className="flex-row items-center gap-2 bg-neutral-800 shadow-md p-4 rounded-xl">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add to flicker..."
          className="flex-1 text-white"
          multiline
        />
        <AntDesign
          onPress={() => mutate()}
          disabled={isPending || text.length === 0}
          name="pluscircleo"
          size={24}
          color={text.length === 0 ? "gray" : "gainsboro"}
        />
      </View>
    </View>
  );
}