import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Tables } from "@/types/database.types";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import SupabaseImage from "./SupabaseImage";

dayjs.extend(relativeTime);

type PostWithUser = Tables<"posts"> & {
  user: Tables<"profiles">;
  likes: Tables<"likes">[];
  replies: Tables<"posts">[];
};

export default function PostDetails({ post }: { post: PostWithUser }) {
  return (
    <Link href={`/posts/${post.id}`} asChild>
      <Pressable className="p-4 border-b border-gray-800">
        <View className="flex-row">
          {/* User Avatar */}
          <Link href={`/profile/${post.user.id}`} asChild>
            <Pressable>
              {post.user.avatar_url ? (
                <SupabaseImage
                  bucket="avatars"
                  path={post.user.avatar_url.replace(/^.*\/avatars\//, "")}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center">
                  <Text className="text-white text-lg">
                    {post.user.full_name?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
            </Pressable>
          </Link>

          {/* Post Content */}
          <View className="flex-1 ml-3">
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

            {/* Interaction Buttons */}
            <View className="flex-row justify-between mt-2">
              <Pressable className="flex-row items-center">
                <Ionicons name="heart-outline" size={22} color="#d1d5db" />
                <Text className="text-gray-300 ml-2">{post.likes?.length ?? 0}</Text>
              </Pressable>

              <Pressable className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={22} color="#d1d5db" />
                <Text className="text-gray-300 ml-2">
                  {post.replies?.length ?? 0}
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
        </View>
      </Pressable>
    </Link>
  );
}
