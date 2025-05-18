import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Tables } from "@/types/database.types";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";

dayjs.extend(relativeTime);

type PostWithUser = Tables<"posts"> & {
  user: Tables<"profiles">;
  replies: {
    count: number;
  }[];
};

export default function PostListItem({
  post,
  isLastInGroup = true,
}: {
  post: PostWithUser;
  isLastInGroup?: boolean;
}) {
  return (
    <Link href={`/posts/${post.id}`} asChild>
      <Pressable
        className={`flex-row p-4 ${
          isLastInGroup ? "border-b border-gray-800" : ""
        }`}
      >
        {/* User Avatar */}
        <View className="mr-3 relative w-12 items-center">
          {/* Avatar */}
          <Image
            source={{
              uri: post.user.avatar_url || "https://via.placeholder.com/150",
            }}
            className="w-12 h-12 rounded-full z-10"
          />

          {/* Thread Line */}
          {!isLastInGroup && (
            <View className="w-[3px] flex-1 rounded-full bg-neutral-700 translate-y-2" />
          )}
        </View>

        {/* Post Content */}
        <View className="flex-1">
          {/* User Info */}
          <View className="flex-row items-center mb-1">
            <Text className="text-white font-bold mr-2">
              {post.user.full_name}
            </Text>
            <Text className="text-gray-500">@{post.user.username}</Text>
            <Text className="text-gray-500 mx-1">·</Text>
            <Text className="text-gray-500">
              {dayjs(post.created_at).fromNow()}
            </Text>
          </View>

          {/* Post Text */}
          <Text className="text-white mb-3">{post.content}</Text>

          {post.images && (
            <View className="flex-row gap-2 mt-2">
              {post.images.map((image) => (
                <Image
                  key={image}
                  source={{
                    uri: supabase.storage.from("media").getPublicUrl(image).data
                      .publicUrl,
                  }}
                  className="w-full aspect-square rounded-lg"
                />
              ))}
            </View>
          )}

          {/* Interaction Buttons */}
          <View className="flex-row gap-4 max-w-[80%]">
            <Pressable className="flex-row items-center">
              <Ionicons name="heart-outline" size={22} color="#d1d5db" />
              <Text className="text-gray-300 ml-2">0</Text>
            </Pressable>

            <Pressable className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={22} color="#d1d5db" />
              <Text className="text-gray-300 ml-2">
                {post?.replies?.[0].count || 0}
              </Text>
            </Pressable>

            <Pressable className="flex-row items-center">
              <Ionicons name="repeat" size={22} color="#d1d5db" />
              <Text className="text-gray-300 ml-2">0</Text>
            </Pressable>

            <Pressable className="flex-row items-center">
              <Ionicons name="paper-plane-outline" size={22} color="#d1d5db" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
