import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Txt from './Txt';
import { colors, radius, row } from '../styles/theme';

type ChipTone = 'default' | 'ai' | 'light';

interface ChipProps {
  label: string;
  selected?: boolean;
  tone?: ChipTone;
  icon?: React.ReactNode; // placed on the right side of the label
  trailingIcon?: React.ReactNode; // placed on the left side of the label
  onPress?: () => void;
}

export default function Chip({ label, selected = false, tone = 'default', icon, trailingIcon, onPress }: ChipProps) {
  const isAi = tone === 'ai' && !selected;
  const isLight = tone === 'light' && !selected;
  const textColor = selected ? colors.white : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isLight && styles.light,
        isAi && styles.ai,
        selected && styles.selected,
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon ? <View style={styles.iconRight}>{icon}</View> : null}
      <Txt variant="label" color={selected ? colors.white : colors.text} style={{ color: textColor }}>
        {label}
      </Txt>
      {trailingIcon ? <View style={styles.iconLeft}>{trailingIcon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    ...row,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  light: {
    backgroundColor: colors.mintSoft,
    borderColor: colors.mintSoft,
  },
  ai: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconRight: { marginLeft: 6 },
  iconLeft: { marginRight: 6 },
});
