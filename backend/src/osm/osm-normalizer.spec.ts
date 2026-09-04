import { describe, it, expect } from 'vitest';
import {
  validateCoordinates,
  parseOpeningHours,
  extractFacilities,
  extractPriceRange,
  mapCategories,
  formatAddress,
  normalizeOSMElement,
  deduplicateRestaurants,
  HANOI_BOUNDS,
} from './osm-normalizer.js';
import { OSMElement } from './osm-types.js';

describe('OpenStreetMap Normalizer', () => {
  describe('validateCoordinates', () => {
    it('should validate coordinates within Hanoi boundaries', () => {
      // Hoan Kiem Lake center
      expect(validateCoordinates(21.0285, 105.8542)).toBe(true);
      // West Lake
      expect(validateCoordinates(21.0560, 105.8250)).toBe(true);
      // Cau Giay
      expect(validateCoordinates(21.0360, 105.7900)).toBe(true);
    });

    it('should reject coordinates outside Hanoi boundaries', () => {
      // Ho Chi Minh City
      expect(validateCoordinates(10.7769, 106.7009)).toBe(false);
      // London
      expect(validateCoordinates(51.5074, -0.1278)).toBe(false);
      // Null / Undefined / NaN
      expect(validateCoordinates(undefined, 105.85)).toBe(false);
      expect(validateCoordinates(21.02, NaN)).toBe(false);
    });
  });

  describe('parseOpeningHours', () => {
    it('should parse 24/7 opening hours', () => {
      const parsed = parseOpeningHours('24/7');
      expect(parsed).not.toBeNull();
      expect(parsed?.monday).toEqual({ open: '00:00', close: '24:00' });
      expect(parsed?.sunday).toEqual({ open: '00:00', close: '24:00' });
    });

    it('should parse simple daily time ranges', () => {
      const parsed = parseOpeningHours('08:00-22:30');
      expect(parsed).not.toBeNull();
      expect(parsed?.monday).toEqual({ open: '08:00', close: '22:30' });
      expect(parsed?.friday).toEqual({ open: '08:00', close: '22:30' });
    });

    it('should parse multi-day ranges (Mo-Fr and Sa-Su)', () => {
      const parsed = parseOpeningHours('Mo-Fr 07:00-21:00; Sa-Su 08:00-22:00');
      expect(parsed).not.toBeNull();
      expect(parsed?.monday).toEqual({ open: '07:00', close: '21:00' });
      expect(parsed?.friday).toEqual({ open: '07:00', close: '21:00' });
      expect(parsed?.saturday).toEqual({ open: '08:00', close: '22:00' });
      expect(parsed?.sunday).toEqual({ open: '08:00', close: '22:00' });
    });

    it('should return null for invalid or empty opening hours', () => {
      expect(parseOpeningHours('')).toBeNull();
      expect(parseOpeningHours('sunrise-sunset')).toBeNull();
      expect(parseOpeningHours(undefined)).toBeNull();
    });
  });

  describe('extractFacilities', () => {
    it('should extract facilities matching OSM tags only', () => {
      const tags = {
        air_conditioning: 'yes',
        internet_access: 'wlan',
        parking: 'yes',
        'payment:credit_cards': 'yes',
        wheelchair: 'yes',
        outdoor_seating: 'yes',
      };

      const facilities = extractFacilities(tags);
      expect(facilities).toContain('AC');
      expect(facilities).toContain('Wifi');
      expect(facilities).toContain('Parking');
      expect(facilities).toContain('Credit Card');
      expect(facilities).toContain('Wheelchair Accessible');
      expect(facilities).toContain('Outdoor Seating');
    });

    it('should return empty array if no facility tags are present', () => {
      expect(extractFacilities({})).toEqual([]);
      expect(extractFacilities(undefined)).toEqual([]);
    });
  });

  describe('extractPriceRange', () => {
    it('should extract price range when explicitly tagged in OSM', () => {
      expect(extractPriceRange({ price_level: '1' })).toBe('$');
      expect(extractPriceRange({ price_level: '2' })).toBe('$$');
      expect(extractPriceRange({ fee: 'expensive' })).toBe('$$$');
      expect(extractPriceRange({ charge: 'luxury' })).toBe('$$$$');
    });

    it('should return null when price tags are absent', () => {
      expect(extractPriceRange({})).toBeNull();
      expect(extractPriceRange(undefined)).toBeNull();
    });
  });

  describe('mapCategories', () => {
    it('should categorize coffee shops and cafes', () => {
      const cats1 = mapCategories({ amenity: 'cafe', name: 'Aha Cafe' });
      expect(cats1.some((c) => c.slug === 'coffee')).toBe(true);

      const cats2 = mapCategories({ cuisine: 'coffee;tea', name: 'Trà Sữa Ding Tea' });
      expect(cats2.some((c) => c.slug === 'coffee')).toBe(true);
    });

    it('should categorize Japanese food places', () => {
      const cats = mapCategories({ cuisine: 'japanese;sushi', name: 'Tokyo Sushi Bar' });
      expect(cats.some((c) => c.slug === 'japanese')).toBe(true);
    });

    it('should categorize Western food places', () => {
      const cats = mapCategories({ cuisine: 'pizza;italian', name: 'Pizza 4Ps' });
      expect(cats.some((c) => c.slug === 'western')).toBe(true);
    });

    it('should categorize Bakeries and Ice cream shops into Dessert', () => {
      const cats1 = mapCategories({ amenity: 'ice_cream', name: 'Kem Tràng Tiền' });
      expect(cats1.some((c) => c.slug === 'dessert')).toBe(true);

      const cats2 = mapCategories({ shop: 'bakery', name: 'Paris Baguette' });
      expect(cats2.some((c) => c.slug === 'dessert')).toBe(true);
    });

    it('should categorize Vietnamese dishes', () => {
      const cats = mapCategories({ cuisine: 'vietnamese', name: 'Phở Gia Truyền Bát Đàn' });
      expect(cats.some((c) => c.slug === 'vietnamese')).toBe(true);
    });
  });

  describe('formatAddress', () => {
    it('should prioritize addr:full if available', () => {
      const addr = formatAddress({ 'addr:full': '13 Lò Đúc, Hai Bà Trưng, Hà Nội' });
      expect(addr).toBe('13 Lò Đúc, Hai Bà Trưng, Hà Nội');
    });

    it('should format structured address components', () => {
      const addr = formatAddress({
        'addr:housenumber': '24',
        'addr:street': 'Lê Văn Hưu',
        'addr:district': 'Hai Bà Trưng',
        'addr:city': 'Hà Nội',
      });
      expect(addr).toBe('24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội');
    });

    it('should return null when no address tags are found', () => {
      expect(formatAddress({})).toBeNull();
      expect(formatAddress(undefined)).toBeNull();
    });
  });

  describe('normalizeOSMElement', () => {
    it('should normalize a valid OSM node into our backend restaurant model', () => {
      const element: OSMElement = {
        type: 'node',
        id: 310727632,
        lat: 21.0473212,
        lon: 105.8376261,
        tags: {
          amenity: 'restaurant',
          name: 'Bánh Tôm Hồ Tây',
          'addr:street': 'Đường Thanh Niên',
          'addr:district': 'Tây Hồ',
          'addr:city': 'Hà Nội',
          opening_hours: '08:00-22:00',
          air_conditioning: 'yes',
          internet_access: 'wlan',
        },
      };

      const normalized = normalizeOSMElement(element);
      expect(normalized).not.toBeNull();
      expect(normalized?.osm_id).toBe('osm-node-310727632');
      expect(normalized?.name).toBe('Bánh Tôm Hồ Tây');
      expect(normalized?.address).toBe('Đường Thanh Niên, Tây Hồ, Hà Nội');
      expect(normalized?.latitude).toBe(21.0473212);
      expect(normalized?.longitude).toBe(105.8376261);
      expect(normalized?.opening_hours?.monday).toEqual({ open: '08:00', close: '22:00' });
      expect(normalized?.facilities).toEqual(['AC', 'Wifi']);
      expect(normalized?.categories.some((c) => c.slug === 'vietnamese')).toBe(true);
    });

    it('should normalize a valid OSM way using center coordinates', () => {
      const element: OSMElement = {
        type: 'way',
        id: 99887766,
        center: {
          lat: 21.0285,
          lon: 105.8542,
        },
        tags: {
          amenity: 'cafe',
          name: 'Cafe Giảng',
          'addr:full': '39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội',
        },
      };

      const normalized = normalizeOSMElement(element);
      expect(normalized).not.toBeNull();
      expect(normalized?.osm_id).toBe('osm-way-99887766');
      expect(normalized?.name).toBe('Cafe Giảng');
      expect(normalized?.latitude).toBe(21.0285);
      expect(normalized?.longitude).toBe(105.8542);
      expect(normalized?.categories.some((c) => c.slug === 'coffee')).toBe(true);
    });

    it('should discard elements with missing name or invalid coordinates', () => {
      const unnamed: OSMElement = {
        type: 'node',
        id: 111,
        lat: 21.0285,
        lon: 105.8542,
        tags: { amenity: 'restaurant' },
      };
      expect(normalizeOSMElement(unnamed)).toBeNull();

      const outOfBounds: OSMElement = {
        type: 'node',
        id: 222,
        lat: 10.7769, // HCMC
        lon: 106.7009,
        tags: { name: 'Pho Saigon', amenity: 'restaurant' },
      };
      expect(normalizeOSMElement(outOfBounds)).toBeNull();
    });
  });

  describe('deduplicateRestaurants', () => {
    it('should eliminate duplicate places with identical OSM IDs or duplicate names within 30m', () => {
      const items = [
        {
          osm_id: 'osm-node-1',
          name: 'Phở Thìn',
          address: '13 Lò Đúc',
          latitude: 21.018318,
          longitude: 105.856621,
          price_range: null,
          opening_hours: null,
          facilities: [],
          categories: [{ name: 'Món Việt', slug: 'vietnamese' }],
        },
        {
          osm_id: 'osm-node-1', // Exact duplicate OSM ID
          name: 'Phở Thìn',
          address: '13 Lò Đúc',
          latitude: 21.018318,
          longitude: 105.856621,
          price_range: null,
          opening_hours: null,
          facilities: [],
          categories: [{ name: 'Món Việt', slug: 'vietnamese' }],
        },
        {
          osm_id: 'osm-way-2', // Duplicate place mapped twice on OSM within 10m
          name: 'Phở Thìn',
          address: '13 Lò Đúc',
          latitude: 21.018325,
          longitude: 105.856625,
          price_range: null,
          opening_hours: null,
          facilities: [],
          categories: [{ name: 'Món Việt', slug: 'vietnamese' }],
        },
        {
          osm_id: 'osm-node-3', // Distinct place
          name: 'Cafe Giảng',
          address: '39 Nguyễn Hữu Huân',
          latitude: 21.0331,
          longitude: 105.8539,
          price_range: null,
          opening_hours: null,
          facilities: [],
          categories: [{ name: 'Cà Phê', slug: 'coffee' }],
        },
      ];

      const deduplicated = deduplicateRestaurants(items);
      expect(deduplicated.length).toBe(2);
      expect(deduplicated[0].name).toBe('Phở Thìn');
      expect(deduplicated[1].name).toBe('Cafe Giảng');
    });
  });
});
