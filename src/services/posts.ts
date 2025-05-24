import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/database.types';

export type PostWithUser = Tables['posts'] & {
  user: Tables['profiles'];
  likes: Tables['likes'][];
  replies: Tables['posts'][];
};

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles(*),
      likes:likes(*),
      replies:posts!parent_id(*)
    `)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PostWithUser[];
}

export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles(*),
      likes:likes(*),
      replies:posts!parent_id(
        *,
        user:profiles(*),
        likes:likes(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as PostWithUser;
}

export async function createPost(content: string, userId: string, parentId?: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        content,
        user_id: userId,
        parent_id: parentId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const likePost = async (postId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Error fetching post:', postError);
      throw postError;
    }

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if already liked
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      console.error('Error checking existing like:', likeCheckError);
      throw likeCheckError;
    }

    if (existingLike) {
      // Unlike the post
      const { error: unlikeError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (unlikeError) {
        console.error('Error unliking post:', unlikeError);
        throw unlikeError;
      }

      return { liked: false };
    }

    // Like the post
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    if (likeError) {
      console.error('Error liking post:', likeError);
      throw likeError;
    }

    return { liked: true };
  } catch (error) {
    console.error('Error in likePost:', error);
    throw error;
  }
};

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
} 