if (
  typeof document !== 'undefined' &&
  !document.getElementById('genvibe-inspector')
) {
  const __gvInspector = document.createElement('script');

  __gvInspector.id = 'genvibe-inspector';
  __gvInspector.src =
    'https://genvibe.pro/inspector-script.js?v=e2b-route2';

  document.head.appendChild(__gvInspector);
}

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NativeSplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  useFonts,
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { colors } from '../src/styles/theme';
import SplashScreen from '../src/screens/Splash/SplashScreen';

// Keep the native Expo splash visible until the app is ready
void NativeSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // Hide Expo native splash after fonts are ready
  useEffect(() => {
    if (fontsLoaded || fontError) {
      void NativeSplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show our custom Mihnati splash for 3 seconds
  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    const timer = setTimeout(() => {
      setShowCustomSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  // While fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
      </View>
    );
  }

  // IMPORTANT:
  // Don't render the app stack during the custom splash.
  if (showCustomSplash) {
    return (
      <View style={styles.splashScreen}>
        <SplashScreen />
        <StatusBar style="light" />
      </View>
    );
  }

  // Main application
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.canvas,
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile/[id]" />
          <Stack.Screen name="reviews/[id]" />
          <Stack.Screen name="join" />
          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  splashScreen: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  root: {
    flex: 1,
  },
});