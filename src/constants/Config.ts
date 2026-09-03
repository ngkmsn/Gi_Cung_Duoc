import { Platform } from 'react-native';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Handle Android emulator host resolution (10.0.2.2 points to host machine)
const resolvedApiUrl =
  Platform.OS === 'android' && (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1'))
    ? rawApiUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
    : rawApiUrl;

export const Config = {
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  API_URL: resolvedApiUrl,
  MOCK_DATA: process.env.EXPO_PUBLIC_MOCK_DATA !== 'false', // Default to true if not explicitly set to 'false'
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
  MAPTILER_API_KEY: process.env.EXPO_PUBLIC_MAPTILER_API_KEY || '',
} as const;

export type AppConfig = typeof Config;
