import { FlatList } from "react-native";
import PostListItem from "@/components/PostListItem";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Text } from "react-native";
import { supabase } from "@/lib/supabase";
import { fetchPosts } from "@/services/post";


export default function HomeScreen() {
  const { data, isLoading, error} = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>{error.message}</Text>;
  }

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <PostListItem post={item} />}
    />
  );
}
