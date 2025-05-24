import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
        }}
      />
      <Text style={styles.text}>Notifications feature is currently disabled.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});