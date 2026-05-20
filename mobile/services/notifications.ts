import * as Notifications from 'expo-notifications';
import { api } from './api';

export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await api.post('/users/push-token', { token });
}

// Notif locale quand défi validé
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,  // Immédiat
  });
}
