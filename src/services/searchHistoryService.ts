import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

const STORAGE_KEY = '@gi_cung_duoc_search_history';
const MAX_HISTORY_ITEMS = 15;

// In-memory fallback in case storage has issues or during initial boot
let inMemoryHistory: SearchHistoryItem[] = [];

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: SearchHistoryItem[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryHistory = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load search history from storage:', err);
  }
  return inMemoryHistory;
}

export async function saveSearchQuery(query: string): Promise<SearchHistoryItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return inMemoryHistory;
  }

  try {
    const current = await getSearchHistory();
    // Filter out existing matching items (case-insensitive) to move the query to the top
    const lower = trimmed.toLowerCase();
    const filtered = current.filter((item) => item.query.toLowerCase() !== lower);

    const newItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      query: trimmed,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    inMemoryHistory = updated;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save search history to storage:', err);
    // Return updated in-memory fallback
    const lower = trimmed.toLowerCase();
    const filtered = inMemoryHistory.filter((item) => item.query.toLowerCase() !== lower);
    const newItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      query: trimmed,
      timestamp: Date.now(),
    };
    inMemoryHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    return inMemoryHistory;
  }
}

export async function removeSearchHistoryItem(idOrQuery: string): Promise<SearchHistoryItem[]> {
  try {
    const current = await getSearchHistory();
    const updated = current.filter(
      (item) => item.id !== idOrQuery && item.query.toLowerCase() !== idOrQuery.toLowerCase()
    );
    inMemoryHistory = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to remove item from search history:', err);
    inMemoryHistory = inMemoryHistory.filter(
      (item) => item.id !== idOrQuery && item.query.toLowerCase() !== idOrQuery.toLowerCase()
    );
    return inMemoryHistory;
  }
}

export async function clearAllSearchHistory(): Promise<void> {
  try {
    inMemoryHistory = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear search history:', err);
    inMemoryHistory = [];
  }
}
