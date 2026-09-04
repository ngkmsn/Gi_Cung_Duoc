export interface RankingLocationOptions {
  latitude?: number;
  longitude?: number;
  radius?: number; // In km or meters
  min_budget?: number;
  max_budget?: number;
  price_range?: string;
  category?: string;
  open_now?: boolean;
  limit?: number;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/**
 * Calculates Great-Circle distance in kilometers between two lat/lng pairs via Haversine formula.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Normalizes Vietnamese text by stripping diacritics and converting to lowercase.
 */
export function normalizeVietnameseText(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Checks whether a restaurant is currently open given its opening_hours and optional date.
 */
export function isRestaurantOpenNow(restaurant: any, date: Date = new Date()): boolean {
  if (restaurant.is_open_now !== undefined && restaurant.is_open_now !== null) {
    return Boolean(restaurant.is_open_now);
  }
  if (!restaurant.opening_hours) {
    return true; // Default to open if schedule is unlisted
  }
  const dayKey = DAY_KEYS[date.getDay()];
  const todayHours = restaurant.opening_hours[dayKey];
  if (!todayHours || !todayHours.open || !todayHours.close) {
    return true;
  }
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const openMinutes = (openH || 0) * 60 + (openM || 0);
  let closeMinutes = (closeH || 0) * 60 + (closeM || 0);
  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60;
    if (currentMinutes < openMinutes) {
      return currentMinutes + 24 * 60 <= closeMinutes;
    }
  }
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

/**
 * STEP 1: Apply strict hard filters (Radius, Price/Budget, Category, Opening Status).
 * Non-matching restaurants are strictly excluded before ranking.
 */
export function applyHardFilters(
  restaurants: any[],
  options?: RankingLocationOptions,
  currentDate: Date = new Date(),
): any[] {
  if (!restaurants || restaurants.length === 0) return [];
  if (!options) return restaurants;

  let filtered = restaurants;

  // 1. Hard Filter: Radius
  const userLat = options.latitude;
  const userLng = options.longitude;
  const rawRadius = options.radius;
  if (userLat !== undefined && userLng !== undefined && rawRadius !== undefined && rawRadius > 0) {
    const radiusKm = rawRadius > 50 ? rawRadius / 1000 : rawRadius;
    filtered = filtered.filter((r) => {
      const lat = typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude;
      const lng = typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude;
      if (lat === undefined || isNaN(lat) || lng === undefined || isNaN(lng)) {
        return false;
      }
      const dist = calculateDistanceKm(userLat, userLng, lat, lng);
      return dist <= radiusKm;
    });
  }

  // 2. Hard Filter: Budget Range or Price Range
  if (options.min_budget !== undefined || options.max_budget !== undefined) {
    const budgetMin = options.min_budget ?? 0;
    const budgetMax = options.max_budget ?? 10_000_000;
    filtered = filtered.filter((r) => {
      const minPrice = r.min_price !== undefined ? Number(r.min_price) : 30000;
      const maxPrice = r.max_price !== undefined ? Number(r.max_price) : minPrice;
      return maxPrice >= budgetMin && minPrice <= budgetMax;
    });
  } else if (options.price_range) {
    const targetPrice = options.price_range.trim();
    filtered = filtered.filter((r) => r.price_range === targetPrice);
  }

  // 3. Hard Filter: Category
  if (options.category && options.category.trim().length > 0) {
    const targetCat = normalizeVietnameseText(options.category);
    filtered = filtered.filter((r) => {
      if (!r.categories || !Array.isArray(r.categories)) return false;
      return r.categories.some((cat: any) => {
        const catNameNorm = normalizeVietnameseText(cat.name || '');
        const catSlugNorm = normalizeVietnameseText(cat.slug || '');
        return (
          catNameNorm === targetCat ||
          catSlugNorm === targetCat ||
          catNameNorm.includes(targetCat) ||
          catSlugNorm.includes(targetCat)
        );
      });
    });
  }

  // 4. Hard Filter: Opening Status
  if (options.open_now === true) {
    filtered = filtered.filter((r) => isRestaurantOpenNow(r, currentDate));
  }

  return filtered;
}

/**
 * Calculates text relevance score based on normalized Vietnamese matching.
 * Priority: Exact name match > Prefix name match > Word match > Substring in name > Category > Specialty dish > Address > Badge.
 */
export function calculateRelevanceScore(restaurant: any, query: string): number {
  const trimmed = query.trim();
  if (!trimmed) return 0;

  const normQuery = normalizeVietnameseText(trimmed);
  const normName = normalizeVietnameseText(restaurant.name || '');
  const normAddress = normalizeVietnameseText(restaurant.address || '');
  const normSpecialty = normalizeVietnameseText(restaurant.specialty_dish || '');
  const normBadge = normalizeVietnameseText(restaurant.badge || '');

  let score = 0;

  // Name scoring
  if (normName === normQuery) {
    score += 60; // Exact match
  } else if (normName.startsWith(normQuery)) {
    score += 45; // Prefix match
  } else if (normName.split(/\s+/).some((word) => word.startsWith(normQuery))) {
    score += 35; // Word prefix match
  } else if (normName.includes(normQuery)) {
    score += 25; // Substring match
  }

  // Category scoring
  if (restaurant.categories && Array.isArray(restaurant.categories)) {
    let bestCatScore = 0;
    for (const cat of restaurant.categories) {
      const catName = normalizeVietnameseText(cat.name || '');
      const catSlug = normalizeVietnameseText(cat.slug || '');
      if (catName === normQuery || catSlug === normQuery) {
        bestCatScore = Math.max(bestCatScore, 30);
      } else if (catName.includes(normQuery) || catSlug.includes(normQuery)) {
        bestCatScore = Math.max(bestCatScore, 20);
      }
    }
    score += bestCatScore;
  }

  // Specialty dish scoring
  if (normSpecialty.includes(normQuery)) {
    score += 20;
  }

  // Address scoring
  if (normAddress.includes(normQuery)) {
    score += 10;
  }

  // Badge scoring
  if (normBadge.includes(normQuery)) {
    score += 5;
  }

  return score;
}

/**
 * Calculates distance proximity score (0 to 30) using smooth inverse decay.
 */
export function calculateDistanceScore(
  restaurant: any,
  userLat?: number,
  userLng?: number,
): { distanceScore: number; distanceKm?: number } {
  if (userLat === undefined || userLng === undefined) {
    return { distanceScore: 15 }; // Neutral score when user location is absent
  }

  const lat = typeof restaurant.latitude === 'string' ? parseFloat(restaurant.latitude) : restaurant.latitude;
  const lng = typeof restaurant.longitude === 'string' ? parseFloat(restaurant.longitude) : restaurant.longitude;

  if (lat === undefined || isNaN(lat) || lng === undefined || isNaN(lng)) {
    return { distanceScore: 0 };
  }

  const distanceKm = calculateDistanceKm(userLat, userLng, lat, lng);
  // Decay curve: 0 km -> 30 pts, 1 km -> ~21.4 pts, 3 km -> ~13.6 pts, 5 km -> ~10 pts, 10 km -> ~6 pts
  const distanceScore = Math.max(0, 30 / (1 + distanceKm * 0.4));
  return { distanceScore, distanceKm };
}

/**
 * Calculates rating confidence score (0 to 25) combining star rating and review volume.
 */
export function calculateRatingConfidenceScore(restaurant: any): number {
  const rating =
    restaurant.rating !== undefined && restaurant.rating !== null && !isNaN(Number(restaurant.rating))
      ? Number(restaurant.rating)
      : 4.0;
  const reviewCount =
    restaurant.review_count !== undefined &&
    restaurant.review_count !== null &&
    !isNaN(Number(restaurant.review_count))
      ? Number(restaurant.review_count)
      : 50;

  // Star rating contribution (0 - 18 pts)
  const starScore = (Math.min(5, Math.max(0, rating)) / 5) * 18;

  // Review count logarithmic confidence (0 - 7 pts)
  const reviewConfidence = Math.min(7, Math.log10(Math.max(1, reviewCount)) * 2);

  return starScore + reviewConfidence;
}

/**
 * Calculates opening status boost (0 or 15 pts).
 */
export function calculateOpenStatusScore(restaurant: any, date: Date = new Date()): number {
  return isRestaurantOpenNow(restaurant, date) ? 15 : 0;
}

/**
 * STEP 2: Rank restaurants using normalized text relevance, distance, rating confidence, and opening status.
 */
export function rankRestaurants(
  restaurants: any[],
  query: string = '',
  options?: RankingLocationOptions,
  date: Date = new Date(),
): any[] {
  if (!restaurants || restaurants.length === 0) return [];

  const userLat = options?.latitude;
  const userLng = options?.longitude;

  const scoredList = restaurants.map((restaurant) => {
    const relevanceScore = calculateRelevanceScore(restaurant, query);
    const { distanceScore, distanceKm } = calculateDistanceScore(restaurant, userLat, userLng);
    const ratingConfidenceScore = calculateRatingConfidenceScore(restaurant);
    const openStatusScore = calculateOpenStatusScore(restaurant, date);

    const totalScore = relevanceScore + distanceScore + ratingConfidenceScore + openStatusScore;

    return {
      restaurant,
      totalScore,
      relevanceScore,
      distanceScore,
      distanceKm,
      ratingScore: ratingConfidenceScore,
      openStatusScore,
    };
  });

  // Sort descending by total composite score
  scoredList.sort((a, b) => {
    if (Math.abs(b.totalScore - a.totalScore) > 0.0001) {
      return b.totalScore - a.totalScore;
    }

    // Tie breaker 1: Distance (closer first if available)
    if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
      if (Math.abs(a.distanceKm - b.distanceKm) > 0.001) {
        return a.distanceKm - b.distanceKm;
      }
    }

    // Tie breaker 2: Rating (higher first)
    const ratingA = Number(a.restaurant.rating || 0);
    const ratingB = Number(b.restaurant.rating || 0);
    return ratingB - ratingA;
  });

  const ranked = scoredList.map((item) => item.restaurant);
  if (options?.limit && options.limit > 0) {
    return ranked.slice(0, options.limit);
  }
  return ranked;
}

/**
 * Decoupled Pipeline: Filter Hard Constraints -> Rank Remaining Candidates.
 */
export function filterAndRankRestaurants(
  restaurants: any[],
  query: string = '',
  options?: RankingLocationOptions,
  date: Date = new Date(),
): any[] {
  const filtered = applyHardFilters(restaurants, options, date);
  return rankRestaurants(filtered, query, options, date);
}
