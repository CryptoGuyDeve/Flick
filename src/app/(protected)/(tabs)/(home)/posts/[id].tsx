import PostListItem from "@/components/PostListItem";
import PostReplyInput from "@/components/PostReplyInput";
import { getPostById, getPostsReplies } from "@/services/post";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";



export default function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPostById(id),
  });

  const { data: replies } = useQuery({
    queryKey: ["posts", id, "replies"],
    queryFn: () => getPostsReplies(id),
  });

  if (isLoading) return <ActivityIndicator />;

  if (error) return <Text className="text-red-500">{error.message}</Text>;

  return (
    <View className="flex-1">
      <FlatList
        data={replies || []}
        renderItem={({ item }) => <PostListItem post={item} />}
        ListHeaderComponent={<PostListItem post={post} />}
      />
      <PostReplyInput postId={id} />
    </View>
  );
}
