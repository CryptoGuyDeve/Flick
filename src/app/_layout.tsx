import "../../global.css";
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { Slot } from "expo-router";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { useEffect } from 'react';
import { registerForPushNotifications, setupNotificationHandlers } from '@/services/notifications';

const queryClient = new QueryClient();

const myTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "white",
    card: "#101010",
    background: "#101010",
  }
};

export default function RootLayout() {
  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().catch(console.error);

    // Setup notification handlers
    setupNotificationHandlers();
  }, []);

  return (
    <ThemeProvider value={myTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

