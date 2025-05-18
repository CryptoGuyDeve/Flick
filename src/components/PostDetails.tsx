import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Tables } from "@/types/database.types";
import { Link } from "expo-router";

dayjs.extend(relativeTime);

type PostWithUser = Tables<"posts"> & {
  user: Tables<"profiles">;
  replies: {
    count: number;
  }[];
};

export default function PostDetails({ post }: { post: PostWithUser }) {
  return (
    <Link href={`/posts/${post.id}`} asChild>
      <Pressable className="p-4 border-b border-gray-800/70 gap-4">

        {/* Author Avatar and Info */}
        <View className="flex-1 flex-row items-center">
        <Image
          source={{
            uri: post.user.avatar_url || "https://via.placeholder.com/150",
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
          {/* User Info */}
            <Text className="text-white font-bold mr-2">
              {post.user.full_name}
            </Text>
            <Text className="text-gray-500">@{post.user.username}</Text>
            <Text className="text-gray-500 mx-1">·</Text>
            <Text className="text-gray-500">
              {dayjs(post.created_at).fromNow()}
            </Text>
          </View>

        {/* Post Content */}
        <Text className="text-white">{post.content}</Text>

        {/* Interaction Buttons */}
        <View className="flex-row gap-4">
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
      </Pressable>
    </Link>
  );
}
