export const Config = {
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.foodfinder.local',
  MOCK_DATA: process.env.EXPO_PUBLIC_MOCK_DATA !== 'false', // Default to true if not explicitly set to 'false'
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
} as const;

export type AppConfig = typeof Config;
