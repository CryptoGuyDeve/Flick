import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import SupabaseImage from "./SupabaseImage";
import { PostWithUser } from "@/types/post";
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost } from '@/services/posts';

dayjs.extend(relativeTime);

export default function PostListItem({
  post,
  isLastInGroup = true,
}: {
  post: PostWithUser;
  isLastInGroup?: boolean;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: handleLike } = useMutation({
    mutationFn: () => likePost(post.id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const isLiked = post.likes?.some((like) => like.user_id === user?.id) ?? false;
  const repliesCount = post.replies?.length ?? 0;

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
          <Link href={`/profile/${post.user.id}`} asChild>
            <Pressable>
              {post.user.avatar_url ? (
                <SupabaseImage
                  bucket="avatars"
                  path={post.user.avatar_url.replace(/^.*\/avatars\//, "")}
                  className="w-12 h-12 rounded-full z-10"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-neutral-700 items-center justify-center z-10">
                  <Text className="text-white text-lg">
                    {post.user.full_name?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
            </Pressable>
          </Link>

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
          <View className="flex-row items-center gap-x-6 mt-2">
            <Pressable className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={22} color="#d1d5db" />
              <Text className="text-gray-300 ml-2">{repliesCount}</Text>
            </Pressable>

            <Pressable
              onPress={() => handleLike()}
              className="flex-row items-center"
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? '#ef4444' : '#666'}
              />
              <Text className="text-gray-300 ml-2">
                {post.likes?.length ?? 0}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
