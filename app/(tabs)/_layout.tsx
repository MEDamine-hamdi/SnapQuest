import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#0a0b0f', borderTopColor: '#1e2130' },
      tabBarActiveTintColor: '#f5a623',
      tabBarInactiveTintColor: '#5a6080',
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Chatbot',
        tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses" size={22} color={color} />
      }} />
      <Tabs.Screen name="challenges" options={{
        title: 'Défis',
        tabBarIcon: ({ color }) => <Ionicons name="trophy" size={22} color={color} />
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil',
        tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={22} color={color} />
      }} />
      <Tabs.Screen name="leaderboard" options={{
        title: 'Classement',
        tabBarIcon: ({ color }) => <Ionicons name="podium" size={22} color={color} />
      }} />
    </Tabs>
  );
}