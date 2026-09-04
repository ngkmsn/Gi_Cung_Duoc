import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  normalizeVietnameseText,
  isRestaurantOpenNow,
  applyHardFilters,
  calculateRelevanceScore,
  calculateDistanceScore,
  calculateRatingConfidenceScore,
  calculateOpenStatusScore,
  rankRestaurants,
  filterAndRankRestaurants,
} from './restaurant-ranking.util.js';

describe('Restaurant Ranking Utilities', () => {
  describe('normalizeVietnameseText', () => {
    it('should strip diacritics and normalize Vietnamese text correctly', () => {
      expect(normalizeVietnameseText('Phở Bò Tái Lăn')).toBe('pho bo tai lan');
      expect(normalizeVietnameseText('BÁNH MÌ ĐẶC BIỆT')).toBe('banh mi dac biet');
      expect(normalizeVietnameseText('Đường Láng, Đống Đa')).toBe('duong lang, dong da');
      expect(normalizeVietnameseText('  Cà Phê Trứng  ')).toBe('ca phe trung');
      expect(normalizeVietnameseText('')).toBe('');
    });
  });

  describe('calculateDistanceKm', () => {
    it('should calculate accurate distance between two coordinates', () => {
      // Hanoi Opera House to Hoan Kiem Lake (~1 km)
      const dist = calculateDistanceKm(21.0245, 105.8568, 21.0285, 105.8542);
      expect(dist).toBeGreaterThan(0.4);
      expect(dist).toBeLessThan(1.0);
    });

    it('should return 0 when coordinates are identical', () => {
      const dist = calculateDistanceKm(21.0285, 105.8542, 21.0285, 105.8542);
      expect(dist).toBeCloseTo(0, 5);
    });
  });

  describe('isRestaurantOpenNow', () => {
    it('should respect is_open_now boolean if present', () => {
      expect(isRestaurantOpenNow({ is_open_now: true })).toBe(true);
      expect(isRestaurantOpenNow({ is_open_now: false })).toBe(false);
    });

    it('should evaluate weekly schedule correctly for current time', () => {
      const restaurant = {
        opening_hours: {
          monday: { open: '08:00', close: '22:00' },
        },
      };

      // Monday at 12:00 (inside open window)
      const openDate = new Date('2026-09-07T12:00:00'); // 2026-09-07 is Monday
      expect(isRestaurantOpenNow(restaurant, openDate)).toBe(true);

      // Monday at 23:30 (outside open window)
      const closedDate = new Date('2026-09-07T23:30:00');
      expect(isRestaurantOpenNow(restaurant, closedDate)).toBe(false);
    });

    it('should handle overnight opening hours across midnight', () => {
      const lateNightBar = {
        opening_hours: {
          friday: { open: '18:00', close: '03:00' },
        },
      };
      // Friday 23:00
      const fridayNight = new Date('2026-09-04T23:00:00'); // Friday
      expect(isRestaurantOpenNow(lateNightBar, fridayNight)).toBe(true);
    });
  });

  describe('Relevance Scoring & Vietnamese Diacritic-Insensitive Search', () => {
    const rExact = {
      name: 'Phở Thìn',
      address: '13 Lò Đúc',
      categories: [{ name: 'Món Việt', slug: 'vietnamese' }],
    };
    const rPrefix = {
      name: 'Phở Thìn Lò Đúc Đặc Biệt',
      address: '13 Lò Đúc',
      categories: [{ name: 'Món Việt', slug: 'vietnamese' }],
    };
    const rCategory = {
      name: 'Quán Ăn Ngon',
      address: '18 Phan Bội Châu',
      categories: [{ name: 'Phở & Món Việt', slug: 'pho' }],
    };
    const rDish = {
      name: 'Bếp Cơm Quê',
      address: 'Cầu Giấy',
      specialty_dish: 'Phở gà lá chanh',
    };
    const rAddress = {
      name: 'Tiệm Trà Sen',
      address: '10 Phố Đông',
    };

    it('should match query with or without diacritics', () => {
      const scoreWithDiacritic = calculateRelevanceScore(rExact, 'Phở Thìn');
      const scoreWithoutDiacritic = calculateRelevanceScore(rExact, 'pho thin');
      expect(scoreWithDiacritic).toBe(scoreWithoutDiacritic);
      expect(scoreWithoutDiacritic).toBeGreaterThan(50);
    });

    it('should rank exact name match higher than prefix match, category, and address match', () => {
      const scoreExact = calculateRelevanceScore(rExact, 'pho thin');
      const scorePrefix = calculateRelevanceScore(rPrefix, 'pho thin');
      const scoreCategory = calculateRelevanceScore(rCategory, 'pho');
      const scoreDish = calculateRelevanceScore(rDish, 'pho');
      const scoreAddress = calculateRelevanceScore(rAddress, 'pho');

      expect(scoreExact).toBeGreaterThan(scorePrefix);
      expect(scorePrefix).toBeGreaterThan(scoreCategory);
      expect(scoreCategory).toBeGreaterThan(scoreAddress);
      expect(scoreDish).toBeGreaterThan(scoreAddress);
    });
  });

  describe('Distance Proximity Scoring', () => {
    const userLat = 21.0285;
    const userLng = 105.8542;

    const nearPlace = { latitude: 21.029, longitude: 105.8545 }; // ~0.06 km
    const midPlace = { latitude: 21.045, longitude: 105.86 }; // ~2 km
    const farPlace = { latitude: 21.12, longitude: 105.95 }; // ~14 km

    it('should give higher score to closer restaurants', () => {
      const scoreNear = calculateDistanceScore(nearPlace, userLat, userLng).distanceScore;
      const scoreMid = calculateDistanceScore(midPlace, userLat, userLng).distanceScore;
      const scoreFar = calculateDistanceScore(farPlace, userLat, userLng).distanceScore;

      expect(scoreNear).toBeGreaterThan(scoreMid);
      expect(scoreMid).toBeGreaterThan(scoreFar);
      expect(scoreNear).toBeGreaterThan(25);
    });

    it('should return neutral score when user location is omitted', () => {
      const score = calculateDistanceScore(nearPlace, undefined, undefined).distanceScore;
      expect(score).toBe(15);
    });
  });

  describe('Hard-Filter Exclusion', () => {
    const list = [
      {
        id: 'r1',
        name: 'Quán 1',
        latitude: 21.0285,
        longitude: 105.8542,
        min_price: 30000,
        max_price: 60000,
        price_range: '$',
        categories: [{ name: 'Món Việt', slug: 'vietnamese' }],
        is_open_now: true,
      },
      {
        id: 'r2',
        name: 'Quán 2',
        latitude: 21.09,
        longitude: 105.92, // ~9 km away
        min_price: 150000,
        max_price: 300000,
        price_range: '$$$',
        categories: [{ name: 'Đồ Nhật', slug: 'japanese' }],
        is_open_now: false,
      },
    ];

    it('should exclude restaurants outside selected radius', () => {
      const filtered = applyHardFilters(list, {
        latitude: 21.0285,
        longitude: 105.8542,
        radius: 3, // 3 km radius
      });
      expect(filtered.map((r) => r.id)).toEqual(['r1']);
    });

    it('should exclude restaurants outside selected budget range', () => {
      const filteredLowBudget = applyHardFilters(list, {
        min_budget: 20000,
        max_budget: 80000,
      });
      expect(filteredLowBudget.map((r) => r.id)).toEqual(['r1']);

      const filteredHighBudget = applyHardFilters(list, {
        min_budget: 100000,
        max_budget: 500000,
      });
      expect(filteredHighBudget.map((r) => r.id)).toEqual(['r2']);
    });

    it('should exclude restaurants not matching selected category', () => {
      const filteredVietnamese = applyHardFilters(list, { category: 'vietnamese' });
      expect(filteredVietnamese.map((r) => r.id)).toEqual(['r1']);

      const filteredJapanese = applyHardFilters(list, { category: 'japanese' });
      expect(filteredJapanese.map((r) => r.id)).toEqual(['r2']);
    });

    it('should exclude closed restaurants when open_now is true', () => {
      const filteredOpen = applyHardFilters(list, { open_now: true });
      expect(filteredOpen.map((r) => r.id)).toEqual(['r1']);
    });
  });

  describe('No-Query Ranking', () => {
    it('should rank restaurants by distance, rating confidence, and opening status when query is empty', () => {
      const userLat = 21.0285;
      const userLng = 105.8542;

      const candidates = [
        {
          id: 'closed-low-far',
          name: 'Closed & Low Rating Far',
          latitude: 21.08,
          longitude: 105.9,
          rating: 3.5,
          review_count: 20,
          is_open_now: false,
        },
        {
          id: 'open-high-near',
          name: 'Open & High Rating Near',
          latitude: 21.029,
          longitude: 105.8545,
          rating: 4.9,
          review_count: 2500,
          is_open_now: true,
        },
        {
          id: 'open-mid-near',
          name: 'Open & Mid Rating Near',
          latitude: 21.03,
          longitude: 105.855,
          rating: 4.2,
          review_count: 100,
          is_open_now: true,
        },
      ];

      const ranked = filterAndRankRestaurants(candidates, '', {
        latitude: userLat,
        longitude: userLng,
      });

      expect(ranked[0].id).toBe('open-high-near');
      expect(ranked[1].id).toBe('open-mid-near');
      expect(ranked[2].id).toBe('closed-low-far');
    });
  });

  describe('Ranking Trade-Offs', () => {
    it('should prioritize exact query match over an otherwise closer unrelated restaurant', () => {
      const userLat = 21.0285;
      const userLng = 105.8542;

      const pizzaPlaceFar = {
        id: 'pizza-far',
        name: 'Pizza 4Ps',
        latitude: 21.038,
        longitude: 105.86, // ~1.3 km away
        rating: 4.8,
        review_count: 1000,
        is_open_now: true,
      };

      const coffeePlaceNear = {
        id: 'coffee-near',
        name: 'Cafe Giang',
        latitude: 21.0286,
        longitude: 105.8543, // 0.02 km away
        rating: 4.8,
        review_count: 1000,
        is_open_now: true,
      };

      // When searching specifically for "pizza"
      const ranked = filterAndRankRestaurants([coffeePlaceNear, pizzaPlaceFar], 'pizza', {
        latitude: userLat,
        longitude: userLng,
      });

      expect(ranked[0].id).toBe('pizza-far');
    });

    it('should give boost to open restaurant over closed restaurant with identical attributes', () => {
      const openPlace = {
        id: 'open-bun-cha',
        name: 'Bún Chả Hương Liên',
        rating: 4.7,
        review_count: 1500,
        is_open_now: true,
      };

      const closedPlace = {
        id: 'closed-bun-cha',
        name: 'Bún Chả Hương Liên Cũ',
        rating: 4.7,
        review_count: 1500,
        is_open_now: false,
      };

      const ranked = filterAndRankRestaurants([closedPlace, openPlace], 'bun cha');
      expect(ranked[0].id).toBe('open-bun-cha');
      expect(ranked[1].id).toBe('closed-bun-cha');
    });

    it('should balance high rating & high review confidence against slight distance difference', () => {
      const userLat = 21.0285;
      const userLng = 105.8542;

      const highRatedSlightlyFar = {
        id: 'high-rated',
        name: 'Phở Michelin Tuyệt Đỉnh',
        latitude: 21.035,
        longitude: 105.858, // ~0.8 km
        rating: 4.9,
        review_count: 3500,
        is_open_now: true,
      };

      const lowRatedCloser = {
        id: 'low-rated',
        name: 'Phở Bình Dân',
        latitude: 21.029,
        longitude: 105.8545, // ~0.06 km
        rating: 2.8,
        review_count: 5,
        is_open_now: true,
      };

      const ranked = filterAndRankRestaurants([lowRatedCloser, highRatedSlightlyFar], 'pho', {
        latitude: userLat,
        longitude: userLng,
      });

      expect(ranked[0].id).toBe('high-rated');
    });
  });
});
