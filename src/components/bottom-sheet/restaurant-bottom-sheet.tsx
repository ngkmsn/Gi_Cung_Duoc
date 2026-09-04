import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { RestaurantCard } from '@/components/restaurant-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Restaurant } from '@/types/restaurant';

interface RestaurantBottomSheetProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant | null) => void;
  onOpenDetail?: (restaurant: Restaurant) => void;
  userLocation?: { latitude: number; longitude: number };
  searchQuery?: string;
  selectedRadiusKm?: number | null;
  hasActiveSearchOrFilter?: boolean;
  onQuickFilterSelect?: (type: 'category' | 'radius' | 'query' | 'openNow', value: any) => void;
  onClearSearch?: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  bottomInset: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Height snap points
const SNAP_PEEK = 200;
const SNAP_HALF = Math.round(SCREEN_HEIGHT * 0.5);
const SNAP_EXPANDED = Math.round(SCREEN_HEIGHT * 0.85);

export function RestaurantBottomSheet({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onOpenDetail,
  userLocation,
  searchQuery,
  selectedRadiusKm,
  hasActiveSearchOrFilter = false,
  onQuickFilterSelect,
  onClearSearch,
  refreshing,
  onRefresh,
  bottomInset,
}: RestaurantBottomSheetProps) {
  const sheetHeight = useRef(new Animated.Value(SNAP_HALF)).current;
  const currentHeight = useRef(SNAP_HALF);
  const [snapState, setSnapState] = useState<'peek' | 'half' | 'expanded'>('half');

  const animateToHeight = (targetHeight: number, state: 'peek' | 'half' | 'expanded') => {
    currentHeight.current = targetHeight;
    setSnapState(state);
    Animated.spring(sheetHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 8,
      tension: 65,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const newH = currentHeight.current - gestureState.dy;
        if (newH >= SNAP_PEEK - 30 && newH <= SNAP_EXPANDED + 30) {
          sheetHeight.setValue(newH);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalH = currentHeight.current - gestureState.dy;

        if (gestureState.vy < -0.5 || finalH > (SNAP_HALF + SNAP_EXPANDED) / 2) {
          animateToHeight(SNAP_EXPANDED, 'expanded');
        } else if (gestureState.vy > 0.5 || finalH < (SNAP_PEEK + SNAP_HALF) / 2) {
          animateToHeight(SNAP_PEEK, 'peek');
        } else {
          animateToHeight(SNAP_HALF, 'half');
        }
      },
    })
  ).current;

  const handleToggleExpand = () => {
    if (snapState === 'peek') {
      animateToHeight(SNAP_HALF, 'half');
    } else if (snapState === 'half') {
      animateToHeight(SNAP_EXPANDED, 'expanded');
    } else {
      animateToHeight(SNAP_PEEK, 'peek');
    }
  };

  const handleCardPress = (item: Restaurant) => {
    onSelectRestaurant(item);
    if (onOpenDetail) {
      onOpenDetail(item);
    }
  };

  const headerTitle = !hasActiveSearchOrFilter
    ? 'Khám phá quán ngon'
    : searchQuery?.trim()
    ? `Kết quả: "${searchQuery.trim()}"`
    : selectedRadiusKm
    ? `Quán trong bán kính ${selectedRadiusKm} km`
    : 'Quán ăn phù hợp bộ lọc';

  return (
    <Animated.View
      style={[
        styles.sheetContainer,
        {
          height: sheetHeight,
        },
      ]}>
      {/* Draggable Header */}
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={styles.dragPill} />

        <Pressable onPress={handleToggleExpand} style={styles.sheetHeaderRow}>
          <View style={styles.headerTitleCol}>
            <View style={styles.titleWithBadge}>
              <ThemedText style={styles.sheetTitle} numberOfLines={1}>
                {headerTitle}
              </ThemedText>
              <View style={styles.countBadge}>
                <ThemedText style={styles.countBadgeText}>
                  {hasActiveSearchOrFilter ? `${restaurants.length} quán` : 'Gợi ý'}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.sheetSubtitle}>
              {snapState === 'expanded'
                ? 'Vuốt xuống để xem bản đồ rộng hơn'
                : hasActiveSearchOrFilter
                ? 'Chạm quán để xem chi tiết • Kéo lên để mở rộng'
                : 'Nhập tìm kiếm hoặc chọn bộ lọc để xem danh sách quán'}
            </ThemedText>
          </View>

          <View style={styles.toggleBtn}>
            <ThemedText style={styles.toggleIcon}>
              {snapState === 'expanded' ? '▼' : snapState === 'peek' ? '▲' : '⇅'}
            </ThemedText>
          </View>
        </Pressable>
      </View>

      {/* Restaurant List */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedRestaurant?.id === item.id;
          return (
            <View style={[styles.cardWrapper, isSelected && styles.cardWrapperSelected]}>
              <RestaurantCard
                restaurant={item}
                userLocation={userLocation}
                onPressCard={() => handleCardPress(item)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          !hasActiveSearchOrFilter ? (
            <View style={styles.discoveryContainer}>
              <ThemedText style={styles.emptyIcon}>🍜</ThemedText>
              <ThemedText style={styles.emptyTitle}>Tìm kiếm quán ăn quanh bạn</ThemedText>
              <ThemedText style={styles.emptyDesc}>
                Nhập tên món ăn ở trên hoặc chọn nhanh một trong các gợi ý bên dưới:
              </ThemedText>

              <View style={styles.suggestionGrid}>
                <Pressable
                  onPress={() => onQuickFilterSelect?.('query', 'phở')}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}>
                  <ThemedText style={styles.suggestionText}>🍜 Phở Hà Nội</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => onQuickFilterSelect?.('category', 'coffee')}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}>
                  <ThemedText style={styles.suggestionText}>☕ Cà Phê & Trà</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => onQuickFilterSelect?.('radius', 3)}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}>
                  <ThemedText style={styles.suggestionText}>📍 Gần tôi (&lt; 3 km)</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => onQuickFilterSelect?.('openNow', true)}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}>
                  <ThemedText style={styles.suggestionText}>🟢 Đang mở cửa</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => onQuickFilterSelect?.('category', 'vietnamese')}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}>
                  <ThemedText style={styles.suggestionText}>🥢 Món Việt</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => onQuickFilterSelect?.('category', 'western')}
                  style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}>
                  <ThemedText style={styles.suggestionText}>🍕 Đồ Tây & Pizza</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>🔍</ThemedText>
              <ThemedText style={styles.emptyTitle}>Không tìm thấy quán nào</ThemedText>
              <ThemedText style={styles.emptyDesc}>
                {searchQuery
                  ? `Không có quán hay món ăn "${searchQuery}" nào trong phạm vi tìm kiếm hiện tại.`
                  : 'Không có quán ăn nào phù hợp với bộ lọc hiện tại.'}
              </ThemedText>
              {onClearSearch && (
                <Pressable onPress={onClearSearch} style={styles.emptyResetBtn}>
                  <ThemedText style={styles.emptyResetBtnText}>✕ Đặt lại tất cả bộ lọc</ThemedText>
                </Pressable>
              )}
            </View>
          )
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 40,
    overflow: 'hidden',
  },
  handleArea: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    cursor: Platform.OS === 'web' ? 'grab' : 'auto',
  } as any,
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 8,
  },
  sheetHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  headerTitleCol: {
    flex: 1,
    gap: 2,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#E11D48',
    fontSize: 12,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleIcon: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1,
  },
  cardWrapper: {
    width: '100%',
  },
  cardWrapperSelected: {
    transform: [{ scale: 1.01 }],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyResetBtn: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  emptyResetBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  discoveryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 10,
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  pressed: {
    opacity: 0.8,
  },
});
