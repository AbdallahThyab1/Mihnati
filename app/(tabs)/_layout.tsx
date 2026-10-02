import React from 'react';
import { Tabs } from 'expo-router';
import { Compass, Map, Search, UserCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamilies } from '../../src/styles/theme';

// Tabs are declared in reverse order so that "Home" sits on the RIGHT (Arabic layout).
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fontFamilies['600'], fontSize: 11, marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 62 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
        },
      }}
    >
      <Tabs.Screen
        name="account"
        options={{ title: 'حسابي', tabBarIcon: ({ color }) => <UserCircle size={24} color={color} /> }}
      />
      <Tabs.Screen name="map" options={{ title: 'الخريطة', tabBarIcon: ({ color }) => <Map size={24} color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: 'البحث', tabBarIcon: ({ color }) => <Search size={24} color={color} /> }} />
      <Tabs.Screen name="index" options={{ title: 'الرئيسية', tabBarIcon: ({ color }) => <Compass size={24} color={color} /> }} />
      <Tabs.Screen name="results" options={{ href: null }} />
    </Tabs>
  );
}
