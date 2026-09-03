import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatVndFull } from '@/utils/price';

interface BudgetSliderModalProps {
  visible: boolean;
  onClose: () => void;
  maxBudgetVnd: number | null;
  onApplyBudget: (budget: number | null) => void;
}

const BUDGET_PRESETS = [
  { label: 'Không giới hạn', value: null, desc: 'Tất cả mức giá' },
  { label: '50.000 đ', value: 50000, desc: 'Ăn sáng, bánh mì, đồ uống' },
  { label: '100.000 đ', value: 100000, desc: 'Phở, bún chả, cơm văn phòng' },
  { label: '150.000 đ', value: 150000, desc: 'Cà phê view đẹp, ăn trưa combo' },
  { label: '250.000 đ', value: 250000, desc: 'Pizza, đồ Nhật, món Tây vừa' },
  { label: '400.000 đ', value: 400000, desc: 'Buffet lẩu nướng, tụ tập bạn bè' },
  { label: '800.000 đ', value: 800000, desc: 'Steak hảo hạng, hải sản tươi' },
  { label: '1.500.000 đ', value: 1500000, desc: 'Fine dining, tiệc cao cấp' },
];

export function BudgetSliderModal({
  visible,
  onClose,
  maxBudgetVnd,
  onApplyBudget,
}: BudgetSliderModalProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [selectedBudget, setSelectedBudget] = useState<number | null>(maxBudgetVnd);

  const handleApply = () => {
    onApplyBudget(selectedBudget);
    onClose();
  };

  const handleClear = () => {
    setSelectedBudget(null);
    onApplyBudget(null);
    onClose();
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
              <ThemedText style={styles.modalTitle}>Chọn Ngân Sách Của Bạn 💰</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Chỉ hiển thị các quán ăn có mức giá phù hợp với túi tiền
              </ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <ThemedText style={styles.closeBtnText}>✕</ThemedText>
            </Pressable>
          </View>

          {/* Current Selection Highlight Card */}
          <View style={styles.highlightCard}>
            <ThemedText style={styles.highlightLabel}>Ngân sách tối đa mỗi người:</ThemedText>
            <ThemedText style={styles.highlightValue}>
              {selectedBudget ? formatVndFull(selectedBudget) : 'Không giới hạn'}
            </ThemedText>
          </View>

          {/* Presets List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.presetsList}>
            {BUDGET_PRESETS.map((item, index) => {
              const isSelected = selectedBudget === item.value;
              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedBudget(item.value)}
                  style={({ pressed }) => [
                    styles.presetRowItem,
                    isSelected && styles.presetRowItemSelected,
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>

                  <View style={styles.presetTextCol}>
                    <ThemedText
                      style={[
                        styles.presetLabelText,
                        isSelected && styles.presetLabelTextSelected,
                      ]}>
                      {item.label}
                    </ThemedText>
                    <ThemedText style={styles.presetDescText}>{item.desc}</ThemedText>
                  </View>

                  {item.value && (
                    <View style={styles.budgetTag}>
                      <ThemedText style={styles.budgetTagText}>
                        &le; {Math.round(item.value / 1000)}k
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            {selectedBudget !== null && (
              <Pressable
                onPress={handleClear}
                style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
                <ThemedText style={styles.clearBtnText}>Bỏ lọc</ThemedText>
              </Pressable>
            )}

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [styles.applyBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.applyBtnText}>Áp dụng ngân sách</ThemedText>
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
    maxHeight: '85%',
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
  highlightCard: {
    marginHorizontal: 20,
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
  highlightValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#065F46',
  },
  presetsList: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  presetRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  presetRowItemSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  presetTextCol: {
    flex: 1,
    gap: 2,
  },
  presetLabelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  presetLabelTextSelected: {
    color: '#065F46',
  },
  presetDescText: {
    fontSize: 11,
    color: '#64748B',
  },
  budgetTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  budgetTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
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
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#64748B',
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
