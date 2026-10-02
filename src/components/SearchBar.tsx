import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Search, SlidersHorizontal, X, Mic } from 'lucide-react-native';
import { colors, fontFamilies, radius, row, shadows } from '../styles/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  variant?: 'card' | 'soft';
}

// Search field: search icon on the right, filter toggle on the left (RTL).
export default function SearchBar({ value, onChangeText, placeholder, onSubmit, onFilterPress, variant = 'card' }: SearchBarProps) {
  const soft = variant === 'soft';
  return (
    <View style={[styles.wrap, soft ? styles.soft : [styles.card, shadows.level1]]}>
      <Search size={22} color={colors.text} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        textAlign="right"
        style={styles.input}
      />
      {soft && value.length > 0 ? (
        <>
          <Pressable onPress={() => onChangeText('')} hitSlop={8} style={styles.iconBtn}>
            <X size={18} color={colors.muted} />
          </Pressable>
          <Mic size={20} color={colors.primary} />
        </>
      ) : null}
      {!soft ? (
        <Pressable onPress={onFilterPress} style={styles.filter}>
          <SlidersHorizontal size={20} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...row, height: 56, paddingHorizontal: 14, borderRadius: radius.lg },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  soft: { backgroundColor: colors.tintStrong, height: 48 },
  input: {
    flex: 1,
    height: '100%',
    marginHorizontal: 10,
    fontFamily: fontFamilies['400'],
    fontSize: 14,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  iconBtn: { marginHorizontal: 6 },
  filter: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.aiSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
