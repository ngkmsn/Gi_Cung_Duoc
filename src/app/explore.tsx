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
import {
  CATEGORY_OPTIONS,
  MAX_BUDGET_LIMIT,
  RADIUS_OPTIONS,
  UnifiedFilterModal,
  UnifiedFilterState,
} from '@/components/filter/unified-filter-modal';
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

export default function RestaurantSearchScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const params = useLocalSearchParams<{ search?: string }>();
  const userLoc = useUserLocation();

  const [query, setQuery] = useState(params.search || '');
  const [filters, setFilters] = useState<UnifiedFilterState>({
    budgetRange: { min: 0, max: MAX_BUDGET_LIMIT },
    radius: null,
    category: params.search || '',
    openNow: false,
  });
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailModalRestaurant, setDetailModalRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<any>(null);
  const filtersRef = useRef<UnifiedFilterState>(filters);
  filtersRef.current = filters;
  const selectedRestaurantRef = useRef<Restaurant | null>(selectedRestaurant);
  selectedRestaurantRef.current = selectedRestaurant;

  const isBudgetFiltered =
    filters.budgetRange.min > 0 || filters.budgetRange.max < MAX_BUDGET_LIMIT;
  const isRadiusFiltered = filters.radius !== null && filters.radius > 0;
  const isCategoryFiltered = Boolean(filters.category && filters.category.trim().length > 0);
  const isOpenNowFiltered = filters.openNow === true;
  const isQueryFiltered = Boolean(query.trim().length > 0);

  const activeFilterCount =
    (isBudgetFiltered ? 1 : 0) +
    (isRadiusFiltered ? 1 : 0) +
    (isCategoryFiltered ? 1 : 0) +
    (isOpenNowFiltered ? 1 : 0);

  const hasActiveSearchOrFilter = isQueryFiltered || activeFilterCount > 0;

  const fetchRestaurants = useCallback(
    async (
      searchQuery: string,
      filterState: UnifiedFilterState = filtersRef.current,
      isRefresh = false
    ) => {
      const isBudget =
        filterState.budgetRange.min > 0 || filterState.budgetRange.max < MAX_BUDGET_LIMIT;
      const isRad = filterState.radius !== null && filterState.radius > 0;
      const isCat = Boolean(filterState.category && filterState.category.trim().length > 0);
      const isOpen = filterState.openNow === true;
      const isQ = Boolean(searchQuery.trim().length > 0);

      const hasActive = isQ || isCat || isRad || isOpen || isBudget;

      // When no search query or filter is active, do NOT fetch 3,000 restaurants
      if (!hasActive) {
        setRestaurants([]);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }

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
          radius: filterState.radius ?? undefined,
          min_budget: isBudget ? filterState.budgetRange.min : undefined,
          max_budget: isBudget ? filterState.budgetRange.max : undefined,
          category: filterState.category ? filterState.category : undefined,
          open_now: filterState.openNow ? true : undefined,
          limit: 50,
        });
        setRestaurants(results);
        if (results.length > 0 && selectedRestaurantRef.current) {
          const exists = results.find((r) => r.id === selectedRestaurantRef.current?.id);
          if (!exists) setSelectedRestaurant(null);
        }
      } catch (err) {
        setError('Không thể kết nối đến máy chủ.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userLoc.latitude, userLoc.longitude]
  );

  // Load search history on component mount
  useEffect(() => {
    getSearchHistory().then(setSearchHistory);
  }, []);

  // Sync params on initial mount or route param change
  useEffect(() => {
    const initialQuery = params.search || '';
    setQuery(initialQuery);
    const nextFilters: UnifiedFilterState = {
      ...filtersRef.current,
      category: initialQuery,
    };
    setFilters(nextFilters);
    fetchRestaurants(initialQuery, nextFilters);
  }, [params.search, fetchRestaurants]);

  const handleQueryChange = (text: string) => {
    setQuery(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchRestaurants(text, filtersRef.current);
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
    fetchRestaurants(searchVal, filtersRef.current);
  };

  const handleSelectHistoryItem = (selectedQuery: string) => {
    setIsSearchFocused(false);
    setQuery(selectedQuery);
    saveSearchQuery(selectedQuery).then(setSearchHistory);
    fetchRestaurants(selectedQuery, filtersRef.current);
  };

  const handleRemoveHistoryItem = (id: string) => {
    removeSearchHistoryItem(id).then(setSearchHistory);
  };

  const handleClearAllHistory = () => {
    clearAllSearchHistory().then(() => setSearchHistory([]));
  };

  const handleApplyUnifiedFilters = (nextFilters: UnifiedFilterState) => {
    setFilters(nextFilters);
    fetchRestaurants(query, nextFilters);
  };

  const handleResetFilters = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const defaultFilters: UnifiedFilterState = {
      budgetRange: { min: 0, max: MAX_BUDGET_LIMIT },
      radius: null,
      category: '',
      openNow: false,
    };
    setFilters(defaultFilters);
    fetchRestaurants(query, defaultFilters);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setQuery('');
    fetchRestaurants('', filtersRef.current);
  };

  const handleQuickFilterSelect = (
    type: 'category' | 'radius' | 'query' | 'openNow',
    value: any
  ) => {
    if (type === 'query') {
      setQuery(value);
      fetchRestaurants(value, filtersRef.current);
    } else if (type === 'category') {
      const nextFilters: UnifiedFilterState = {
        ...filtersRef.current,
        category: value,
      };
      setFilters(nextFilters);
      fetchRestaurants(query, nextFilters);
    } else if (type === 'radius') {
      const nextFilters: UnifiedFilterState = {
        ...filtersRef.current,
        radius: value,
      };
      setFilters(nextFilters);
      fetchRestaurants(query, nextFilters);
    } else if (type === 'openNow') {
      const nextFilters: UnifiedFilterState = {
        ...filtersRef.current,
        openNow: value,
      };
      setFilters(nextFilters);
      fetchRestaurants(query, nextFilters);
    }
  };

  const handleOpenDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailModalRestaurant(restaurant);
  };

  const selectedCategoryObj = CATEGORY_OPTIONS.find(
    (c) => c.value.toLowerCase() === filters.category.toLowerCase() && c.value !== ''
  );

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
        selectedRadiusKm={filters.radius}
        userLocation={{
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }}
        isRealLocation={userLoc.isRealLocation}
      />

      {/* 2. Floating Top Header: Search Bar & Unified Filter Bar */}
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

        {/* Combined Filter Triggers Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTagsList}>
          {/* Main Unified Filter Pill */}
          <Pressable
            onPress={() => setIsFilterModalVisible(true)}
            style={({ pressed }) => [
              styles.mainFilterBtn,
              activeFilterCount > 0 ? styles.mainFilterBtnActive : styles.mainFilterBtnNormal,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.mainFilterIcon}>🎚️</ThemedText>
            <ThemedText
              style={[
                styles.mainFilterText,
                activeFilterCount > 0 && styles.mainFilterTextActive,
              ]}>
              Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </ThemedText>
          </Pressable>

          {/* Real GPS Location Tag */}
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

          {/* Active Filter Badges */}
          {isBudgetFiltered && (
            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              style={({ pressed }) => [styles.activePillChip, pressed && styles.pressed]}>
              <ThemedText style={styles.activePillText}>
                💰 {formatVndCurrency(filters.budgetRange.min)} -{' '}
                {filters.budgetRange.max >= MAX_BUDGET_LIMIT
                  ? '10tr+'
                  : formatVndCurrency(filters.budgetRange.max)}
              </ThemedText>
            </Pressable>
          )}

          {isRadiusFiltered && (
            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              style={({ pressed }) => [styles.activePillChip, pressed && styles.pressed]}>
              <ThemedText style={styles.activePillText}>📍 {filters.radius} km</ThemedText>
            </Pressable>
          )}

          {selectedCategoryObj && (
            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              style={({ pressed }) => [styles.activePillChip, pressed && styles.pressed]}>
              <ThemedText style={styles.activePillText}>
                {selectedCategoryObj.icon} {selectedCategoryObj.label}
              </ThemedText>
            </Pressable>
          )}

          {isOpenNowFiltered && (
            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              style={({ pressed }) => [styles.activePillChip, pressed && styles.pressed]}>
              <ThemedText style={styles.activePillText}>🟢 Đang mở cửa</ThemedText>
            </Pressable>
          )}

          {/* Reset All Filters Button when any filter is active */}
          {activeFilterCount > 0 && (
            <Pressable
              onPress={handleResetFilters}
              style={({ pressed }) => [styles.resetFilterBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.resetFilterText}>
                ✕ Đặt lại tất cả
              </ThemedText>
            </Pressable>
          )}
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
        selectedRadiusKm={filters.radius}
        hasActiveSearchOrFilter={hasActiveSearchOrFilter}
        onQuickFilterSelect={handleQuickFilterSelect}
        onClearSearch={handleClear}
        refreshing={refreshing}
        onRefresh={() => fetchRestaurants(query, filters, true)}
        bottomInset={bottomInset}
      />

      {/* 4. Unified All-in-One Filter Modal (Slider for Price, Box grids for Radius, Category, Open status) */}
      <UnifiedFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleApplyUnifiedFilters}
        onResetFilters={handleResetFilters}
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
  mainFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainFilterBtnActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FF5A5F',
  },
  mainFilterBtnNormal: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  mainFilterIcon: {
    fontSize: 13,
  },
  mainFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  mainFilterTextActive: {
    color: '#FF5A5F',
    fontWeight: '800',
  },
  activePillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
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
