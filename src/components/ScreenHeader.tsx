import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, User } from 'lucide-react-native';
import Logo from './Logo';
import Txt from './Txt';
import { colors, row } from '../styles/theme';

interface ScreenHeaderProps {
  title: string;
  leftSlot?: React.ReactNode;
}

// Header for inner screens: back arrow + logo + title on the right, account button on the left.
export default function ScreenHeader({ title, leftSlot }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={row}>
        <Pressable onPress={goBack} style={styles.back} accessibilityLabel="رجوع">
          <ArrowRight size={24} color={colors.text} />
        </Pressable>
        <Logo size={38} />
        <Txt variant="h4" color={colors.primary} style={styles.title} numberOfLines={1}>
          {title}
        </Txt>
        <View style={{ flex: 1 }} />
        {leftSlot ? (
          leftSlot
        ) : (
          <Pressable style={styles.avatar} onPress={() => router.navigate('/account')}>
            <User size={18} color={colors.white} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { marginRight: 10, fontFamily: 'Cairo_700Bold', fontSize: 17 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
