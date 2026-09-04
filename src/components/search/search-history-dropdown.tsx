import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SearchHistoryItem } from '@/services/searchHistoryService';

interface SearchHistoryDropdownProps {
  visible: boolean;
  history: SearchHistoryItem[];
  onSelectQuery: (query: string) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  topOffset: number;
}

const POPULAR_SUGGESTIONS = [
  '🍜 Phở Thìn',
  '🥓 Bún Chả Hương Liên',
  '☕ Cafe Giảng',
  '🥖 Bánh Mì 25',
  '🍕 Pizza 4P\'s',
  '🍣 Sushi',
];

export function SearchHistoryDropdown({
  visible,
  history,
  onSelectQuery,
  onRemoveItem,
  onClearAll,
  onClose,
  topOffset,
}: SearchHistoryDropdownProps) {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Semi-transparent backdrop to dismiss when tapped */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessible={false}
      />

      {/* Floating Dropdown Container */}
      <View
        style={[
          styles.dropdownContainer,
          {
            top: topOffset,
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}>
        {/* Header */}
        <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerIcon}>🕒</ThemedText>
            <ThemedText type="smallBold" style={styles.headerTitle}>
              Tìm kiếm gần đây
            </ThemedText>
          </View>
          {history.length > 0 && (
            <Pressable
              onPress={onClearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearAllBtn}>
              <ThemedText type="small" themeColor="primary" style={styles.clearAllText}>
                Xóa tất cả
              </ThemedText>
            </Pressable>
          )}
        </View>

        {/* History List or Empty State */}
        {history.length > 0 ? (
          <ScrollView
            style={styles.historyList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled>
            {history.map((item) => (
              <View
                key={item.id}
                style={[styles.historyItemRow, { borderBottomColor: theme.border }]}>
                <Pressable
                  style={styles.historyItemContent}
                  onPress={() => onSelectQuery(item.query)}>
                  <ThemedText style={styles.itemIcon}>🔍</ThemedText>
                  <ThemedText
                    style={styles.itemQueryText}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.query}
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => onRemoveItem(item.id)}
                  style={styles.deleteItemBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <ThemedText style={styles.deleteItemText}>✕</ThemedText>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyHint}>
              Chưa có lịch sử tìm kiếm. Thử các món gợi ý:
            </ThemedText>
            <View style={styles.suggestionsWrapper}>
              {POPULAR_SUGGESTIONS.map((sug) => {
                const cleanQuery = sug.replace(/^[\p{Emoji}\s]+/u, '').trim();
                return (
                  <Pressable
                    key={sug}
                    onPress={() => onSelectQuery(cleanQuery)}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.border,
                      },
                    ]}>
                    <ThemedText type="small" style={styles.suggestionText}>
                      {sug}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 100,
  },
  dropdownContainer: {
    position: 'absolute',
    left: Spacing.two,
    right: Spacing.two,
    maxHeight: 320,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 101,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 13,
  },
  clearAllBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyList: {
    maxHeight: 250,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  itemIcon: {
    fontSize: 13,
    opacity: 0.6,
  },
  itemQueryText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  deleteItemBtn: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 12,
  },
  deleteItemText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Spacing.two,
    alignItems: 'flex-start',
  },
  emptyHint: {
    marginBottom: Spacing.one,
    fontSize: 12,
  },
  suggestionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
  },
});
