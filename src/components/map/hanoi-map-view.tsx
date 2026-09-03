import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { Restaurant } from '@/types/restaurant';
import { calculateDistanceKm, DEFAULT_USER_LOCATION, formatDistance } from '@/utils/distance';

interface HanoiMapViewProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant | null) => void;
  userLocation?: { latitude: number; longitude: number };
}

// Bounding box for central Hanoi
const MAP_BOUNDS = {
  minLat: 21.000,
  maxLat: 21.052,
  minLng: 105.790,
  maxLng: 105.868,
};

const CATEGORY_PIN_ICONS: Record<string, string> = {
  vietnamese: '🍜',
  coffee: '☕',
  western: '🍕',
  japanese: '🍣',
  dessert: '🍨',
};

export function HanoiMapView({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  userLocation = DEFAULT_USER_LOCATION,
}: HanoiMapViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const getPinPosition = (lat: number | string, lng: number | string) => {
    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
    const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;

    const latPercent = Math.max(
      6,
      Math.min(94, ((MAP_BOUNDS.maxLat - latitude) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100)
    );
    const lngPercent = Math.max(
      6,
      Math.min(94, ((longitude - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100)
    );

    return { top: `${latPercent}%`, left: `${lngPercent}%` };
  };

  const userPos = getPinPosition(userLocation.latitude, userLocation.longitude);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.8));
  const handleRecenter = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onSelectRestaurant(null);
  };

  return (
    <View style={styles.container}>
      {/* Map Canvas */}
      <View
        style={[
          styles.mapCanvas,
          {
            transform: [
              { scale: zoomLevel },
              { translateX: panOffset.x },
              { translateY: panOffset.y },
            ],
          },
        ]}>
        {/* Soft Pastel Background & Cartographic Features */}
        <View style={styles.mapGridBackground}>
          {/* Green parks */}
          <View style={styles.botanicalPark} />
          <View style={styles.thongNhatPark} />

          {/* West Lake (Hồ Tây) */}
          <View style={styles.westLake} />
          <View style={styles.westLakeLabel}>
            <ThemedText style={styles.waterLabelText}>Hồ Tây 🌊</ThemedText>
          </View>

          {/* Truc Bach Lake */}
          <View style={styles.trucBachLake} />

          {/* Hoan Kiem Lake (Hồ Gươm) */}
          <View style={styles.hoanKiemLake} />
          <View style={styles.hoanKiemLabel}>
            <ThemedText style={styles.waterLabelText}>Hồ Hoàn Kiếm</ThemedText>
          </View>

          {/* Red River (Sông Hồng) */}
          <View style={styles.redRiver} />
          <View style={styles.redRiverLabel}>
            <ThemedText style={styles.waterLabelText}>Sông Hồng</ThemedText>
          </View>

          {/* Clean White Main Road Artery System */}
          <View style={styles.roadRing1} />
          <View style={styles.roadRing2} />
          <View style={styles.roadHorizontal1} />
          <View style={styles.roadHorizontal2} />
          <View style={styles.roadVertical1} />
          <View style={styles.roadVertical2} />

          {/* District landmark labels */}
          <View style={styles.landmarkBaDinh}>
            <ThemedText style={styles.districtLabelText}>Q. Ba Đình</ThemedText>
          </View>
          <View style={styles.landmarkHoanKiem}>
            <ThemedText style={styles.districtLabelText}>Q. Hoàn Kiếm</ThemedText>
          </View>
          <View style={styles.landmarkHaiBaTrung}>
            <ThemedText style={styles.districtLabelText}>Q. Hai Bà Trưng</ThemedText>
          </View>
          <View style={styles.landmarkDongDa}>
            <ThemedText style={styles.districtLabelText}>Q. Đống Đa</ThemedText>
          </View>
        </View>

        {/* User Current Location Dot */}
        <View style={[styles.userLocationContainer, { top: userPos.top as any, left: userPos.left as any }]}>
          <View style={styles.userPulseRing} />
          <View style={styles.userDot} />
          <View style={styles.userCallout}>
            <ThemedText style={styles.userCalloutText}>Vị trí của bạn</ThemedText>
          </View>
        </View>

        {/* Modern Airbnb/Google Maps Style Food Pins */}
        {restaurants.map((restaurant) => {
          const isSelected = selectedRestaurant?.id === restaurant.id;
          const pos = getPinPosition(restaurant.latitude, restaurant.longitude);
          const primaryCat = restaurant.categories?.[0]?.slug?.toLowerCase() || 'vietnamese';
          const icon = CATEGORY_PIN_ICONS[primaryCat] || '🍽️';

          return (
            <Pressable
              key={restaurant.id}
              onPress={() => onSelectRestaurant(isSelected ? null : restaurant)}
              style={[
                styles.pinWrapper,
                { top: pos.top as any, left: pos.left as any },
                isSelected && styles.pinWrapperSelected,
              ]}>
              <View style={[styles.pinPill, isSelected && styles.pinPillSelected]}>
                <ThemedText style={styles.pinIcon}>{icon}</ThemedText>
                <ThemedText
                  numberOfLines={1}
                  style={[styles.pinText, isSelected && styles.pinTextSelected]}>
                  {restaurant.name}
                </ThemedText>
                {restaurant.price_range && (
                  <ThemedText style={[styles.pinPrice, isSelected && styles.pinPriceSelected]}>
                    • {restaurant.price_range}
                  </ThemedText>
                )}
              </View>
              <View style={[styles.pinBeak, isSelected && styles.pinBeakSelected]} />
            </Pressable>
          );
        })}
      </View>

      {/* Floating Map Action Controls (Zoom & Recenter) */}
      <View style={styles.mapControlsColumn}>
        <Pressable
          onPress={handleZoomIn}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}>
          <ThemedText style={styles.controlBtnText}>+</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleZoomOut}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}>
          <ThemedText style={styles.controlBtnText}>−</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleRecenter}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}>
          <ThemedText style={styles.controlIconText}>🎯</ThemedText>
        </Pressable>
      </View>

      {/* Modern Pop-up Preview Card on Pin Tap */}
      {selectedRestaurant && (
        <View style={styles.floatingPreviewCard}>
          <View style={styles.previewCardInner}>
            <Image
              source={{
                uri:
                  selectedRestaurant.image_url ||
                  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.previewImage}
              contentFit="cover"
            />
            <View style={styles.previewInfoCol}>
              <View style={styles.previewHeaderRow}>
                <ThemedText numberOfLines={1} style={styles.previewName}>
                  {selectedRestaurant.name}
                </ThemedText>
                <Pressable onPress={() => onSelectRestaurant(null)} style={styles.previewCloseBtn}>
                  <ThemedText style={styles.previewCloseText}>✕</ThemedText>
                </Pressable>
              </View>

              <View style={styles.previewRatingRow}>
                <ThemedText style={styles.previewStar}>★</ThemedText>
                <ThemedText style={styles.previewRatingVal}>
                  {selectedRestaurant.rating ? selectedRestaurant.rating.toFixed(1) : '4.8'}
                </ThemedText>
                {selectedRestaurant.price_range && (
                  <ThemedText style={styles.previewPriceVal}>• {selectedRestaurant.price_range}</ThemedText>
                )}
                {selectedRestaurant.badge && (
                  <View style={styles.previewBadgePill}>
                    <ThemedText style={styles.previewBadgeText}>{selectedRestaurant.badge}</ThemedText>
                  </View>
                )}
              </View>

              {selectedRestaurant.address && (
                <ThemedText numberOfLines={1} style={styles.previewAddressText}>
                  📍 {selectedRestaurant.address}
                </ThemedText>
              )}

              <View style={styles.previewFooterRow}>
                <ThemedText style={styles.previewDistanceText}>
                  🛵 Cách bạn{' '}
                  {formatDistance(
                    calculateDistanceKm(
                      userLocation.latitude,
                      userLocation.longitude,
                      typeof selectedRestaurant.latitude === 'string'
                        ? parseFloat(selectedRestaurant.latitude)
                        : selectedRestaurant.latitude,
                      typeof selectedRestaurant.longitude === 'string'
                        ? parseFloat(selectedRestaurant.longitude)
                        : selectedRestaurant.longitude
                    )
                  )}
                </ThemedText>
                <ThemedText style={styles.previewOpenText}>● Mở cửa</ThemedText>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#EDF3F8',
  },
  mapCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F6F8FA',
  },
  mapGridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F7FA',
  },
  botanicalPark: {
    position: 'absolute',
    top: '25%',
    left: '26%',
    width: '18%',
    height: '14%',
    backgroundColor: '#E6F4EA',
    borderRadius: 30,
    opacity: 0.8,
  },
  thongNhatPark: {
    position: 'absolute',
    top: '72%',
    left: '45%',
    width: '18%',
    height: '16%',
    backgroundColor: '#E6F4EA',
    borderRadius: 35,
    opacity: 0.8,
  },
  westLake: {
    position: 'absolute',
    top: '6%',
    left: '18%',
    width: '42%',
    height: '28%',
    backgroundColor: '#D7EDFC',
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#C3E2F8',
    opacity: 0.95,
  },
  westLakeLabel: {
    position: 'absolute',
    top: '16%',
    left: '30%',
  },
  trucBachLake: {
    position: 'absolute',
    top: '24%',
    left: '48%',
    width: '12%',
    height: '10%',
    backgroundColor: '#D7EDFC',
    borderRadius: 20,
  },
  hoanKiemLake: {
    position: 'absolute',
    top: '48%',
    left: '58%',
    width: '16%',
    height: '18%',
    backgroundColor: '#D7EDFC',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#C3E2F8',
  },
  hoanKiemLabel: {
    position: 'absolute',
    top: '55%',
    left: '60%',
  },
  redRiver: {
    position: 'absolute',
    top: 0,
    right: '2%',
    width: '18%',
    height: '100%',
    backgroundColor: '#E0F0FC',
    borderLeftWidth: 3,
    borderLeftColor: '#CBE5F8',
    opacity: 0.8,
  },
  redRiverLabel: {
    position: 'absolute',
    top: '12%',
    right: '5%',
  },
  waterLabelText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
    opacity: 0.85,
  },
  roadRing1: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '50%',
    borderRadius: 120,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  roadRing2: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: '70%',
    borderRadius: 160,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  roadHorizontal1: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#FFFFFF',
  },
  roadHorizontal2: {
    position: 'absolute',
    top: '68%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FFFFFF',
  },
  roadVertical1: {
    position: 'absolute',
    left: '35%',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FFFFFF',
  },
  roadVertical2: {
    position: 'absolute',
    left: '65%',
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#FFFFFF',
  },
  landmarkBaDinh: {
    position: 'absolute',
    top: '36%',
    left: '24%',
  },
  landmarkHoanKiem: {
    position: 'absolute',
    top: '45%',
    left: '68%',
  },
  landmarkHaiBaTrung: {
    position: 'absolute',
    top: '74%',
    left: '65%',
  },
  landmarkDongDa: {
    position: 'absolute',
    top: '62%',
    left: '26%',
  },
  districtLabelText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userLocationContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userPulseRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3B82F62B',
    borderWidth: 1.5,
    borderColor: '#3B82F677',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  userCallout: {
    position: 'absolute',
    top: -20,
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userCalloutText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -24,
    marginTop: -28,
    zIndex: 5,
  },
  pinWrapperSelected: {
    zIndex: 25,
    transform: [{ scale: 1.15 }],
  },
  pinPill: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    maxWidth: 160,
  },
  pinPillSelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FFFFFF',
  },
  pinIcon: {
    fontSize: 13,
  },
  pinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  pinTextSelected: {
    color: '#FFFFFF',
  },
  pinPrice: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  pinPriceSelected: {
    color: '#FFFFFF',
  },
  pinBeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  pinBeakSelected: {
    borderTopColor: '#FF5A5F',
  },
  mapControlsColumn: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'web' ? 110 : 130,
    gap: 8,
    zIndex: 30,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlBtnPressed: {
    backgroundColor: '#F8FAFC',
  },
  controlBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
  },
  controlIconText: {
    fontSize: 15,
  },
  floatingPreviewCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    zIndex: 28,
    overflow: 'hidden',
  },
  previewCardInner: {
    flexDirection: 'row',
    padding: 10,
    gap: 12,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  previewInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  previewName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 6,
  },
  previewCloseBtn: {
    padding: 2,
  },
  previewCloseText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  previewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewStar: {
    color: '#F59E0B',
    fontSize: 13,
  },
  previewRatingVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewPriceVal: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  previewBadgePill: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  previewBadgeText: {
    color: '#E11D48',
    fontSize: 10,
    fontWeight: '600',
  },
  previewAddressText: {
    fontSize: 11,
    color: '#64748B',
  },
  previewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewDistanceText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  previewOpenText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '600',
  },
});
