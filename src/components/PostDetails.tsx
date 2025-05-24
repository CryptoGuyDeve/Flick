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
          {post.user.avatar_url ? (
            <SupabaseImage
              bucket="avatars"
              path={post.user.avatar_url.replace(/^.*\/avatars\//, '')}
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center mr-3">
              <Text className="text-white text-lg">
                {post.user.full_name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          {/* User Info */}
          <View>
            <Text className="text-white font-bold mr-2">
              {post.user.full_name}
            </Text>
            <Text className="text-gray-500">@{post.user.username}</Text>
            <Text className="text-gray-500 mx-1">·</Text>
            <Text className="text-gray-500">
              {dayjs(post.created_at).fromNow()}
            </Text>
          </View>
        </View>

        {/* Post Content */}
        <Text className="text-white">{post.content}</Text>

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
        <View className="flex-row justify-between mt-2">
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
