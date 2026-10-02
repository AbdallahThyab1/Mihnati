import React from 'react';
import { StyleSheet, View } from 'react-native';
import Txt from './Txt';
import { colors, radius, row } from '../styles/theme';

interface TrustBannerProps {
  title: string;
  text: string;
  icon: React.ReactNode;
}

// Soft blue info block with a mint icon circle, used at the bottom of several screens.
export default function TrustBanner({ title, text, icon }: TrustBannerProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.body}>
        <Txt variant="h4" color={colors.primary}>
          {title}
        </Txt>
        <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
          {text}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...row,
    backgroundColor: colors.tint,
    borderRadius: radius.lg,
    padding: 16,
    marginHorizontal: 16,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, marginRight: 14 },
});
