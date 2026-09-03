import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Config } from '@/constants/Config';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const safeAreaInsets = useSafeAreaInsets();

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
          {/* 1. User Profile Header Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                }}
                style={styles.avatarImage}
              />
              <View style={styles.levelBadge}>
                <ThemedText style={styles.levelBadgeText}>VIP</ThemedText>
              </View>
            </View>

            <View style={styles.profileDetailsCol}>
              <ThemedText style={styles.userNameText}>Minh Trang</ThemedText>
              <ThemedText style={styles.userRoleText}>🍜 Tín đồ ẩm thực Hà Nội</ThemedText>
              <View style={styles.pointsBadge}>
                <ThemedText style={styles.pointsText}>🏆 420 điểm Foodie</ThemedText>
              </View>
            </View>
          </View>

          {/* 2. Foodie Activity Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>24</ThemedText>
              <ThemedText style={styles.statLabel}>Đã khám phá</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>4</ThemedText>
              <ThemedText style={styles.statLabel}>Yêu thích</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Đánh giá</ThemedText>
            </View>
          </View>

          {/* 3. Favorite Cuisines Tags */}
          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Khẩu Vị Ưa Thích 🍽️</ThemedText>
            <View style={styles.cuisinesTagsWrap}>
              <View style={styles.cuisineTag}>
                <ThemedText style={styles.cuisineTagText}>🍜 Phở Hà Nội</ThemedText>
              </View>
              <View style={styles.cuisineTag}>
                <ThemedText style={styles.cuisineTagText}>☕ Cà phê trứng</ThemedText>
              </View>
              <View style={styles.cuisineTag}>
                <ThemedText style={styles.cuisineTagText}>🍕 Pizza nướng củi</ThemedText>
              </View>
              <View style={styles.cuisineTag}>
                <ThemedText style={styles.cuisineTagText}>🍣 Sushi tươi</ThemedText>
              </View>
              <View style={styles.cuisineTag}>
                <ThemedText style={styles.cuisineTagText}>🍨 Kem Tràng Tiền</ThemedText>
              </View>
            </View>
          </View>

          {/* 4. App & System Settings */}
          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Cấu Hình & Hệ Thống ⚙️</ThemedText>
            <View style={styles.configRowsList}>
              <HintRow title="Môi trường" hint={<ThemedText type="code">{Config.APP_ENV}</ThemedText>} />
              <HintRow title="Máy chủ API" hint={<ThemedText type="code">{Config.API_URL}</ThemedText>} />
              <HintRow
                title="Dữ liệu mẫu"
                hint={
                  <ThemedText type="code">
                    {Config.MOCK_DATA ? 'Bật (20 quán Hà Nội)' : 'Tắt (Dùng Backend)'}
                  </ThemedText>
                }
              />
              <HintRow title="Phiên bản" hint={<ThemedText type="code">v1.2.0 (Modern UI)</ThemedText>} />
            </View>
          </View>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  avatarWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: '#FF5A5F',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileDetailsCol: {
    flex: 1,
    gap: 4,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  userRoleText: {
    fontSize: 13,
    color: '#64748B',
  },
  pointsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  pointsText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cuisinesTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cuisineTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  configRowsList: {
    gap: 8,
  },
});
