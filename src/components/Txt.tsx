import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, fontFamilies, FontWeight } from '../styles/theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'bodyLg' | 'body' | 'small' | 'label' | 'labelSm';

interface VariantStyle {
  size: number;
  line: number;
  weight: FontWeight;
}

// Mirrors the typography scale from the visual identity (Cairo, line-heights 1.4x-1.6x).
const variants: Record<TextVariant, VariantStyle> = {
  h1: { size: 26, line: 38, weight: '700' },
  h2: { size: 22, line: 32, weight: '700' },
  h3: { size: 18, line: 26, weight: '600' },
  h4: { size: 16, line: 24, weight: '600' },
  bodyLg: { size: 16, line: 26, weight: '500' },
  body: { size: 14, line: 22, weight: '400' },
  small: { size: 12, line: 18, weight: '400' },
  label: { size: 13, line: 20, weight: '600' },
  labelSm: { size: 11, line: 16, weight: '600' },
};

interface TxtProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: FontWeight;
  align?: 'right' | 'left' | 'center';
}

export default function Txt({
  variant = 'body',
  color = colors.text,
  weight,
  align = 'right',
  style,
  children,
  ...rest
}: TxtProps) {
  const v = variants[variant];
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies[weight ? weight : v.weight],
          fontSize: v.size,
          lineHeight: v.line,
          color,
          textAlign: align,
          writingDirection: 'rtl',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
