import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronDown, MapPin, User } from 'lucide-react-native';
import Logo from './Logo';
import Txt from './Txt';
import { colors, row } from '../styles/theme';

// Top bar for the main tab screens: logo + city picker on the right, bell + account on the left.
export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      <View style={row}>
        <Logo size={44} />
        <View style={styles.brand}>
          <Txt variant="h3" color={colors.primary} style={styles.brandName}>
            مهنتي
          </Txt>
          <Pressable style={row}>
            <MapPin size={14} color={colors.secondary} />
            <Txt variant="small" color={colors.muted} style={styles.city}>
              رام الله والبيرة
            </Txt>
            <ChevronDown size={14} color={colors.muted} />
          </Pressable>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.bell} accessibilityLabel="الإشعارات">
          <Bell size={22} color={colors.text} />
        </Pressable>
        <Pressable style={styles.avatar} onPress={() => router.navigate('/account')} accessibilityLabel="حسابي">
          <User size={20} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { marginRight: 10 },
  brandName: { fontSize: 22, lineHeight: 28, fontFamily: 'Cairo_700Bold' },
  city: { marginHorizontal: 4 },
  bell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
