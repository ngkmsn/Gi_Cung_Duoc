import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RestaurantCard } from '@/components/restaurant-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Restaurant } from '@/types/restaurant';

export default function FavoritesScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();

  const [favorites, setFavorites] = useState<Restaurant[]>([]);

  const [activeTab, setActiveTab] = useState('all');

  const handleRemoveFavorite = (restaurant: Restaurant) => {
    setFavorites((prev) => prev.filter((r) => r.id !== restaurant.id));
  };

  const filteredList =
    activeTab === 'all'
      ? favorites
      : favorites.filter((r) => r.categories?.some((c) => c.slug.includes(activeTab)));

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
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Quán Yêu Thích ❤️</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Bộ sưu tập các quán ngon và địa điểm bạn muốn thưởng thức.
            </ThemedText>
          </View>

          {/* Filter Pills */}
          {favorites.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}>
              <Pressable
                onPress={() => setActiveTab('all')}
                style={[styles.filterPill, activeTab === 'all' && styles.filterPillActive]}>
                <ThemedText
                  style={[styles.filterPillText, activeTab === 'all' && styles.filterPillTextActive]}>
                  Tất cả ({favorites.length})
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('vietnamese')}
                style={[styles.filterPill, activeTab === 'vietnamese' && styles.filterPillActive]}>
                <ThemedText
                  style={[
                    styles.filterPillText,
                    activeTab === 'vietnamese' && styles.filterPillTextActive,
                  ]}>
                  🍜 Món Việt
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('coffee')}
                style={[styles.filterPill, activeTab === 'coffee' && styles.filterPillActive]}>
                <ThemedText
                  style={[styles.filterPillText, activeTab === 'coffee' && styles.filterPillTextActive]}>
                  ☕ Cà Phê
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('western')}
                style={[styles.filterPill, activeTab === 'western' && styles.filterPillActive]}>
                <ThemedText
                  style={[styles.filterPillText, activeTab === 'western' && styles.filterPillTextActive]}>
                  🍕 Đồ Tây
                </ThemedText>
              </Pressable>
            </ScrollView>
          )}

          {/* List of Saved Restaurants */}
          {filteredList.length > 0 ? (
            <View style={styles.restaurantList}>
              {filteredList.map((item) => (
                <RestaurantCard
                  key={item.id}
                  restaurant={item}
                  isFavorite={true}
                  onPressFavorite={handleRemoveFavorite}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>🍽️</ThemedText>
              <ThemedText style={styles.emptyTitle}>Chưa có quán yêu thích</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Hãy khám phá bản đồ ẩm thực và nhấn vào biểu tượng trái tim để lưu lại quán ngon nhé!
              </ThemedText>
              <Pressable
                onPress={() => router.push('/explore')}
                style={({ pressed }) => [styles.exploreBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.exploreBtnText}>Khám phá bản đồ quán ngay ➔</ThemedText>
              </Pressable>
            </View>
          )}
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
    gap: Spacing.three,
  },
  header: {
    gap: 4,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  filterPillsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  filterPillActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  restaurantList: {
    gap: 4,
    marginTop: 4,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  exploreBtn: {
    marginTop: 10,
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
