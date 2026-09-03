/**
 * Food Finder - Warm, Bright, Modern Consumer Design System
 * Inspired by Airbnb, Uber Eats, and Google Maps UX patterns
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827',
    background: '#FAFAFB',
    cardBackground: '#FFFFFF',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E5E7EB',
    textSecondary: '#6B7280',
    primary: '#FF5A5F',
    primaryLight: '#FFF1F2',
    accentGreen: '#10B981',
    accentGold: '#F59E0B',
    accentBlue: '#3B82F6',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadow: '#000000',
  },
  dark: {
    text: '#111827',
    background: '#FAFAFB',
    cardBackground: '#FFFFFF',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E5E7EB',
    textSecondary: '#6B7280',
    primary: '#FF5A5F',
    primaryLight: '#FFF1F2',
    accentGreen: '#10B981',
    accentGold: '#F59E0B',
    accentBlue: '#3B82F6',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadow: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 840;
