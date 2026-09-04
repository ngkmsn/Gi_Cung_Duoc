import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { DEFAULT_USER_LOCATION } from '@/utils/distance';

export interface UserLocationState {
  latitude: number;
  longitude: number;
  addressLabel: string;
  isRealLocation: boolean;
  loading: boolean;
  permissionGranted: boolean;
  errorMsg: string | null;
}

export function useUserLocation() {
  const [locationState, setLocationState] = useState<UserLocationState>({
    latitude: DEFAULT_USER_LOCATION.latitude,
    longitude: DEFAULT_USER_LOCATION.longitude,
    addressLabel: 'Hồ Hoàn Kiếm, Hà Nội',
    isRealLocation: false,
    loading: true,
    permissionGranted: false,
    errorMsg: null,
  });

  const fetchLocation = useCallback(async () => {
    setLocationState((prev) => ({ ...prev, loading: true, errorMsg: null }));

    try {
      // 1. Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationState({
          latitude: DEFAULT_USER_LOCATION.latitude,
          longitude: DEFAULT_USER_LOCATION.longitude,
          addressLabel: 'Hồ Hoàn Kiếm, Hà Nội (Mặc định)',
          isRealLocation: false,
          loading: false,
          permissionGranted: false,
          errorMsg: 'Quyền truy cập vị trí bị từ chối. Đang dùng vị trí mặc định.',
        });
        return;
      }

      // 2. Try last known position first for instant speed
      let latitude: number | null = null;
      let longitude: number | null = null;

      try {
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown?.coords) {
          latitude = lastKnown.coords.latitude;
          longitude = lastKnown.coords.longitude;
        }
      } catch (e) {}

      // 3. If no last known position, get current position with timeout
      if (latitude === null || longitude === null) {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      console.log('[useUserLocation] Real GPS location obtained:', latitude, longitude);

      // 4. Try reverse geocoding to get human-friendly street / district name
      let addressLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const item = reverseGeocode[0];
          const parts = [
            item.name || item.street,
            item.district || item.subregion,
            item.city || item.region,
          ].filter(Boolean);

          if (parts.length > 0) {
            addressLabel = parts.join(', ');
          }
        }
      } catch (e) {
        // Reverse geocode is optional
      }

      setLocationState({
        latitude,
        longitude,
        addressLabel,
        isRealLocation: true,
        loading: false,
        permissionGranted: true,
        errorMsg: null,
      });
    } catch (error: any) {
      console.warn('Failed to obtain real device GPS location:', error);
      setLocationState({
        latitude: DEFAULT_USER_LOCATION.latitude,
        longitude: DEFAULT_USER_LOCATION.longitude,
        addressLabel: 'Hồ Hoàn Kiếm, Hà Nội (Mặc định)',
        isRealLocation: false,
        loading: false,
        permissionGranted: false,
        errorMsg: error?.message || 'Không thể lấy vị trí thiết bị.',
      });
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    ...locationState,
    refreshLocation: fetchLocation,
  };
}
