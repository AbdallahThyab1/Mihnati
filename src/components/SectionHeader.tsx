import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Txt from './Txt';
import { colors, row } from '../styles/theme';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onActionPress?: () => void;
  rightNote?: React.ReactNode; // custom element on the left side
}

export default function SectionHeader({ title, icon, actionLabel, onActionPress, rightNote }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Txt variant="h2" color={colors.text} style={styles.title}>
        {title}
      </Txt>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Txt variant="label" color={colors.primary}>
            {actionLabel}
          </Txt>
        </Pressable>
      ) : null}
      {rightNote ? rightNote : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...row, paddingHorizontal: 16, marginBottom: 12 },
  icon: { marginLeft: 8 },
  title: { flex: 1, fontSize: 20 },
});
