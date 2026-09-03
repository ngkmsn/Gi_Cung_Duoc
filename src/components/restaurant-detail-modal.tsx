import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Restaurant } from '@/types/restaurant';
import { calculateDistanceKm, DEFAULT_USER_LOCATION, formatDistance } from '@/utils/distance';
import { openMapsNavigation } from '@/utils/navigation';
import { formatRestaurantPrice } from '@/utils/price';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  visible: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
  onToggleFavorite?: (restaurant: Restaurant) => void;
  isFavorite?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  vietnamese: '🍜',
  coffee: '☕',
  western: '🍕',
  japanese: '🍣',
  dessert: '🍨',
};

const FACILITY_LABELS: Record<string, { label: string; icon: string }> = {
  AC: { label: 'Điều hòa mát lạnh', icon: '❄️' },
  Wifi: { label: 'Wifi miễn phí', icon: '📶' },
  Parking: { label: 'Có chỗ đỗ xe', icon: '🅿️' },
  'Credit Card': { label: 'Thanh toán thẻ', icon: '💳' },
  'Private Room': { label: 'Phòng riêng tư', icon: '🚪' },
};

const DAYS_OF_WEEK = [
  { key: 'monday', name: 'Thứ 2' },
  { key: 'tuesday', name: 'Thứ 3' },
  { key: 'wednesday', name: 'Thứ 4' },
  { key: 'thursday', name: 'Thứ 5' },
  { key: 'friday', name: 'Thứ 6' },
  { key: 'saturday', name: 'Thứ 7' },
  { key: 'sunday', name: 'Chủ nhật' },
];

export function RestaurantDetailModal({
  restaurant,
  visible,
  onClose,
  userLocation = DEFAULT_USER_LOCATION,
  onToggleFavorite,
  isFavorite: initialFavorite = false,
}: RestaurantDetailModalProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [showAllHours, setShowAllHours] = useState(false);

  if (!restaurant) return null;

  const lat = typeof restaurant.latitude === 'string' ? parseFloat(restaurant.latitude) : restaurant.latitude;
  const lon = typeof restaurant.longitude === 'string' ? parseFloat(restaurant.longitude) : restaurant.longitude;

  const distanceKm =
    lat && lon && userLocation
      ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, lat, lon)
      : null;

  const formattedDistance = distanceKm !== null ? formatDistance(distanceKm) : null;
  const primaryCat = restaurant.categories?.[0];
  const catIcon = primaryCat ? CATEGORY_ICONS[primaryCat.slug?.toLowerCase()] || '🍽️' : '🍽️';

  const handleToggleFavorite = () => {
    setFavorite(!favorite);
    if (onToggleFavorite) onToggleFavorite(restaurant);
  };

  const handleDirections = () => {
    openMapsNavigation({
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      name: restaurant.name,
      address: restaurant.address,
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View
          style={[
            styles.modalContentContainer,
            { paddingBottom: Math.max(safeAreaInsets.bottom, 20) },
          ]}>
          {/* Top Drag Indicator */}
          <View style={styles.dragPillWrapper}>
            <View style={styles.dragPill} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* 1. Hero Food Image Banner with Badges & Action Buttons */}
            <View style={styles.heroImageWrapper}>
              <Image
                source={{
                  uri:
                    restaurant.image_url ||
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
                }}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />

              {/* Close Button */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.closeBtnIcon}>✕</ThemedText>
              </Pressable>

              {/* Favorite Button */}
              <Pressable
                onPress={handleToggleFavorite}
                style={({ pressed }) => [styles.favoriteBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.favoriteBtnIcon}>{favorite ? '❤️' : '🤍'}</ThemedText>
              </Pressable>

              {/* Highlight / Michelin Badge */}
              {restaurant.badge && (
                <View style={styles.heroBadge}>
                  <ThemedText style={styles.heroBadgeText}>✨ {restaurant.badge}</ThemedText>
                </View>
              )}
            </View>

            {/* 2. Restaurant Main Information */}
            <View style={styles.bodyDetails}>
              {/* Title and Price Pill */}
              <View style={styles.titleRow}>
                <ThemedText style={styles.restaurantTitle}>{restaurant.name}</ThemedText>
                <View style={styles.pricePill}>
                  <ThemedText style={styles.pricePillText}>
                    💰 {formatRestaurantPrice(restaurant.min_price, restaurant.max_price, restaurant.price_range)}
                  </ThemedText>
                </View>
              </View>

              {/* Rating, Category & Reviews */}
              <View style={styles.metaRow}>
                <View style={styles.ratingBadge}>
                  <ThemedText style={styles.ratingStar}>★</ThemedText>
                  <ThemedText style={styles.ratingValue}>
                    {restaurant.rating ? restaurant.rating.toFixed(1) : '4.8'}
                  </ThemedText>
                </View>

                {restaurant.review_count && (
                  <ThemedText style={styles.reviewCountText}>
                    ({restaurant.review_count.toLocaleString()} đánh giá)
                  </ThemedText>
                )}

                {primaryCat && (
                  <View style={styles.categoryChip}>
                    <ThemedText style={styles.categoryChipText}>
                      {catIcon} {primaryCat.name}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Distance from Real Location */}
              {formattedDistance && (
                <View style={styles.distanceBanner}>
                  <ThemedText style={styles.distanceBannerIcon}>🛵</ThemedText>
                  <ThemedText style={styles.distanceBannerText}>
                    Cách vị trí của bạn <ThemedText style={styles.boldText}>{formattedDistance}</ThemedText>
                  </ThemedText>
                  <View style={styles.openNowPill}>
                    <ThemedText style={styles.openNowDot}>●</ThemedText>
                    <ThemedText style={styles.openNowText}>Đang mở cửa</ThemedText>
                  </View>
                </View>
              )}

              {/* Specialty Signature Dish */}
              {restaurant.specialty_dish && (
                <View style={styles.infoSectionCard}>
                  <ThemedText style={styles.sectionHeader}>Món đặc sắc nức tiếng 🌟</ThemedText>
                  <ThemedText style={styles.specialtyDishText}>
                    {restaurant.specialty_dish}
                  </ThemedText>
                </View>
              )}

              {/* Address Section */}
              <View style={styles.infoSectionCard}>
                <ThemedText style={styles.sectionHeader}>Địa chỉ & Vị trí 📍</ThemedText>
                <ThemedText style={styles.addressFullText}>
                  {restaurant.address || 'Hà Nội, Việt Nam'}
                </ThemedText>
              </View>

              {/* Facilities & Amenities */}
              {restaurant.facilities && restaurant.facilities.length > 0 && (
                <View style={styles.infoSectionCard}>
                  <ThemedText style={styles.sectionHeader}>Tiện ích phục vụ 🛎️</ThemedText>
                  <View style={styles.facilitiesGrid}>
                    {restaurant.facilities.map((fac) => {
                      const item = FACILITY_LABELS[fac] || { label: fac, icon: '✨' };
                      return (
                        <View key={fac} style={styles.facilityPill}>
                          <ThemedText style={styles.facilityIcon}>{item.icon}</ThemedText>
                          <ThemedText style={styles.facilityLabel}>{item.label}</ThemedText>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Opening Hours Section */}
              {restaurant.opening_hours && (
                <View style={styles.infoSectionCard}>
                  <View style={styles.hoursHeaderRow}>
                    <ThemedText style={styles.sectionHeader}>Giờ mở cửa ⏱️</ThemedText>
                    <Pressable onPress={() => setShowAllHours(!showAllHours)}>
                      <ThemedText style={styles.toggleHoursText}>
                        {showAllHours ? 'Thu gọn' : 'Xem cả tuần ▾'}
                      </ThemedText>
                    </Pressable>
                  </View>

                  <ThemedText style={styles.todayHoursText}>
                    Hôm nay: {restaurant.opening_hours.monday?.open || '08:00'} -{' '}
                    {restaurant.opening_hours.monday?.close || '22:00'}
                  </ThemedText>

                  {showAllHours && (
                    <View style={styles.weeklyHoursList}>
                      {DAYS_OF_WEEK.map((day) => {
                        const sched = restaurant.opening_hours?.[day.key];
                        return (
                          <View key={day.key} style={styles.weeklyHourRow}>
                            <ThemedText style={styles.dayNameText}>{day.name}</ThemedText>
                            <ThemedText style={styles.dayTimeText}>
                              {sched ? `${sched.open} - ${sched.close}` : '08:00 - 22:00'}
                            </ThemedText>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* 3. Bottom Sticky Action: Big "Chỉ đường" Navigation Button */}
          <View style={styles.footerActionContainer}>
            <Pressable
              onPress={handleDirections}
              style={({ pressed }) => [styles.primaryDirectionsBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.primaryDirectionsIcon}>🧭</ThemedText>
              <ThemedText style={styles.primaryDirectionsText}>
                Chỉ đường (Google Maps / Apple Maps)
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  dragPillWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragPill: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  heroImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },
  favoriteBtnIcon: {
    fontSize: 18,
  },
  heroBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bodyDetails: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  restaurantTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    lineHeight: 28,
  },
  pricePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pricePillText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingStar: {
    color: '#D97706',
    fontSize: 13,
  },
  ratingValue: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCountText: {
    color: '#64748B',
    fontSize: 13,
  },
  categoryChip: {
    marginLeft: 'auto',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    color: '#E11D48',
    fontSize: 12,
    fontWeight: '700',
  },
  distanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 8,
  },
  distanceBannerIcon: {
    fontSize: 16,
  },
  distanceBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
  },
  boldText: {
    fontWeight: '700',
  },
  openNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  openNowDot: {
    color: '#10B981',
    fontSize: 8,
  },
  openNowText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  infoSectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  specialtyDishText: {
    fontSize: 14,
    color: '#E11D48',
    fontWeight: '600',
    lineHeight: 20,
  },
  addressFullText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  facilityIcon: {
    fontSize: 12,
  },
  facilityLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  hoursHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleHoursText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  todayHoursText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  weeklyHoursList: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 6,
  },
  weeklyHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 12,
    color: '#64748B',
  },
  dayTimeText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  footerActionContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  primaryDirectionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryDirectionsIcon: {
    fontSize: 18,
  },
  primaryDirectionsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
