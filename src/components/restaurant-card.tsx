import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Restaurant } from '@/types/restaurant';
import { calculateDistanceKm, DEFAULT_USER_LOCATION, formatDistance } from '@/utils/distance';
import { openMapsNavigation } from '@/utils/navigation';
import { formatRestaurantPrice } from '@/utils/price';

interface RestaurantCardProps {
  restaurant: Restaurant;
  userLocation?: { latitude: number; longitude: number };
  onPressFavorite?: (restaurant: Restaurant) => void;
  onPressCard?: (restaurant: Restaurant) => void;
  isFavorite?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  vietnamese: '🍜',
  coffee: '☕',
  western: '🍕',
  japanese: '🍣',
  dessert: '🍨',
};

export function RestaurantCard({
  restaurant,
  userLocation = DEFAULT_USER_LOCATION,
  onPressFavorite,
  onPressCard,
  isFavorite: initialFavorite = false,
}: RestaurantCardProps) {
  const [favorite, setFavorite] = useState(initialFavorite);

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
    if (onPressFavorite) onPressFavorite(restaurant);
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
    <Pressable
      onPress={() => onPressCard && onPressCard(restaurant)}
      style={({ pressed }) => [styles.cardContainer, pressed && styles.cardPressed]}>
      {/* 1. Food Image Header with Badges */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              restaurant.image_url ||
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {/* Top-left Featured / Highlight Badge */}
        {restaurant.badge && (
          <View style={styles.featuredBadge}>
            <ThemedText style={styles.featuredBadgeText}>✨ {restaurant.badge}</ThemedText>
          </View>
        )}

        {/* Top-right Favorite Heart Button */}
        <Pressable
          onPress={handleToggleFavorite}
          style={({ pressed }) => [styles.favoriteBtn, pressed && styles.favoriteBtnPressed]}>
          <ThemedText style={styles.favoriteIcon}>{favorite ? '❤️' : '🤍'}</ThemedText>
        </Pressable>

        {/* Bottom-right Time / Open Badge */}
        {restaurant.time_estimate && (
          <View style={styles.timeBadge}>
            <ThemedText style={styles.timeBadgeText}>⏱️ {restaurant.time_estimate}</ThemedText>
          </View>
        )}
      </View>

      {/* 2. Restaurant Body Details */}
      <View style={styles.contentBody}>
        {/* Title and Price Range */}
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <ThemedText style={styles.nameText} numberOfLines={1}>
              {restaurant.name}
            </ThemedText>
          </View>

          <View style={styles.pricePill}>
            <ThemedText style={styles.priceText}>
              💰 {formatRestaurantPrice(restaurant.min_price, restaurant.max_price, restaurant.price_range)}
            </ThemedText>
          </View>
        </View>

        {/* Rating and Reviews Row */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingBadge}>
            <ThemedText style={styles.ratingStar}>★</ThemedText>
            <ThemedText style={styles.ratingNumber}>
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

        {/* Specialty Dish Highlight */}
        {restaurant.specialty_dish && (
          <View style={styles.specialtyRow}>
            <ThemedText style={styles.specialtyLabel}>Món ngon:</ThemedText>
            <ThemedText style={styles.specialtyValue} numberOfLines={1}>
              {restaurant.specialty_dish}
            </ThemedText>
          </View>
        )}

        {/* Address and Distance Row */}
        <View style={styles.metaAddressRow}>
          <View style={styles.addressWrapper}>
            <ThemedText style={styles.metaIcon}>📍</ThemedText>
            <ThemedText numberOfLines={1} style={styles.addressText}>
              {restaurant.address || 'Hà Nội, Việt Nam'}
            </ThemedText>
          </View>

          {formattedDistance && (
            <View style={styles.distanceBadge}>
              <ThemedText style={styles.distanceText}>🛵 {formattedDistance}</ThemedText>
            </View>
          )}
        </View>

        {/* Action Buttons Row: "Chỉ đường" Navigation Button */}
        <View style={styles.actionsFooterRow}>
          <Pressable
            onPress={handleDirections}
            style={({ pressed }) => [styles.directionsBtn, pressed && styles.directionsBtnPressed]}>
            <ThemedText style={styles.directionsBtnIcon}>🧭</ThemedText>
            <ThemedText style={styles.directionsBtnText}>Chỉ đường</ThemedText>
          </Pressable>

          <View style={styles.openStatusBadge}>
            <ThemedText style={styles.openStatusDot}>●</ThemedText>
            <ThemedText style={styles.openStatusText}>Đang mở cửa</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  favoriteBtnPressed: {
    transform: [{ scale: 0.9 }],
  },
  favoriteIcon: {
    fontSize: 16,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  timeBadgeText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '700',
  },
  contentBody: {
    padding: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  titleCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  pricePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingStar: {
    color: '#F59E0B',
    fontSize: 14,
  },
  ratingNumber: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCountText: {
    color: '#64748B',
    fontSize: 12,
  },
  categoryChip: {
    marginLeft: 'auto',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryChipText: {
    color: '#E11D48',
    fontSize: 11,
    fontWeight: '600',
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  specialtyLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  specialtyValue: {
    flex: 1,
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
  },
  metaAddressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
    gap: 8,
  },
  addressWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  addressText: {
    flex: 1,
    color: '#64748B',
    fontSize: 12,
  },
  distanceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  actionsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  directionsBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  directionsBtnIcon: {
    fontSize: 14,
  },
  directionsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  openStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openStatusDot: {
    color: '#10B981',
    fontSize: 9,
  },
  openStatusText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
});
