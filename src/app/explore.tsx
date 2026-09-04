import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { BudgetRange, BudgetSliderModal } from '@/components/budget-slider-modal';
import { MapLibreMapTilerView } from '@/components/map/maplibre-maptiler-view';
import { RestaurantDetailModal } from '@/components/restaurant-detail-modal';
import { SearchHistoryDropdown } from '@/components/search/search-history-dropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { searchRestaurants } from '@/services/restaurantService';
import {
  clearAllSearchHistory,
  getSearchHistory,
  removeSearchHistoryItem,
  saveSearchQuery,
  SearchHistoryItem,
} from '@/services/searchHistoryService';
import { Restaurant } from '@/types/restaurant';
import { formatVndCurrency } from '@/utils/price';

const MAX_BUDGET_LIMIT = 10_000_000;

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
  const [budgetRange, setBudgetRange] = useState<BudgetRange>({ min: 0, max: MAX_BUDGET_LIMIT });
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [onlyOpenNow, setOnlyOpenNow] = useState<boolean>(false);

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailModalRestaurant, setDetailModalRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<any>(null);

  const isBudgetFiltered = budgetRange.min > 0 || budgetRange.max < MAX_BUDGET_LIMIT;

  const fetchRestaurants = useCallback(
    async (
      searchQuery: string,
      radiusVal: number | null = selectedRadius,
      rangeVal: BudgetRange = budgetRange,
      openNowVal: boolean = onlyOpenNow,
      isRefresh = false
    ) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const hasBudgetFilter = rangeVal.min > 0 || rangeVal.max < MAX_BUDGET_LIMIT;

      try {
        const results = await searchRestaurants(searchQuery, {
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
          radius: radiusVal ?? undefined,
          min_budget: hasBudgetFilter ? rangeVal.min : undefined,
          max_budget: hasBudgetFilter ? rangeVal.max : undefined,
          open_now: openNowVal ? true : undefined,
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
    [budgetRange, onlyOpenNow, selectedRadius, selectedRestaurant, userLoc.latitude, userLoc.longitude]
  );

  // Load search history on component mount
  useEffect(() => {
    getSearchHistory().then(setSearchHistory);
  }, []);

  // Sync params or location if changed
  useEffect(() => {
    const initialQuery = params.search || '';
    setQuery(initialQuery);
    setActiveTag(initialQuery);
    fetchRestaurants(initialQuery, selectedRadius, budgetRange, onlyOpenNow);
  }, [params.search, fetchRestaurants, selectedRadius, budgetRange, onlyOpenNow]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setActiveTag(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchRestaurants(text, selectedRadius, budgetRange, onlyOpenNow);
    }, 280);
  };

  const handleSearchSubmit = (searchVal: string = query) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsSearchFocused(false);
    if (searchVal.trim()) {
      saveSearchQuery(searchVal.trim()).then(setSearchHistory);
    }
    setActiveTag(searchVal);
    fetchRestaurants(searchVal, selectedRadius, budgetRange, onlyOpenNow);
  };

  const handleSelectHistoryItem = (selectedQuery: string) => {
    setIsSearchFocused(false);
    setQuery(selectedQuery);
    setActiveTag(selectedQuery);
    saveSearchQuery(selectedQuery).then(setSearchHistory);
    fetchRestaurants(selectedQuery, selectedRadius, budgetRange, onlyOpenNow);
  };

  const handleRemoveHistoryItem = (id: string) => {
    removeSearchHistoryItem(id).then(setSearchHistory);
  };

  const handleClearAllHistory = () => {
    clearAllSearchHistory().then(() => setSearchHistory([]));
  };

  const handleSelectTag = (tagVal: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsSearchFocused(false);
    if (tagVal.trim()) {
      saveSearchQuery(tagVal.trim()).then(setSearchHistory);
    }
    setActiveTag(tagVal);
    setQuery(tagVal);
    fetchRestaurants(tagVal, selectedRadius, budgetRange, onlyOpenNow);
  };

  const handleSelectRadius = (radiusVal: number | null) => {
    setSelectedRadius(radiusVal);
    fetchRestaurants(query, radiusVal, budgetRange, onlyOpenNow);
  };

  const handleApplyBudgetRange = (range: BudgetRange) => {
    setBudgetRange(range);
    fetchRestaurants(query, selectedRadius, range, onlyOpenNow);
  };

  const handleToggleOpenNow = () => {
    const nextOpen = !onlyOpenNow;
    setOnlyOpenNow(nextOpen);
    fetchRestaurants(query, selectedRadius, budgetRange, nextOpen);
  };

  const handleResetFilters = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setQuery('');
    setActiveTag('');
    setSelectedRadius(null);
    setBudgetRange({ min: 0, max: MAX_BUDGET_LIMIT });
    setOnlyOpenNow(false);
    fetchRestaurants('', null, { min: 0, max: MAX_BUDGET_LIMIT }, false);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setQuery('');
    setActiveTag('');
    fetchRestaurants('', selectedRadius, budgetRange, onlyOpenNow);
  };

  const handleOpenDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailModalRestaurant(restaurant);
  };

  const activeFilterCount =
    (selectedRadius ? 1 : 0) +
    (isBudgetFiltered ? 1 : 0) +
    (onlyOpenNow ? 1 : 0) +
    (activeTag ? 1 : 0);

  const bottomInset = safeAreaInsets.bottom + BottomTabInset;
  const searchDropdownTopOffset =
    (Platform.OS === 'web' ? Spacing.three : safeAreaInsets.top + Spacing.one) + 52;

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
        isRealLocation={userLoc.isRealLocation}
      />

      {/* 2. Floating Top Header: Search Bar & Multi-Filter Carousel */}
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
              placeholder="Tìm món ăn (phở, bún chả...) hoặc tên quán..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={handleQueryChange}
              onFocus={() => {
                setIsSearchFocused(true);
                getSearchHistory().then(setSearchHistory);
              }}
              onSubmitEditing={() => handleSearchSubmit(query)}
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
              onPress={() => handleSearchSubmit(query)}
              style={({ pressed }) => [styles.searchActionBtn, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.searchActionText}>
                Tìm
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Multi-Filter Combined Chips Carousel */}
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

          {/* Reset All Filters Button when any filter is active */}
          {activeFilterCount > 0 && (
            <Pressable
              onPress={handleResetFilters}
              style={({ pressed }) => [styles.resetFilterBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.resetFilterText}>
                ✕ Đặt lại ({activeFilterCount})
              </ThemedText>
            </Pressable>
          )}

          {/* Budget Range Slider Trigger Pill */}
          <Pressable
            onPress={() => setIsBudgetModalVisible(true)}
            style={({ pressed }) => [
              styles.budgetFilterChip,
              isBudgetFiltered ? styles.budgetFilterChipActive : styles.budgetFilterChipInactive,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.budgetChipIcon}>🎚️</ThemedText>
            <ThemedText
              style={[
                styles.budgetChipText,
                isBudgetFiltered && styles.budgetChipTextActive,
              ]}>
              {isBudgetFiltered
                ? `Giá: ${formatVndCurrency(budgetRange.min)} - ${
                    budgetRange.max >= MAX_BUDGET_LIMIT ? '10tr+' : formatVndCurrency(budgetRange.max)
                  }`
                : 'Ngân sách (0 - 10tr) ▾'}
            </ThemedText>
          </Pressable>

          {/* Open/Closed Status Toggle */}
          <Pressable
            onPress={handleToggleOpenNow}
            style={({ pressed }) => [
              styles.toggleOpenBtn,
              onlyOpenNow ? styles.toggleOpenBtnActive : styles.toggleOpenBtnInactive,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.toggleOpenDot}>{onlyOpenNow ? '🟢' : '⚪'}</ThemedText>
            <ThemedText
              style={[
                styles.toggleOpenText,
                onlyOpenNow && styles.toggleOpenTextActive,
              ]}>
              Đang mở cửa
            </ThemedText>
          </Pressable>

          <View style={styles.filterDivider} />

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
          <ThemedText style={styles.loadingPillText}>Đang tìm quán ngon...</ThemedText>
        </View>
      )}

      {/* 3. Draggable Bottom Sheet for Restaurant Cards with Distances & Empty State */}
      <RestaurantBottomSheet
        restaurants={restaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
        onOpenDetail={handleOpenDetail}
        userLocation={{
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }}
        searchQuery={query}
        selectedRadiusKm={selectedRadius}
        onClearSearch={handleClear}
        refreshing={refreshing}
        onRefresh={() => fetchRestaurants(query, selectedRadius, budgetRange, onlyOpenNow, true)}
        bottomInset={bottomInset}
      />

      {/* 4. Interactive Range Slider Modal (0 - 10.000.000 VNĐ) */}
      <BudgetSliderModal
        visible={isBudgetModalVisible}
        onClose={() => setIsBudgetModalVisible(false)}
        budgetRange={budgetRange}
        onApplyRange={handleApplyBudgetRange}
      />

      {/* 5. Rich Restaurant Detail Modal */}
      <RestaurantDetailModal
        restaurant={detailModalRestaurant}
        visible={Boolean(detailModalRestaurant)}
        onClose={() => setDetailModalRestaurant(null)}
        userLocation={{
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }}
      />

      {/* 6. Recent Search History Dropdown Overlay */}
      <SearchHistoryDropdown
        visible={isSearchFocused}
        history={searchHistory}
        onSelectQuery={handleSelectHistoryItem}
        onRemoveItem={handleRemoveHistoryItem}
        onClearAll={handleClearAllHistory}
        onClose={() => setIsSearchFocused(false)}
        topOffset={searchDropdownTopOffset}
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
  resetFilterBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  resetFilterText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  budgetFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetFilterChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  budgetFilterChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  budgetChipIcon: {
    fontSize: 12,
  },
  budgetChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  budgetChipTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  toggleOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  toggleOpenBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  toggleOpenBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  toggleOpenDot: {
    fontSize: 10,
  },
  toggleOpenText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  toggleOpenTextActive: {
    color: '#059669',
    fontWeight: '700',
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
