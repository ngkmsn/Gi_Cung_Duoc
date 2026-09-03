import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RestaurantBottomSheet } from '@/components/bottom-sheet/restaurant-bottom-sheet';
import { MapLibreMapTilerView } from '@/components/map/maplibre-maptiler-view';
import { RestaurantDetailModal } from '@/components/restaurant-detail-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { searchRestaurants } from '@/services/restaurantService';
import { Restaurant } from '@/types/restaurant';

const RADIUS_OPTIONS = [
  { id: 'all', label: '🎯 Tất cả', value: null },
  { id: '1km', label: '📍 1 km', value: 1 },
  { id: '3km', label: '📍 3 km', value: 3 },
  { id: '5km', label: '📍 5 km', value: 5 },
  { id: '10km', label: '📍 10 km', value: 10 },
];

const FILTER_TAGS = [
  { id: 'all', label: 'Tất cả món', value: '' },
  { id: 'vietnamese', label: '🍜 Món Việt', value: 'vietnamese' },
  { id: 'coffee', label: '☕ Cà Phê', value: 'coffee' },
  { id: 'western', label: '🍕 Đồ Tây', value: 'western' },
  { id: 'japanese', label: '🍣 Đồ Nhật', value: 'japanese' },
  { id: 'dessert', label: '🍨 Tráng Miệng', value: 'dessert' },
];

export default function RestaurantSearchScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const params = useLocalSearchParams<{ search?: string }>();
  const userLoc = useUserLocation();

  const [query, setQuery] = useState(params.search || '');
  const [activeTag, setActiveTag] = useState(params.search || '');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailModalRestaurant, setDetailModalRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(
    async (searchQuery: string, radiusVal: number | null = selectedRadius, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const results = await searchRestaurants(searchQuery, {
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
          radius: radiusVal ?? undefined,
        });
        setRestaurants(results);
        if (results.length > 0 && selectedRestaurant) {
          const exists = results.find((r) => r.id === selectedRestaurant.id);
          if (!exists) setSelectedRestaurant(null);
        }
      } catch (err) {
        setError('Không thể kết nối đến máy chủ. Đang hiển thị dữ liệu mẫu.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedRadius, selectedRestaurant, userLoc.latitude, userLoc.longitude]
  );

  // Sync params or location if changed
  useEffect(() => {
    const initialQuery = params.search || '';
    setQuery(initialQuery);
    setActiveTag(initialQuery);
    fetchRestaurants(initialQuery, selectedRadius);
  }, [params.search, fetchRestaurants, selectedRadius]);

  const handleSearch = (searchVal: string = query) => {
    setActiveTag(searchVal);
    fetchRestaurants(searchVal, selectedRadius);
  };

  const handleSelectTag = (tagVal: string) => {
    setActiveTag(tagVal);
    setQuery(tagVal);
    fetchRestaurants(tagVal, selectedRadius);
  };

  const handleSelectRadius = (radiusVal: number | null) => {
    setSelectedRadius(radiusVal);
    fetchRestaurants(query, radiusVal);
  };

  const handleClear = () => {
    setQuery('');
    setActiveTag('');
    fetchRestaurants('', selectedRadius);
  };

  const handleOpenDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailModalRestaurant(restaurant);
  };

  const bottomInset = safeAreaInsets.bottom + BottomTabInset;

  return (
    <ThemedView style={styles.screenContainer}>
      {/* 1. MapLibre + MapTiler Embedded Interactive Map with Radius Circle */}
      <MapLibreMapTilerView
        restaurants={restaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
        onOpenDetail={handleOpenDetail}
        selectedRadiusKm={selectedRadius}
        userLocation={{
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }}
      />

      {/* 2. Floating Top Header: Search Bar & Radius + Category Filters */}
      <View
        style={[
          styles.floatingHeaderContainer,
          {
            paddingTop: Platform.OS === 'web' ? Spacing.three : safeAreaInsets.top + Spacing.one,
          },
        ]}>
        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <View style={[styles.searchInputRow, { backgroundColor: theme.background }]}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.text,
                },
              ]}
              placeholder="Tìm quán ngon, món ăn, cà phê..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearch(query)}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && Platform.OS !== 'ios' && (
              <Pressable onPress={handleClear} style={styles.clearButton}>
                <ThemedText type="small" themeColor="textSecondary">
                  ✕
                </ThemedText>
              </Pressable>
            )}

            <Pressable
              onPress={() => handleSearch(query)}
              style={({ pressed }) => [styles.searchActionBtn, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.searchActionText}>
                Tìm
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Filters Carousel Row 1: Radius Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTagsList}>
          {/* Real GPS Location Indicator Tag */}
          <Pressable
            onPress={() => userLoc.refreshLocation()}
            style={({ pressed }) => [
              styles.locationStatusPill,
              userLoc.isRealLocation ? styles.locationPillGps : styles.locationPillDefault,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.locationPillText}>
              {userLoc.isRealLocation ? '📍 GPS: ' : '📍 '}
              {userLoc.addressLabel.split(',')[0]}
            </ThemedText>
          </Pressable>

          {/* Radius Selector Pills */}
          {RADIUS_OPTIONS.map((opt) => {
            const isSelected = selectedRadius === opt.value;
            return (
              <Pressable
                key={opt.id}
                onPress={() => handleSelectRadius(opt.value)}
                style={({ pressed }) => [
                  styles.radiusChip,
                  isSelected ? styles.radiusChipSelected : styles.radiusChipNormal,
                  pressed && styles.pressed,
                ]}>
                <ThemedText
                  style={[
                    styles.radiusChipText,
                    isSelected && styles.radiusChipTextSelected,
                  ]}>
                  {opt.label}
                </ThemedText>
              </Pressable>
            );
          })}

          <View style={styles.filterDivider} />

          {/* Category Chips */}
          {FILTER_TAGS.map((tag) => {
            const isSelected = activeTag.toLowerCase() === tag.value.toLowerCase();
            return (
              <Pressable
                key={tag.id}
                onPress={() => handleSelectTag(tag.value)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? '#FF5A5F' : '#FFFFFF',
                    borderColor: isSelected ? '#FF5A5F' : '#E5E7EB',
                  },
                  pressed && styles.pressed,
                ]}>
                <ThemedText
                  type="small"
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : '#374151' },
                    isSelected && styles.filterChipTextSelected,
                  ]}>
                  {tag.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Loading Indicator Pill on Map */}
      {loading && (
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color="#FF5A5F" />
          <ThemedText style={styles.loadingPillText}>Đang cập nhật quán gần bạn...</ThemedText>
        </View>
      )}

      {/* 3. Draggable Bottom Sheet for Restaurant Cards with Distances */}
      <RestaurantBottomSheet
        restaurants={restaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
        onOpenDetail={handleOpenDetail}
        userLocation={{
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }}
        refreshing={refreshing}
        onRefresh={() => fetchRestaurants(query, selectedRadius, true)}
        bottomInset={bottomInset}
      />

      {/* 4. Rich Restaurant Detail Modal */}
      <RestaurantDetailModal
        restaurant={detailModalRestaurant}
        visible={Boolean(detailModalRestaurant)}
        onClose={() => setDetailModalRestaurant(null)}
        userLocation={{
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F3F6F9',
  },
  floatingHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 35,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchBarWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchIcon: {
    fontSize: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    outlineStyle: 'none',
  } as any,
  clearButton: {
    padding: 4,
  },
  searchActionBtn: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  searchActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTagsList: {
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  locationStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  locationPillGps: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  locationPillDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  radiusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  radiusChipNormal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  radiusChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  radiusChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  radiusChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    fontWeight: '700',
  },
  loadingPill: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 110 : 130,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 30,
  },
  loadingPillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
