import { supabase } from "@/lib/supabase";
import { TablesInsert } from "@/types/database.types";
import { PostWithUser } from "@/types/post";
import { notifyFollowersOfNewPost } from './notifications';

type PostInput = {
  content: string;
  user_id: string;
  parent_id?: string | null;
  images?: string[];
};

export const fetchPosts = async () => {
  const { data } = await supabase
    .from("posts")
    .select(`
      *,
      user:profiles(*),
      likes:likes(*),
      replies:posts!parent_id(*)
    `)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .throwOnError();

  return data as PostWithUser[];
};

export async function createPost({ content, user_id, parent_id, images = [] }: PostInput) {
  const { data: post, error } = await supabase
    .from('posts')
    .insert({ content, user_id, parent_id, images })
    .select(`
      *,
      user:profiles(*),
      likes:likes(*),
      replies:posts!parent_id(*)
    `)
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  // Send notifications to followers
  try {
    await notifyFollowersOfNewPost(post.id, user_id);
  } catch (error) {
    console.error('Error sending notifications:', error);
    // Don't throw the error as the post was created successfully
  }

  return post as PostWithUser;
}

export const getPostById = async (id: string) => {
  const { data } = await supabase
    .from("posts")
    .select(`
      *,
      user:profiles(*),
      likes:likes(*),
      replies:posts!parent_id(*)
    `)
    .eq("id", id)
    .single()
    .throwOnError();

  return data as PostWithUser;
};

export const getPostsByUserId = async (id: string) => {
  const { data } = await supabase
    .from("posts")
    .select(`
      *,
      user:profiles(*),
      likes:likes(*),
      replies:posts!parent_id(*)
    `)
    .eq("user_id", id)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .throwOnError();

  return data as PostWithUser[];
};

export const getPostsReplies = async (id: string) => {
  const { data } = await supabase
    .from("posts")
    .select(`
      *,
      user:profiles(*),
      likes:likes(*),
      replies:posts!parent_id(*)
    `)
    .eq("parent_id", id)
    .throwOnError();

  return data as PostWithUser[];
};
