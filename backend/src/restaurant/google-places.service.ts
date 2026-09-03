import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GooglePlacePhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: any[];
}

export interface GooglePlaceLocation {
  latitude: number;
  longitude: number;
}

export interface GooglePlace {
  id: string;
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  location?: GooglePlaceLocation;
  priceLevel?: string;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  types?: string[];
  photos?: GooglePlacePhoto[];
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open?: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions?: string[];
  };
}

export interface SearchLocationOptions {
  latitude?: number;
  longitude?: number;
  radius?: number;
  min_budget?: number;
  max_budget?: number;
  price_range?: string;
  open_now?: boolean;
}

const TYPE_NAME_MAP: Record<string, { name: string; slug: string; icon: string }> = {
  vietnamese_restaurant: { name: 'Món Việt', slug: 'vietnamese', icon: '🍜' },
  coffee_shop: { name: 'Cà Phê', slug: 'coffee', icon: '☕' },
  cafe: { name: 'Cà Phê & Trà', slug: 'coffee', icon: '☕' },
  bakery: { name: 'Bánh Ngọt & Bánh Mì', slug: 'dessert', icon: '🥖' },
  dessert_shop: { name: 'Tráng Miệng', slug: 'dessert', icon: '🍨' },
  ice_cream_shop: { name: 'Kem & Tráng Miệng', slug: 'dessert', icon: '🍨' },
  japanese_restaurant: { name: 'Đồ Nhật', slug: 'japanese', icon: '🍣' },
  sushi_restaurant: { name: 'Sushi & Đồ Nhật', slug: 'japanese', icon: '🍣' },
  pizza_restaurant: { name: 'Pizza & Đồ Tây', slug: 'western', icon: '🍕' },
  italian_restaurant: { name: 'Đồ Ý', slug: 'western', icon: '🍝' },
  seafood_restaurant: { name: 'Hải Sản', slug: 'vietnamese', icon: '🦞' },
  bar_and_grill: { name: 'Nướng & Lẩu', slug: 'western', icon: '🥩' },
  barbecue_restaurant: { name: 'Đồ Nướng', slug: 'vietnamese', icon: '🥩' },
  fast_food_restaurant: { name: 'Thức Ăn Nhanh', slug: 'western', icon: '🍔' },
  vegetarian_restaurant: { name: 'Món Chay', slug: 'vietnamese', icon: '🥗' },
};

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async searchPlaces(query: string, location?: SearchLocationOptions): Promise<any[]> {
    if (!this.isAvailable()) {
      this.logger.debug('GOOGLE_PLACES_API_KEY not configured, skipping Google Places API');
      return [];
    }

    const trimmedQuery = query.trim();
    const lat = location?.latitude || 21.0285;
    const lng = location?.longitude || 105.8542;
    const radius = location?.radius || 15000.0;

    const searchText = trimmedQuery || 'quán ăn nhà hàng ngon nổi tiếng';

    const url = 'https://places.googleapis.com/v1/places:searchText';

    const requestBody = {
      textQuery: searchText,
      languageCode: 'vi',
      regionCode: 'VN',
      locationBias: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },
          radius: radius,
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey!,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.priceLevel,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos,places.primaryType,places.types',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errBody = await response.text();
        this.logger.warn(`Google Places API returned status ${response.status}: ${errBody}`);
        return [];
      }

      const data = await response.json();
      const places: GooglePlace[] = data.places || [];

      return places.map((place) => this.mapGooglePlaceToRestaurant(place));
    } catch (error) {
      this.logger.error('Failed to query Google Places API:', error);
      return [];
    }
  }

  private mapGooglePlaceToRestaurant(place: GooglePlace) {
    // Map price level
    let priceRange = '$';
    let minPrice = 30000;
    let maxPrice = 65000;
    if (place.priceLevel === 'PRICE_LEVEL_MODERATE') {
      priceRange = '$$';
      minPrice = 70000;
      maxPrice = 180000;
    } else if (place.priceLevel === 'PRICE_LEVEL_EXPENSIVE') {
      priceRange = '$$$';
      minPrice = 180000;
      maxPrice = 500000;
    } else if (place.priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE') {
      priceRange = '$$$$';
      minPrice = 500000;
      maxPrice = 1800000;
    }

    // Map photo URL
    let imageUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
    if (place.photos && place.photos.length > 0 && this.apiKey) {
      imageUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=800&maxHeightPx=600&key=${this.apiKey}`;
    }

    // Map categories from types
    const categories: Array<{ id: string; name: string; slug: string; icon?: string }> = [];
    const detectedTypes = [place.primaryType, ...(place.types || [])].filter(Boolean) as string[];

    for (const t of detectedTypes) {
      const mapped = TYPE_NAME_MAP[t];
      if (mapped && !categories.some((c) => c.slug === mapped.slug)) {
        categories.push({
          id: `cat-${mapped.slug}`,
          name: mapped.name,
          slug: mapped.slug,
          icon: mapped.icon,
        });
      }
    }

    if (categories.length === 0) {
      categories.push({
        id: 'cat-vietnamese',
        name: 'Ẩm Thực',
        slug: 'vietnamese',
        icon: '🍽️',
      });
    }

    // Map facilities
    const facilities: string[] = ['AC', 'Wifi'];
    if (categories.some((c) => c.slug === 'western' || c.slug === 'japanese')) {
      facilities.push('Credit Card');
    }
    if (place.rating && place.rating >= 4.5) {
      facilities.push('Parking');
    }

    return {
      id: place.id,
      name: place.displayName?.text || 'Quán Ăn',
      address: place.formattedAddress || 'Hà Nội, Việt Nam',
      latitude: place.location?.latitude || 21.0285,
      longitude: place.location?.longitude || 105.8542,
      price_range: priceRange,
      min_price: minPrice,
      max_price: maxPrice,
      image_url: imageUrl,
      rating: place.rating || 4.6,
      review_count: place.userRatingCount || 100,
      time_estimate: '15-25 phút',
      badge: place.rating && place.rating >= 4.8 ? 'Được Yêu Thích' : null,
      specialty_dish: categories[0]?.name ? `Món ngon ${categories[0].name}` : null,
      is_open_now: place.regularOpeningHours?.openNow !== undefined ? place.regularOpeningHours.openNow : true,
      facilities,
      categories,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }
}
