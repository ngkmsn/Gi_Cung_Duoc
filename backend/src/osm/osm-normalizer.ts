import { OSMElement, NormalizedOSMRestaurant, WeekOpeningHours } from './osm-types.js';
import { calculateDistanceKm, normalizeVietnameseText } from '../restaurant/restaurant-ranking.util.js';

// Hanoi bounding box validation limits
export const HANOI_BOUNDS = {
  minLat: 20.5,
  maxLat: 21.6,
  minLon: 105.3,
  maxLon: 106.3,
};

/**
 * Validates that latitude and longitude are valid numbers and inside the Hanoi geographic area.
 */
export function validateCoordinates(lat?: number, lon?: number): boolean {
  if (lat === undefined || lon === undefined || lat === null || lon === null) return false;
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (isNaN(lat) || isNaN(lon)) return false;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false;

  return (
    lat >= HANOI_BOUNDS.minLat &&
    lat <= HANOI_BOUNDS.maxLat &&
    lon >= HANOI_BOUNDS.minLon &&
    lon <= HANOI_BOUNDS.maxLon
  );
}

/**
 * Parses simple OSM opening_hours strings (e.g. "08:00-22:00", "Mo-Su 07:00-23:00", "Mo-Fr 08:00-22:00; Sa-Su 09:00-23:00")
 * into a structured 7-day schedule. Returns null if invalid or unparseable.
 */
export function parseOpeningHours(raw?: string): WeekOpeningHours | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  // Pattern: "24/7"
  if (trimmed.toLowerCase() === '24/7') {
    const result: WeekOpeningHours = {};
    for (const d of days) {
      result[d] = { open: '00:00', close: '24:00' };
    }
    return result;
  }

  // Simple pattern: "HH:MM-HH:MM" or "HH:MM - HH:MM" (applied to all 7 days)
  const simpleTimeMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/);
  if (simpleTimeMatch) {
    const open = simpleTimeMatch[1].padStart(5, '0');
    const close = simpleTimeMatch[2].padStart(5, '0');
    const result: WeekOpeningHours = {};
    for (const d of days) {
      result[d] = { open, close };
    }
    return result;
  }

  // Multi-day pattern: "Mo-Su 08:00-22:00" or "Mo-Fr 08:00-22:00; Sa-Su 09:00-23:00"
  const dayMap: Record<string, string> = {
    mo: 'monday',
    tu: 'tuesday',
    we: 'wednesday',
    th: 'thursday',
    fr: 'friday',
    sa: 'saturday',
    su: 'sunday',
  };

  const sections = trimmed.split(';').map((s) => s.trim());
  const result: WeekOpeningHours = {};
  let matchedAny = false;

  for (const section of sections) {
    // e.g. "Mo-Fr 08:00-22:00" or "Sa,Su 09:00-23:00" or "Mo-Su 07:00-23:00"
    const sectionMatch = section.match(/^([A-Za-z,\s-]+)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/);
    if (sectionMatch) {
      const daySpec = sectionMatch[1].toLowerCase().replace(/\s+/g, '');
      const open = sectionMatch[2].padStart(5, '0');
      const close = sectionMatch[3].padStart(5, '0');

      if (daySpec.includes('-')) {
        const [startDay, endDay] = daySpec.split('-');
        const dayKeys = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
        const startIdx = dayKeys.indexOf(startDay);
        const endIdx = dayKeys.indexOf(endDay);

        if (startIdx !== -1 && endIdx !== -1) {
          const range =
            startIdx <= endIdx
              ? dayKeys.slice(startIdx, endIdx + 1)
              : [...dayKeys.slice(startIdx), ...dayKeys.slice(0, endIdx + 1)];

          for (const k of range) {
            const fullDay = dayMap[k];
            if (fullDay) {
              result[fullDay] = { open, close };
              matchedAny = true;
            }
          }
        }
      } else {
        const dayTokens = daySpec.split(',');
        for (const token of dayTokens) {
          const fullDay = dayMap[token];
          if (fullDay) {
            result[fullDay] = { open, close };
            matchedAny = true;
          }
        }
      }
    }
  }

  return matchedAny ? result : null;
}

/**
 * Extracts facilities that are explicitly tagged in OSM.
 */
export function extractFacilities(tags?: Record<string, string>): string[] {
  if (!tags) return [];
  const facilities: string[] = [];

  // Air conditioning
  if (tags['air_conditioning'] === 'yes' || tags['air_conditioned'] === 'yes') {
    facilities.push('AC');
  }

  // Wifi / Internet
  if (
    tags['internet_access'] === 'wlan' ||
    tags['internet_access'] === 'yes' ||
    tags['internet_access:fee'] === 'no' ||
    tags['wifi'] === 'yes'
  ) {
    facilities.push('Wifi');
  }

  // Parking
  if (tags['parking'] === 'yes' || tags['parking:fee'] === 'no' || tags['amenity'] === 'parking') {
    facilities.push('Parking');
  }

  // Payment credit cards
  if (
    tags['payment:credit_cards'] === 'yes' ||
    tags['payment:cards'] === 'yes' ||
    tags['payment:visa'] === 'yes' ||
    tags['payment:mastercard'] === 'yes'
  ) {
    facilities.push('Credit Card');
  }

  // Wheelchair accessible
  if (tags['wheelchair'] === 'yes') {
    facilities.push('Wheelchair Accessible');
  }

  // Outdoor seating
  if (tags['outdoor_seating'] === 'yes') {
    facilities.push('Outdoor Seating');
  }

  // Private room
  if (tags['rooms'] === 'yes' || tags['private_room'] === 'yes') {
    facilities.push('Private Room');
  }

  return facilities;
}

/**
 * Maps price range if available in OSM tags.
 */
export function extractPriceRange(tags?: Record<string, string>): string | null {
  if (!tags) return null;

  const priceLevel = tags['price_level'] || tags['charge'] || tags['fee'] || tags['price_range'];
  if (!priceLevel) return null;

  const str = priceLevel.toLowerCase().trim();
  if (str === '1' || str === '$' || str === 'low' || str === 'cheap' || str === 'inexpensive') return '$';
  if (str === '2' || str === '$$' || str === 'moderate' || str === 'medium') return '$$';
  if (str === '3' || str === '$$$' || str === 'expensive') return '$$$';
  if (str === '4' || str === '$$$$' || str === 'very_expensive' || str === 'luxury') return '$$$$';

  return null;
}

/**
 * Maps food places to standard category classifications based on OSM amenity, cuisine, and name tags.
 */
export function mapCategories(tags?: Record<string, string>): Array<{ name: string; slug: string }> {
  if (!tags) return [{ name: 'Món Việt', slug: 'vietnamese' }];

  const categories: Array<{ name: string; slug: string }> = [];
  const amenity = (tags['amenity'] || '').toLowerCase();
  const shop = (tags['shop'] || '').toLowerCase();
  const cuisine = (tags['cuisine'] || '').toLowerCase();
  const nameNorm = normalizeVietnameseText(tags['name'] || tags['name:vi'] || tags['name:en'] || '');

  const addCat = (name: string, slug: string) => {
    if (!categories.some((c) => c.slug === slug)) {
      categories.push({ name, slug });
    }
  };

  // 1. Coffee
  if (
    amenity === 'cafe' ||
    amenity === 'coffee_shop' ||
    cuisine.includes('coffee') ||
    cuisine.includes('tea') ||
    nameNorm.includes('cafe') ||
    nameNorm.includes('coffee') ||
    nameNorm.includes('ca phe') ||
    nameNorm.includes('tra sua') ||
    nameNorm.includes('tra chanh')
  ) {
    addCat('Cà Phê', 'coffee');
  }

  // 2. Japanese
  if (
    cuisine.includes('japanese') ||
    cuisine.includes('sushi') ||
    cuisine.includes('ramen') ||
    cuisine.includes('asian') ||
    nameNorm.includes('sushi') ||
    nameNorm.includes('ramen') ||
    nameNorm.includes('nhat ban') ||
    nameNorm.includes('tokyo') ||
    nameNorm.includes('udon') ||
    nameNorm.includes('sashimi')
  ) {
    addCat('Đồ Nhật', 'japanese');
  }

  // 3. Western
  if (
    cuisine.includes('western') ||
    cuisine.includes('pizza') ||
    cuisine.includes('italian') ||
    cuisine.includes('burger') ||
    cuisine.includes('french') ||
    cuisine.includes('american') ||
    cuisine.includes('steak') ||
    cuisine.includes('pasta') ||
    nameNorm.includes('pizza') ||
    nameNorm.includes('burger') ||
    nameNorm.includes('steak') ||
    nameNorm.includes('pasta') ||
    nameNorm.includes('spaghetti') ||
    nameNorm.includes('bbq') ||
    amenity === 'fast_food' && (nameNorm.includes('kfc') || nameNorm.includes('lotteria') || nameNorm.includes('mcdonald'))
  ) {
    addCat('Đồ Tây', 'western');
  }

  // 4. Dessert / Bakery
  if (
    amenity === 'ice_cream' ||
    shop === 'bakery' ||
    shop === 'pastry' ||
    cuisine.includes('ice_cream') ||
    cuisine.includes('dessert') ||
    cuisine.includes('bakery') ||
    cuisine.includes('cake') ||
    nameNorm.includes('che') ||
    nameNorm.includes('kem') ||
    nameNorm.includes('banh ngot') ||
    nameNorm.includes('tiem banh') ||
    nameNorm.includes('bakery')
  ) {
    addCat('Tráng Miệng', 'dessert');
  }

  // 5. Vietnamese (Default / explicit)
  if (
    cuisine.includes('vietnamese') ||
    cuisine.includes('noodle') ||
    cuisine.includes('pho') ||
    cuisine.includes('bun') ||
    nameNorm.includes('pho') ||
    nameNorm.includes('bun') ||
    nameNorm.includes('com') ||
    nameNorm.includes('banh mi') ||
    nameNorm.includes('cha ca') ||
    nameNorm.includes('nem') ||
    nameNorm.includes('lau') ||
    nameNorm.includes('quan an') ||
    nameNorm.includes('nha hang') ||
    categories.length === 0
  ) {
    addCat('Món Việt', 'vietnamese');
  }

  return categories;
}

/**
 * Formats a clean street address from OSM address tags. Returns null if no address components exist.
 */
export function formatAddress(tags?: Record<string, string>): string | null {
  if (!tags) return null;

  if (tags['addr:full']) {
    return tags['addr:full'].trim();
  }

  const parts: string[] = [];
  const houseNumber = tags['addr:housenumber'];
  const street = tags['addr:street'];
  const ward = tags['addr:subdistrict'] || tags['addr:ward'];
  const district = tags['addr:district'];
  const city = tags['addr:city'];

  if (houseNumber && street) {
    parts.push(`${houseNumber} ${street}`);
  } else if (street) {
    parts.push(street);
  }

  if (ward) parts.push(ward);
  if (district) parts.push(district);
  if (city) parts.push(city);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(', ');
}

/**
 * Normalizes a raw OSM node or way into our backend restaurant model.
 * Returns null if the element has invalid coordinates or lacks a name.
 */
export function normalizeOSMElement(element: OSMElement): NormalizedOSMRestaurant | null {
  if (!element.tags) return null;

  const rawName = element.tags['name'] || element.tags['name:vi'] || element.tags['name:en'];
  if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
    return null;
  }

  const lat = element.lat !== undefined ? element.lat : element.center?.lat;
  const lon = element.lon !== undefined ? element.lon : element.center?.lon;

  if (!validateCoordinates(lat, lon)) {
    return null;
  }

  const name = rawName.trim();
  const address = formatAddress(element.tags);
  const opening_hours = parseOpeningHours(element.tags['opening_hours']);
  const facilities = extractFacilities(element.tags);
  const price_range = extractPriceRange(element.tags);
  const categories = mapCategories(element.tags);

  return {
    osm_id: `osm-${element.type}-${element.id}`,
    name,
    address,
    latitude: lat!,
    longitude: lon!,
    price_range,
    opening_hours,
    facilities,
    categories,
  };
}

/**
 * Deduplicates restaurants by OSM ID and by identical normalized name within 30 meters distance.
 */
export function deduplicateRestaurants(items: NormalizedOSMRestaurant[]): NormalizedOSMRestaurant[] {
  const seenIds = new Set<string>();
  const uniqueList: NormalizedOSMRestaurant[] = [];

  for (const item of items) {
    if (seenIds.has(item.osm_id)) {
      continue;
    }
    seenIds.add(item.osm_id);

    // Check if another restaurant with the exact same name exists within 30 meters
    const normName = normalizeVietnameseText(item.name);
    const isNearbyDuplicate = uniqueList.some((existing) => {
      if (normalizeVietnameseText(existing.name) === normName) {
        const distKm = calculateDistanceKm(
          item.latitude,
          item.longitude,
          existing.latitude,
          existing.longitude,
        );
        return distKm < 0.03; // Less than 30 meters
      }
      return false;
    });

    if (!isNearbyDuplicate) {
      uniqueList.push(item);
    }
  }

  return uniqueList;
}
