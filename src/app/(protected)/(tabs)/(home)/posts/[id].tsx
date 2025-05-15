import PostListItem from "@/components/PostListItem";
import PostReplyInput from "@/components/PostReplyInput";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

const getPostById = async (id: string) => {
  const { data } = await supabase
    .from("posts")
    .select("*, user:profiles(*)")
    .eq("id", id)
    .single()
    .throwOnError();

  return data;
};

export default function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPostById(id),
  });

  if (isLoading) return <ActivityIndicator />;

  if (error) return <Text className="text-red-500">{error.message}</Text>;

  console.log(data);

  return (
    <View className="flex-1">
      <FlatList
        data={[]}
        renderItem={({ item }) => <PostListItem post={item} />}
        ListHeaderComponent={<PostListItem post={data} />}
      />
      <PostReplyInput postId={id} />
    </View>
  );
}
