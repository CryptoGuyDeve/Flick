import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

interface NotificationData {
  postId: string;
}

interface NotificationResponse {
  notification: {
    request: {
      content: {
        data?: NotificationData;
      };
    };
  };
}

interface PostData {
  content: string;
  user: {
    username: string;
    full_name: string;
  };
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for notifications
export async function registerForPushNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions!');
      return;
    }

    return true;
  } catch (error) {
    console.error('Error registering for notifications:', error);
    return;
  }
}

// Send notification to followers when a new post is created
export async function notifyFollowersOfNewPost(postId: string, userId: string) {
  try {
    // Get the post details
    const { data: post } = await supabase
      .from('posts')
      .select('content, user:profiles(username, full_name)')
      .eq('id', postId)
      .single() as { data: PostData | null };

    if (!post) throw new Error('Post not found');

    // Get all followers of the user
    const { data: followers } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('following_id', userId);

    if (!followers?.length) return;

    // For development, just show a local notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${post.user.full_name} (@${post.user.username})`,
        body: post.content.length > 100 
          ? `${post.content.substring(0, 97)}...` 
          : post.content,
        data: { postId },
      },
      trigger: null, // Show immediately
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

// Handle notification received while app is in foreground
export function setupNotificationHandlers() {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const postId = response.notification.request.content.data?.postId as string | undefined;
    if (postId) {
      // Navigate to the post
      console.log('Navigate to post:', postId);
    }
  });

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
} 