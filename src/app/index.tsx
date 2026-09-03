import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RestaurantCard } from '@/components/restaurant-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { MOCK_RESTAURANTS } from '@/services/restaurantService';
import { Restaurant } from '@/types/restaurant';

const CATEGORIES = [
  {
    id: 'vietnamese',
    name: 'Món Việt',
    icon: '🍜',
    query: 'vietnamese',
    img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
    color: '#FFF1F2',
  },
  {
    id: 'coffee',
    name: 'Cà Phê',
    icon: '☕',
    query: 'coffee',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    color: '#FEF3C7',
  },
  {
    id: 'western',
    name: 'Đồ Tây',
    icon: '🍕',
    query: 'western',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    color: '#FFEDD5',
  },
  {
    id: 'japanese',
    name: 'Đồ Nhật',
    icon: '🍣',
    query: 'japanese',
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80',
    color: '#FEE2E2',
  },
  {
    id: 'dessert',
    name: 'Tráng Miệng',
    icon: '🍨',
    query: 'dessert',
    img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80',
    color: '#F3E8FF',
  },
];

const COLLECTIONS = [
  {
    id: 'col-1',
    title: '☀️ Hương Vị Phố Cổ Hà Nội',
    subtitle: 'Phở Thìn, Bún Chả Hương Liên, Cà Phê Trứng Giảng',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    tag: 'Michelin & Di Sản',
    query: 'vietnamese',
  },
  {
    id: 'col-2',
    title: '☕ Hẹn Hò & Không Gian Chill',
    subtitle: 'Quán cà phê ban công ngắm Hồ Gươm, view phố cổ',
    image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80',
    tag: 'Trending',
    query: 'coffee',
  },
  {
    id: 'col-3',
    title: '🍕 Tụ Tập Cuối Tuần Chuẩn Vị',
    subtitle: 'Pizza phô mai tươi nướng củi, Steak hảo hạng & Sushi',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    tag: 'Yêu Thích',
    query: 'western',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const userLoc = useUserLocation();

  const [randomRestaurant, setRandomRestaurant] = useState<Restaurant>(MOCK_RESTAURANTS[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRandomPick = () => {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * MOCK_RESTAURANTS.length);
      setRandomRestaurant(MOCK_RESTAURANTS[idx]);
      count++;
      if (count > 6) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 80);
  };

  const handleNavigateExplore = (searchQuery: string = '') => {
    router.push({
      pathname: '/explore',
      params: searchQuery ? { search: searchQuery } : undefined,
    });
  };

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top + Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingBottom: insets.bottom,
    },
    ios: {
      paddingTop: insets.top + Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingHorizontal: Spacing.four,
      paddingBottom: insets.bottom + Spacing.four,
    },
  });

  return (
    <ThemedView style={styles.screenContainer}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <View style={styles.mainWrapper}>
          {/* 1. Header Location & App Branding */}
          <View style={styles.topHeaderRow}>
            <Pressable
              onPress={() => userLoc.refreshLocation()}
              style={styles.locationContainer}>
              <ThemedText style={styles.locationSmall}>
                {userLoc.isRealLocation ? 'Vị trí hiện tại (GPS)' : 'Giao / Ăn tại'}
              </ThemedText>
              <View style={styles.locationPickerBtn}>
                <ThemedText numberOfLines={1} style={styles.locationTitle}>
                  📍 {userLoc.addressLabel}
                </ThemedText>
                <ThemedText style={styles.locationChevron}>▾</ThemedText>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/profile')}
              style={({ pressed }) => [styles.profileAvatarBtn, pressed && styles.pressed]}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.profileAvatar}
              />
            </Pressable>
          </View>

          {/* 2. Hero Search Bar (Airbnb / Uber Eats style) */}
          <Pressable
            onPress={() => handleNavigateExplore()}
            style={({ pressed }) => [styles.searchBarContainer, pressed && styles.pressed]}>
            <View style={styles.searchBarInner}>
              <ThemedText style={styles.searchIcon}>🔍</ThemedText>
              <View style={styles.searchPlaceholderCol}>
                <ThemedText style={styles.searchPlaceholderText}>
                  Tìm phở, bún chả, cà phê trứng, pizza...
                </ThemedText>
                <ThemedText style={styles.searchSubPlaceholder}>
                  Hơn 20 quán ngon nổi bật quanh bạn
                </ThemedText>
              </View>
              <View style={styles.filterPillBtn}>
                <ThemedText style={styles.filterPillIcon}>⚡ Tìm</ThemedText>
              </View>
            </View>
          </Pressable>

          {/* 3. Category Story Circles */}
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Khám Phá Danh Mục</ThemedText>
              <Pressable onPress={() => handleNavigateExplore()}>
                <ThemedText style={styles.viewAllText}>Bản đồ ➔</ThemedText>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollList}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => handleNavigateExplore(cat.query)}
                  style={({ pressed }) => [styles.categoryCardItem, pressed && styles.pressed]}>
                  <View style={[styles.categoryImageWrapper, { backgroundColor: cat.color }]}>
                    <Image source={{ uri: cat.img }} style={styles.categoryImage} contentFit="cover" />
                    <View style={styles.categoryIconBadge}>
                      <ThemedText style={styles.categoryIcon}>{cat.icon}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.categoryNameText}>{cat.name}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* 4. "Gì Cũng Được" - Interactive Random Food Decider Widget */}
          <View style={styles.deciderWidgetCard}>
            <View style={styles.deciderHeaderRow}>
              <View style={styles.deciderBadge}>
                <ThemedText style={styles.deciderBadgeText}>🎲 Gì Cũng Được</ThemedText>
              </View>
              <ThemedText style={styles.deciderSubBadge}>Hôm nay chưa biết ăn gì?</ThemedText>
            </View>

            <View style={styles.deciderBodyRow}>
              <Image
                source={{
                  uri:
                    randomRestaurant.image_url ||
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.deciderImage}
                contentFit="cover"
              />
              <View style={styles.deciderInfoCol}>
                <ThemedText numberOfLines={1} style={styles.deciderRestaurantName}>
                  {randomRestaurant.name}
                </ThemedText>
                <ThemedText numberOfLines={1} style={styles.deciderSpecialtyText}>
                  ✨ {randomRestaurant.specialty_dish || 'Món ngon nức tiếng'}
                </ThemedText>
                <View style={styles.deciderMetaRow}>
                  <ThemedText style={styles.deciderRating}>
                    ★ {randomRestaurant.rating?.toFixed(1) || '4.8'}
                  </ThemedText>
                  <ThemedText style={styles.deciderPrice}>• {randomRestaurant.price_range}</ThemedText>
                  <ThemedText numberOfLines={1} style={styles.deciderAddress}>
                    • {randomRestaurant.address?.split(',')[0]}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.deciderActionsRow}>
              <Pressable
                onPress={handleRandomPick}
                disabled={isSpinning}
                style={({ pressed }) => [
                  styles.deciderSpinBtn,
                  pressed && styles.pressed,
                  isSpinning && styles.btnDisabled,
                ]}>
                <ThemedText style={styles.deciderSpinBtnText}>
                  {isSpinning ? 'Đang chọn món...' : '🎲 Đổi món khác'}
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => handleNavigateExplore(randomRestaurant.name)}
                style={({ pressed }) => [styles.deciderExploreBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.deciderExploreBtnText}>Xem trên bản đồ ➔</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* 5. Curated Food Collections */}
          <View style={styles.collectionsSection}>
            <ThemedText style={styles.sectionTitle}>Bộ Sưu Tập Nổi Bật ✨</ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionScrollList}>
              {COLLECTIONS.map((col) => (
                <Pressable
                  key={col.id}
                  onPress={() => handleNavigateExplore(col.query)}
                  style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}>
                  <Image source={{ uri: col.image }} style={styles.collectionImage} contentFit="cover" />
                  <View style={styles.collectionOverlay}>
                    <View style={styles.collectionTagPill}>
                      <ThemedText style={styles.collectionTagText}>{col.tag}</ThemedText>
                    </View>
                    <ThemedText style={styles.collectionTitleText}>{col.title}</ThemedText>
                    <ThemedText numberOfLines={1} style={styles.collectionSubtitleText}>
                      {col.subtitle}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* 6. Popular Restaurants List with Distances calculated from real GPS */}
          <View style={styles.restaurantsSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Quán Ngon Quanh Bạn ⭐</ThemedText>
              <Pressable onPress={() => handleNavigateExplore()}>
                <ThemedText style={styles.viewAllText}>Xem tất cả ({MOCK_RESTAURANTS.length})</ThemedText>
              </Pressable>
            </View>

            <View style={styles.restaurantCardsList}>
              {MOCK_RESTAURANTS.slice(0, 6).map((item) => (
                <RestaurantCard
                  key={item.id}
                  restaurant={item}
                  userLocation={{
                    latitude: userLoc.latitude,
                    longitude: userLoc.longitude,
                  }}
                />
              ))}
            </View>
          </View>

          {Platform.OS === 'web' && <WebBadge />}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mainWrapper: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    gap: Spacing.four,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  locationContainer: {
    gap: 2,
    flex: 1,
    paddingRight: 10,
  },
  locationSmall: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  locationChevron: {
    fontSize: 13,
    color: '#64748B',
  },
  profileAvatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF5A5F',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  searchBarContainer: {
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchPlaceholderCol: {
    flex: 1,
  },
  searchPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchSubPlaceholder: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  filterPillBtn: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  filterPillIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 13,
    color: '#FF5A5F',
    fontWeight: '700',
  },
  categoryScrollList: {
    gap: 14,
    paddingVertical: 4,
  },
  categoryCardItem: {
    alignItems: 'center',
    gap: 6,
    width: 76,
  },
  categoryImageWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryIcon: {
    fontSize: 11,
  },
  categoryNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  deciderWidgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    gap: 12,
  },
  deciderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deciderBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deciderBadgeText: {
    color: '#E11D48',
    fontSize: 12,
    fontWeight: '700',
  },
  deciderSubBadge: {
    fontSize: 12,
    color: '#94A3B8',
  },
  deciderBodyRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
  },
  deciderImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  deciderInfoCol: {
    flex: 1,
    gap: 3,
  },
  deciderRestaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  deciderSpecialtyText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '600',
  },
  deciderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deciderRating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  deciderPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  deciderAddress: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  deciderActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deciderSpinBtn: {
    flex: 1,
    backgroundColor: '#FF5A5F',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deciderSpinBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  deciderExploreBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deciderExploreBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  collectionsSection: {
    gap: 12,
  },
  collectionScrollList: {
    gap: 14,
    paddingVertical: 4,
  },
  collectionCard: {
    width: 250,
    height: 150,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: 12,
    justifyContent: 'flex-end',
    gap: 3,
  },
  collectionTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  collectionTagText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
  collectionTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  collectionSubtitleText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
  },
  restaurantsSection: {
    gap: 12,
  },
  restaurantCardsList: {
    gap: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
