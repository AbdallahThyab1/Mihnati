import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { colors } from '../styles/theme';

interface AvatarProps {
  uri: string;
  size?: number;
  rounded?: number;
  verified?: boolean;
}

// Craftsman photo with an optional verified badge on its bottom-left corner.
export default function Avatar({ uri, size = 72, rounded = 14, verified = false }: AvatarProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: rounded, backgroundColor: colors.tint }} />
      {verified ? (
        <View style={styles.badge}>
          <BadgeCheck size={14} color={colors.white} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
