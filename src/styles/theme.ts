import { StyleSheet, ViewStyle } from 'react-native';

// Mihnati visual identity: deep olive-forest green, fresh green, warm amber on a cool limestone canvas.
export const colors = {
  primary: '#1B4332',
  primaryDark: '#012D1D',
  primaryLight: '#2D6A4F',
  secondary: '#40916C',
  success: '#2D936C',
  amber: '#F4B942',
  amberSoft: '#FFF4D6',
  canvas: '#F7F9FF',
  surface: '#FFFFFF',
  tint: '#EDF4FF',
  tintStrong: '#E4EFFD',
  mint: '#A1F4C8',
  mintSoft: '#DDF6E8',
  aiSurface: '#EBF5F0',
  text: '#1F2933',
  muted: '#6B7280',
  border: '#E5E7EB',
  error: '#D64545',
  errorSoft: '#FEE2E2',
  white: '#FFFFFF',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export type FontWeight = '400' | '500' | '600' | '700';

export const fontFamilies: Record<FontWeight, string> = {
  '400': 'Cairo_400Regular',
  '500': 'Cairo_500Medium',
  '600': 'Cairo_600SemiBold',
  '700': 'Cairo_700Bold',
};

export const shadows = StyleSheet.create({
  level1: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  level2: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  level3: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
});

// The whole app is right-to-left (Arabic). We lay rows out explicitly with "row-reverse"
// so the first child always sits on the right.
export const row: ViewStyle = {
  flexDirection: 'row-reverse',
  alignItems: 'center',
};

export const card: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
};

export const screenPadding = 16;
