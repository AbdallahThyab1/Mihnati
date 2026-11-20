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

import { colors } from '../src/styles/theme';
import SplashScreen from '../src/screens/Splash/SplashScreen';
import { AuthProvider } from '../src/context/AuthContext';

// Keep native Expo splash visible until fonts are ready
void NativeSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // Hide Expo native splash once fonts are ready
  useEffect(() => {
    if (fontsLoaded || fontError) {
      void NativeSplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show Mihnati animated splash for 1.8s
  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    const timer = setTimeout(() => {
      setShowCustomSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
      </View>
    );
  }

  if (showCustomSplash) {
    return (
      <View style={styles.splashScreen}>
        <SplashScreen />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
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
            <Stack.Screen name="booking/[craftsmanId]" />
            <Stack.Screen name="bookings" />
            <Stack.Screen name="bookings/[id]" />
            <Stack.Screen name="reviews" />
            <Stack.Screen name="reviews/[id]" />
            <Stack.Screen name="services" />
            <Stack.Screen name="services/explore" />
            <Stack.Screen name="services/[id]" />
            <Stack.Screen name="join" />
            <Stack.Screen name="+not-found" />
          </Stack>

          <StatusBar style="dark" />
        </View>
      </AuthProvider>
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
