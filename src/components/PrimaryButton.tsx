import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Txt from './Txt';
import { colors, radius, row } from '../styles/theme';

type ButtonKind = 'primary' | 'secondary' | 'tint' | 'mint' | 'outline';

interface PrimaryButtonProps {
  label: string;
  kind?: ButtonKind;
  icon?: React.ReactNode; // shown on the LEFT of the label (after the text in RTL reading order)
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  height?: number;
}

const backgrounds: Record<ButtonKind, string> = {
  primary: colors.primary,
  secondary: colors.success,
  tint: colors.tintStrong,
  mint: colors.mint,
  outline: 'transparent',
};

const textColors: Record<ButtonKind, string> = {
  primary: colors.white,
  secondary: colors.white,
  tint: colors.primary,
  mint: colors.primary,
  outline: colors.primary,
};

export default function PrimaryButton({ label, kind = 'primary', icon, onPress, style, height = 48 }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgrounds[kind], height },
        kind === 'outline' && styles.outline,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      <Txt variant="label" weight="600" color={textColors[kind]} align="center" style={styles.label}>
        {label}
      </Txt>
      {icon ? icon : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    ...row,
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    gap: 8,
  },
  outline: { borderWidth: 1.5, borderColor: colors.primary },
  label: { fontSize: 15 },
});
