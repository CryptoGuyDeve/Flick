import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { use, useState } from "react";
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
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { createPost } from "@/services/post";
import { Entypo } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

export default function NewPostScreen() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => createPost({ content: text, user_id: user!.id }),
    onSuccess: (data) => {
      setText("");
      router.back();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
      // Alert.alert("Error", error.message);
    },
  });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="p-4 flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 0}
      >
        <Text className="text-white text-lg font-bold">username</Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind?"
          placeholderTextColor="gray"
          className="text-white text-lg"
          multiline
          numberOfLines={4}
        />

        {image && (
          <Image source={{ uri: image }} 
          className="w-1/2 aspect-square rounded-lg my-4"
          />
        )}

        {error && (
          <Text className="text-red-500 text-sm mt-4">{error.message}</Text>
        )}

        <View className="flex-row items-center gap-2 mt-4">
          <Entypo onPress={pickImage} name="images" size={20} color="gray" />
        </View>

        <View className="mt-auto">
          <Pressable
            onPress={() => mutate()}
            className={`${
              isPending ? "bg-white/50" : "bg-white"
            } p-3 px-6 self-end rounded-full`}
            disabled={isPending}
          >
            <Text className="text-black font-bold">Post</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
