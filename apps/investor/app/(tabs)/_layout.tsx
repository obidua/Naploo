import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: 'white', borderTopColor: '#e2e8f0', paddingTop: 6, paddingBottom: 6, height: 64 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="grid" size={22} color={color} /> }} />
      <Tabs.Screen name="offers" options={{ title: 'Offers', tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={22} color={color} /> }} />
      <Tabs.Screen name="investments" options={{ title: 'Investments', tabBarIcon: ({ color }) => <Ionicons name="cube" size={22} color={color} /> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: ({ color }) => <Ionicons name="trending-up" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} /> }} />
    </Tabs>
  );
}
