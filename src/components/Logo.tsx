import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../styles/theme';

interface LogoProps {
  size?: number;
}

// Mihnati mark: a map pin outline with a white dot on a deep green rounded square.
export default function Logo({ size = 40 }: LogoProps) {
  const icon = size * 0.68;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={icon} height={icon} viewBox="0 0 24 24">
        <Path
          d="M12 22.5s7.5-6.4 7.5-12.5a7.5 7.5 0 1 0-15 0c0 6.1 7.5 12.5 7.5 12.5z"
          stroke={colors.secondary}
          strokeWidth={2}
          fill="none"
          strokeLinejoin="round"
        />
        <Circle cx={12} cy={10} r={3.2} fill={colors.white} />
        <Path d="M12 13.2c0 2 .5 3 2 3.8" stroke={colors.secondary} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}
