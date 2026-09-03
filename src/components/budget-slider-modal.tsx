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

interface BudgetSliderModalProps {
  visible: boolean;
  onClose: () => void;
  budgetRange: BudgetRange;
  onApplyRange: (range: BudgetRange) => void;
}

const MAX_LIMIT = 10_000_000; // 10 triệu đồng

// Smart logarithmic/multi-segment conversion between 0..1 position and 0..10,000,000 VND
function positionToPrice(pos: number): number {
  const p = Math.max(0, Math.min(1, pos));
  if (p <= 0.25) {
    // 0 -> 100,000 (step 5,000)
    const val = (p / 0.25) * 100_000;
    return Math.round(val / 5_000) * 5_000;
  } else if (p <= 0.5) {
    // 100,000 -> 500,000 (step 20,000)
    const val = 100_000 + ((p - 0.25) / 0.25) * 400_000;
    return Math.round(val / 20_000) * 20_000;
  } else if (p <= 0.75) {
    // 500,000 -> 2,000,000 (step 100,000)
    const val = 500_000 + ((p - 0.5) / 0.25) * 1_500_000;
    return Math.round(val / 100_000) * 100_000;
  } else {
    // 2,000,000 -> 10,000,000 (step 500,000)
    const val = 2_000_000 + ((p - 0.75) / 0.25) * 8_000_000;
    return Math.round(val / 500_000) * 500_000;
  }
}

function priceToPosition(price: number): number {
  const val = Math.max(0, Math.min(MAX_LIMIT, price));
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

const QUICK_PRESETS: Array<{ label: string; min: number; max: number }> = [
  { label: 'Tất cả (0 - 10tr)', min: 0, max: 10_000_000 },
  { label: 'Ăn vặt & Sáng (0 - 50k)', min: 0, max: 50_000 },
  { label: 'Ăn trưa & Cà phê (30k - 100k)', min: 30_000, max: 100_000 },
  { label: 'Tụ tập & Lẩu nướng (100k - 300k)', min: 100_000, max: 300_000 },
  { label: 'Nhà hàng sang (300k - 1tr)', min: 300_000, max: 1_000_000 },
  { label: 'Fine Dining (1tr - 10tr)', min: 1_000_000, max: 10_000_000 },
];

export function BudgetSliderModal({
  visible,
  onClose,
  budgetRange,
  onApplyRange,
}: BudgetSliderModalProps) {
  const safeAreaInsets = useSafeAreaInsets();

  const [minVal, setMinVal] = useState(budgetRange.min);
  const [maxVal, setMaxVal] = useState(budgetRange.max);
  const trackWidthRef = useRef<number>(300);

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
    onApplyRange({ min: minVal, max: maxVal });
    onClose();
  };

  const handleReset = () => {
    setMinVal(0);
    setMaxVal(MAX_LIMIT);
    onApplyRange({ min: 0, max: MAX_LIMIT });
    onClose();
  };

  const handleTrackClick = (e: any) => {
    const clickX = e.nativeEvent.locationX;
    const clickPos = clickX / trackWidthRef.current;
    const clickedPrice = positionToPrice(clickPos);

    // If closer to min thumb, move min, else move max
    const distToMin = Math.abs(clickPos - minPos);
    const distToMax = Math.abs(clickPos - maxPos);
    if (distToMin < distToMax) {
      setMinVal(Math.min(clickedPrice, maxVal));
    } else {
      setMaxVal(Math.max(minVal, clickedPrice));
    }
  };

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
            { paddingBottom: Math.max(safeAreaInsets.bottom, 20) },
          ]}>
          {/* Drag Indicator */}
          <View style={styles.dragPillWrapper}>
            <View style={styles.dragPill} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <ThemedText style={styles.modalTitle}>Thanh Trượt Ngân Sách 🎚️</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Kéo 2 đầu thanh trượt để chọn khoảng giá từ 0 đ đến 10 triệu đ
              </ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <ThemedText style={styles.closeBtnText}>✕</ThemedText>
            </Pressable>
          </View>

          {/* Live Price Range Visual Banner */}
          <View style={styles.priceBannerCard}>
            <View style={styles.priceBox}>
              <ThemedText style={styles.priceBoxLabel}>TỪ (TỐI THIỂU)</ThemedText>
              <ThemedText style={styles.priceBoxValue}>{formatVndFull(minVal)}</ThemedText>
            </View>

            <View style={styles.priceArrowWrapper}>
              <ThemedText style={styles.priceArrowText}>➔</ThemedText>
            </View>

            <View style={styles.priceBox}>
              <ThemedText style={styles.priceBoxLabel}>ĐẾN (TỐI ĐA)</ThemedText>
              <ThemedText style={styles.priceBoxValue}>
                {maxVal >= MAX_LIMIT ? '10 triệu đ+' : formatVndFull(maxVal)}
              </ThemedText>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyScroll}>
            {/* Interactive Dual-Thumb Slider */}
            <View style={styles.sliderContainer}>
              <ThemedText style={styles.sliderInstruction}>
                🔘 Kéo điểm tròn trái (Giá thấp nhất) • Điểm tròn phải (Giá cao nhất)
              </ThemedText>

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
                      marginLeft: -16,
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
                      marginLeft: -16,
                    },
                  ]}>
                  <View style={styles.thumbInnerCircle} />
                </View>
              </View>

              {/* Slider Scale Ticks Labels */}
              <View style={styles.ticksRow}>
                <ThemedText style={styles.tickText}>0 đ</ThemedText>
                <ThemedText style={styles.tickText}>100k</ThemedText>
                <ThemedText style={styles.tickText}>500k</ThemedText>
                <ThemedText style={styles.tickText}>2tr</ThemedText>
                <ThemedText style={styles.tickText}>10tr đ</ThemedText>
              </View>
            </View>

            {/* Quick Adjust Buttons */}
            <View style={styles.stepperActionsRow}>
              <Pressable
                onPress={() => setMinVal(Math.max(0, minVal - 20_000))}
                style={styles.stepBtn}>
                <ThemedText style={styles.stepBtnText}>- Min 20k</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setMinVal(Math.min(maxVal - 10_000, minVal + 20_000))}
                style={styles.stepBtn}>
                <ThemedText style={styles.stepBtnText}>+ Min 20k</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setMaxVal(Math.max(minVal + 10_000, maxVal - 50_000))}
                style={styles.stepBtn}>
                <ThemedText style={styles.stepBtnText}>- Max 50k</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setMaxVal(Math.min(MAX_LIMIT, maxVal + 50_000))}
                style={styles.stepBtn}>
                <ThemedText style={styles.stepBtnText}>+ Max 50k</ThemedText>
              </Pressable>
            </View>

            {/* Quick Presets Grid */}
            <View style={styles.presetsSection}>
              <ThemedText style={styles.sectionHeader}>Khoảng giá chọn nhanh ⚡</ThemedText>
              <View style={styles.presetsGrid}>
                {QUICK_PRESETS.map((p, idx) => {
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
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.resetBtnText}>Mặc định (0 - 10tr)</ThemedText>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [styles.applyBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.applyBtnText}>
                Áp dụng ({formatVndCurrency(minVal)} - {formatVndCurrency(maxVal)})
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContent: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTextCol: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
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
  priceBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  priceBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  priceBoxValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
  },
  priceArrowWrapper: {
    paddingHorizontal: 8,
  },
  priceArrowText: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '700',
  },
  bodyScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  sliderContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  sliderInstruction: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  trackContainer: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  trackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  trackActive: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  thumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    cursor: Platform.OS === 'web' ? 'ew-resize' : 'auto',
  } as any,
  thumbInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tickText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  stepperActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBtnText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  presetsSection: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  presetChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  resetBtn: {
    paddingHorizontal: 14,
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
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
