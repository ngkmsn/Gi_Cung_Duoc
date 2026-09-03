import { Linking, Platform } from 'react-native';

export interface LocationDestination {
  latitude: number | string;
  longitude: number | string;
  name?: string;
  address?: string | null;
}

/**
 * Open destination in external native maps app (Apple Maps / Google Maps) for turn-by-turn navigation
 */
export async function openMapsNavigation(destination: LocationDestination): Promise<void> {
  const lat = typeof destination.latitude === 'string' ? parseFloat(destination.latitude) : destination.latitude;
  const lng = typeof destination.longitude === 'string' ? parseFloat(destination.longitude) : destination.longitude;
  const label = encodeURIComponent(destination.name || 'Quán Ăn');

  if (isNaN(lat) || isNaN(lng)) return;

  const appleMapsUrl = `maps:0,0?q=${label}@${lat},${lng}`;
  const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
  const webGoogleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  try {
    if (Platform.OS === 'ios') {
      const canOpenApple = await Linking.canOpenURL(appleMapsUrl);
      if (canOpenApple) {
        await Linking.openURL(appleMapsUrl);
        return;
      }
    } else if (Platform.OS === 'android') {
      const canOpenGeo = await Linking.canOpenURL(geoUrl);
      if (canOpenGeo) {
        await Linking.openURL(geoUrl);
        return;
      }
    }

    // Default universal web URL fallback
    await Linking.openURL(webGoogleMapsUrl);
  } catch (error) {
    // If native intent fails, open web maps
    await Linking.openURL(webGoogleMapsUrl).catch(() => {});
  }
}
