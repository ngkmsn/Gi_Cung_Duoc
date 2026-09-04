import React, { useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { formatVndCurrency, formatVndFull } from '@/utils/price';

export interface BudgetRange {
  min: number;
  max: number;
}

export interface UnifiedFilterState {
  budgetRange: BudgetRange;
  radius: number | null;
  category: string;
  openNow: boolean;
}

interface UnifiedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: UnifiedFilterState;
  onApplyFilters: (filters: UnifiedFilterState) => void;
  onResetFilters: () => void;
}

export const MAX_BUDGET_LIMIT = 10_000_000; // 10 triệu đồng

export const RADIUS_OPTIONS = [
  { id: 'all', label: '🎯 Tất cả', value: null },
  { id: '1km', label: '📍 1 km', value: 1 },
  { id: '3km', label: '📍 3 km', value: 3 },
  { id: '5km', label: '📍 5 km', value: 5 },
  { id: '10km', label: '📍 10 km', value: 10 },
];

export const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Tất cả món', icon: '🍽️', value: '' },
  { id: 'vietnamese', label: 'Món Việt', icon: '🍜', value: 'vietnamese' },
  { id: 'coffee', label: 'Cà Phê', icon: '☕', value: 'coffee' },
  { id: 'western', label: 'Đồ Tây', icon: '🍕', value: 'western' },
  { id: 'japanese', label: 'Đồ Nhật', icon: '🍣', value: 'japanese' },
  { id: 'dessert', label: 'Tráng Miệng', icon: '🍨', value: 'dessert' },
];

export const OPEN_STATUS_OPTIONS = [
  { id: 'all', label: 'Tất cả giờ', icon: '🕒', value: false },
  { id: 'open', label: 'Đang mở cửa', icon: '🟢', value: true },
];

const QUICK_PRICE_PRESETS: Array<{ label: string; min: number; max: number }> = [
  { label: 'Tất cả (0 - 10tr)', min: 0, max: MAX_BUDGET_LIMIT },
  { label: 'Bình dân (0 - 50k)', min: 0, max: 50_000 },
  { label: 'Ăn trưa & Cà phê (30k - 100k)', min: 30_000, max: 100_000 },
  { label: 'Lẩu nướng & Tụ tập (100k - 300k)', min: 100_000, max: 300_000 },
  { label: 'Nhà hàng sang (300k - 1tr)', min: 300_000, max: 1_000_000 },
  { label: 'Fine Dining (1tr - 10tr)', min: 1_000_000, max: MAX_BUDGET_LIMIT },
];

function positionToPrice(pos: number): number {
  const p = Math.max(0, Math.min(1, pos));
  if (p <= 0.25) {
    const val = (p / 0.25) * 100_000;
    return Math.round(val / 5_000) * 5_000;
  } else if (p <= 0.5) {
    const val = 100_000 + ((p - 0.25) / 0.25) * 400_000;
    return Math.round(val / 20_000) * 20_000;
  } else if (p <= 0.75) {
    const val = 500_000 + ((p - 0.5) / 0.25) * 1_500_000;
    return Math.round(val / 100_000) * 100_000;
  } else {
    const val = 2_000_000 + ((p - 0.75) / 0.25) * 8_000_000;
    return Math.round(val / 500_000) * 500_000;
  }
}

function priceToPosition(price: number): number {
  const val = Math.max(0, Math.min(MAX_BUDGET_LIMIT, price));
  if (val <= 100_000) {
    return (val / 100_000) * 0.25;
  } else if (val <= 500_000) {
    return 0.25 + ((val - 100_000) / 400_000) * 0.25;
  } else if (val <= 2_000_000) {
    return 0.5 + ((val - 500_000) / 1_500_000) * 0.25;
  } else {
    return 0.75 + ((val - 2_000_000) / 8_000_000) * 0.25;
  }
}

export function UnifiedFilterModal({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: UnifiedFilterModalProps) {
  const safeAreaInsets = useSafeAreaInsets();

  const [minVal, setMinVal] = useState(filters.budgetRange.min);
  const [maxVal, setMaxVal] = useState(filters.budgetRange.max);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(filters.radius);
  const [selectedCategory, setSelectedCategory] = useState<string>(filters.category);
  const [openNow, setOpenNow] = useState<boolean>(filters.openNow);

  const trackWidthRef = useRef<number>(300);

  // Sync state when modal opens
  React.useEffect(() => {
    if (visible) {
      setMinVal(filters.budgetRange.min);
      setMaxVal(filters.budgetRange.max);
      setSelectedRadius(filters.radius);
      setSelectedCategory(filters.category);
      setOpenNow(filters.openNow);
    }
  }, [visible, filters]);

  const minPos = priceToPosition(minVal);
  const maxPos = priceToPosition(maxVal);

  const leftThumbPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const deltaPos = gesture.dx / trackWidthRef.current;
        const newPos = Math.max(0, Math.min(maxPos - 0.02, minPos + deltaPos));
        const newPrice = positionToPrice(newPos);
        setMinVal(Math.min(newPrice, maxVal));
      },
    })
  ).current;

  const rightThumbPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const deltaPos = gesture.dx / trackWidthRef.current;
        const newPos = Math.max(minPos + 0.02, Math.min(1, maxPos + deltaPos));
        const newPrice = positionToPrice(newPos);
        setMaxVal(Math.max(minVal, newPrice));
      },
    })
  ).current;

  const handleApply = () => {
    onApplyFilters({
      budgetRange: { min: minVal, max: maxVal },
      radius: selectedRadius,
      category: selectedCategory,
      openNow,
    });
    onClose();
  };

  const handleReset = () => {
    setMinVal(0);
    setMaxVal(MAX_BUDGET_LIMIT);
    setSelectedRadius(null);
    setSelectedCategory('');
    setOpenNow(false);
    onResetFilters();
    onClose();
  };

  const handleTrackClick = (e: any) => {
    const clickX = e.nativeEvent.locationX;
    const clickPos = clickX / trackWidthRef.current;
    const clickedPrice = positionToPrice(clickPos);

    const distToMin = Math.abs(clickPos - minPos);
    const distToMax = Math.abs(clickPos - maxPos);
    if (distToMin < distToMax) {
      setMinVal(Math.min(clickedPrice, maxVal));
    } else {
      setMaxVal(Math.max(minVal, clickedPrice));
    }
  };

  const isBudgetActive = minVal > 0 || maxVal < MAX_BUDGET_LIMIT;
  const isRadiusActive = selectedRadius !== null;
  const isCategoryActive = selectedCategory !== '';
  const isOpenNowActive = openNow === true;

  const totalActiveInModal =
    (isBudgetActive ? 1 : 0) +
    (isRadiusActive ? 1 : 0) +
    (isCategoryActive ? 1 : 0) +
    (isOpenNowActive ? 1 : 0);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            { paddingBottom: Math.max(safeAreaInsets.bottom, 16) },
          ]}>
          {/* Drag Indicator */}
          <View style={styles.dragPillWrapper}>
            <View style={styles.dragPill} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <View style={styles.titleWithBadgeRow}>
                <ThemedText style={styles.modalTitle}>Bộ Lọc Tổng Hợp</ThemedText>
                {totalActiveInModal > 0 && (
                  <View style={styles.activeCountBadge}>
                    <ThemedText style={styles.activeCountText}>{totalActiveInModal}</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={styles.modalSubtitle}>
                Lọc theo giá, bán kính, loại món và giờ mở cửa
              </ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <ThemedText style={styles.closeBtnText}>✕</ThemedText>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyScroll}>
            {/* 1. SECTION: GIÁ BÁN (SLIDER) */}
            <View style={styles.filterSectionCard}>
              <View style={styles.sectionTitleRow}>
                <ThemedText style={styles.sectionTitleText}>💰 Khoảng Giá (VNĐ)</ThemedText>
                <ThemedText style={styles.sectionSubtitleText}>
                  {formatVndCurrency(minVal)} - {maxVal >= MAX_BUDGET_LIMIT ? '10tr+' : formatVndCurrency(maxVal)}
                </ThemedText>
              </View>

              {/* Price Range Banner */}
              <View style={styles.priceBannerCard}>
                <View style={styles.priceBox}>
                  <ThemedText style={styles.priceBoxLabel}>TỐI THIỂU</ThemedText>
                  <ThemedText style={styles.priceBoxValue}>{formatVndFull(minVal)}</ThemedText>
                </View>

                <ThemedText style={styles.priceArrowText}>➔</ThemedText>

                <View style={styles.priceBox}>
                  <ThemedText style={styles.priceBoxLabel}>TỐI ĐA</ThemedText>
                  <ThemedText style={styles.priceBoxValue}>
                    {maxVal >= MAX_BUDGET_LIMIT ? '10 triệu đ+' : formatVndFull(maxVal)}
                  </ThemedText>
                </View>
              </View>

              {/* Dual-Thumb Slider */}
              <View
                style={styles.trackContainer}
                onLayout={(e) => {
                  trackWidthRef.current = Math.max(100, e.nativeEvent.layout.width);
                }}>
                <Pressable onPress={handleTrackClick} style={styles.trackBackground} />

                {/* Active Highlight Range Bar */}
                <View
                  style={[
                    styles.trackActive,
                    {
                      left: `${minPos * 100}%`,
                      width: `${Math.max(0, (maxPos - minPos) * 100)}%`,
                    },
                  ]}
                />

                {/* Left Thumb (Min Price) */}
                <View
                  {...leftThumbPan.panHandlers}
                  style={[
                    styles.thumb,
                    {
                      left: `${minPos * 100}%`,
                      marginLeft: -15,
                    },
                  ]}>
                  <View style={styles.thumbInnerCircle} />
                </View>

                {/* Right Thumb (Max Price) */}
                <View
                  {...rightThumbPan.panHandlers}
                  style={[
                    styles.thumb,
                    {
                      left: `${maxPos * 100}%`,
                      marginLeft: -15,
                    },
                  ]}>
                  <View style={styles.thumbInnerCircle} />
                </View>
              </View>

              {/* Scale Ticks */}
              <View style={styles.ticksRow}>
                <ThemedText style={styles.tickText}>0đ</ThemedText>
                <ThemedText style={styles.tickText}>100k</ThemedText>
                <ThemedText style={styles.tickText}>500k</ThemedText>
                <ThemedText style={styles.tickText}>2tr</ThemedText>
                <ThemedText style={styles.tickText}>10tr đ</ThemedText>
              </View>

              {/* Quick Preset Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsRow}>
                {QUICK_PRICE_PRESETS.map((p, idx) => {
                  const isSelected = minVal === p.min && maxVal === p.max;
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setMinVal(p.min);
                        setMaxVal(p.max);
                      }}
                      style={({ pressed }) => [
                        styles.presetChip,
                        isSelected && styles.presetChipActive,
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText
                        style={[
                          styles.presetChipText,
                          isSelected && styles.presetChipTextActive,
                        ]}>
                        {p.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. SECTION: BÁN KÍNH (BOX OPTIONS) */}
            <View style={styles.filterSectionCard}>
              <View style={styles.sectionTitleRow}>
                <ThemedText style={styles.sectionTitleText}>📍 Bán Kính Tìm Kiếm</ThemedText>
                <ThemedText style={styles.sectionSubtitleText}>
                  {selectedRadius ? `${selectedRadius} km quanh vị trí hiện tại` : 'Không giới hạn'}
                </ThemedText>
              </View>

              <View style={styles.boxesGrid}>
                {RADIUS_OPTIONS.map((opt) => {
                  const isSelected = selectedRadius === opt.value;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setSelectedRadius(opt.value)}
                      style={({ pressed }) => [
                        styles.boxItem,
                        isSelected && styles.boxItemActive,
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText
                        style={[
                          styles.boxItemText,
                          isSelected && styles.boxItemTextActive,
                        ]}>
                        {opt.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. SECTION: LOẠI ĐỒ ĂN (BOX OPTIONS) */}
            <View style={styles.filterSectionCard}>
              <View style={styles.sectionTitleRow}>
                <ThemedText style={styles.sectionTitleText}>🍽️ Thể Loại & Món Ăn</ThemedText>
                <ThemedText style={styles.sectionSubtitleText}>
                  {selectedCategory
                    ? CATEGORY_OPTIONS.find((c) => c.value === selectedCategory)?.label || selectedCategory
                    : 'Tất cả thể loại'}
                </ThemedText>
              </View>

              <View style={styles.boxesGrid}>
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.value.toLowerCase();
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.value)}
                      style={({ pressed }) => [
                        styles.boxItem,
                        isSelected && styles.boxItemActive,
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText style={styles.boxItemIcon}>{cat.icon}</ThemedText>
                      <ThemedText
                        style={[
                          styles.boxItemText,
                          isSelected && styles.boxItemTextActive,
                        ]}>
                        {cat.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 4. SECTION: GIỜ MỞ CỬA (BOX OPTIONS) */}
            <View style={styles.filterSectionCard}>
              <View style={styles.sectionTitleRow}>
                <ThemedText style={styles.sectionTitleText}>⏰ Trạng Thái Hoạt Động</ThemedText>
                <ThemedText style={styles.sectionSubtitleText}>
                  {openNow ? 'Chỉ hiện quán đang mở' : 'Tất cả quán'}
                </ThemedText>
              </View>

              <View style={styles.boxesGrid}>
                {OPEN_STATUS_OPTIONS.map((opt) => {
                  const isSelected = openNow === opt.value;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setOpenNow(opt.value)}
                      style={({ pressed }) => [
                        styles.boxItem,
                        styles.boxItemHalf,
                        isSelected && styles.boxItemActive,
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText style={styles.boxItemIcon}>{opt.icon}</ThemedText>
                      <ThemedText
                        style={[
                          styles.boxItemText,
                          isSelected && styles.boxItemTextActive,
                        ]}>
                        {opt.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.resetBtnText}>Đặt lại</ThemedText>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [styles.applyBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.applyBtnText}>
                Áp dụng {totalActiveInModal > 0 ? `(${totalActiveInModal} bộ lọc)` : 'tất cả'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTextCol: {
    flex: 1,
    gap: 2,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeCountBadge: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  bodyScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  filterSectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitleText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  priceBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  priceBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  priceBoxValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceArrowText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  trackContainer: {
    position: 'relative',
    height: 36,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  trackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  trackActive: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5A5F',
  },
  thumb: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    cursor: Platform.OS === 'web' ? 'ew-resize' : 'auto',
  } as any,
  thumbInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5F',
  },
  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  tickText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  presetsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FF5A5F',
  },
  presetChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#FF5A5F',
    fontWeight: '700',
  },
  boxesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  boxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minWidth: '28%',
    flexGrow: 1,
  },
  boxItemHalf: {
    minWidth: '45%',
  },
  boxItemActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FF5A5F',
  },
  boxItemIcon: {
    fontSize: 14,
  },
  boxItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  boxItemTextActive: {
    color: '#FF5A5F',
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
