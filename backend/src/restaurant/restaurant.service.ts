import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity.js';
import { GooglePlacesService, SearchLocationOptions } from './google-places.service.js';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function isRestaurantOpenNow(restaurant: any, date: Date = new Date()): boolean {
  if (restaurant.is_open_now !== undefined) {
    return restaurant.is_open_now;
  }
  if (!restaurant.opening_hours) {
    return true;
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

@Injectable()
export class RestaurantService {
  private readonly logger = new Logger(RestaurantService.name);

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly googlePlacesService: GooglePlacesService,
  ) {}

  async search(query: string = '', location?: SearchLocationOptions): Promise<any[]> {
    const trimmedQuery = query.trim();

    // 1. If Google Places API is configured, search real-time places from Google Places (New)
    if (this.googlePlacesService.isAvailable()) {
      this.logger.log(`Searching Google Places API (New) for query: "${trimmedQuery}" around coordinates: ${location?.latitude}, ${location?.longitude}, radius: ${location?.radius}`);
      const places = await this.googlePlacesService.searchPlaces(trimmedQuery, location);
      if (places && places.length > 0) {
        return this.filterAndSortByDistance(places, location);
      }
    }

    // 2. Fallback to PostgreSQL database search
    let results: Restaurant[];
    if (!trimmedQuery) {
      results = await this.restaurantRepository.find({
        relations: { categories: true },
      });
    } else {
      results = await this.restaurantRepository.find({
        where: [
          { name: ILike(`%${trimmedQuery}%`) },
          { address: ILike(`%${trimmedQuery}%`) },
          { categories: { name: ILike(`%${trimmedQuery}%`) } },
          { categories: { slug: ILike(`%${trimmedQuery}%`) } },
        ],
        relations: { categories: true },
      });
    }

    return this.filterAndSortByDistance(results, location);
  }

  private filterAndSortByDistance(restaurants: any[], location?: SearchLocationOptions): any[] {
    let filtered = restaurants;

    // Filter by budget range in VNĐ
    if (location?.min_budget !== undefined || location?.max_budget !== undefined) {
      const budgetMin = location.min_budget ?? 0;
      const budgetMax = location.max_budget ?? 10_000_000;
      filtered = filtered.filter((r) => {
        const minPrice = r.min_price ?? 30000;
        const maxPrice = r.max_price ?? minPrice;
        return maxPrice >= budgetMin && minPrice <= budgetMax;
      });
    } else if (location?.price_range) {
      filtered = filtered.filter((r) => r.price_range === location.price_range);
    }

    // Filter by open now
    if (location?.open_now) {
      filtered = filtered.filter((r) => isRestaurantOpenNow(r));
    }

    if (!location?.latitude || !location?.longitude) {
      return filtered;
    }

    const userLat = location.latitude;
    const userLng = location.longitude;
    const radiusKm = location.radius
      ? location.radius > 50
        ? location.radius / 1000
        : location.radius
      : undefined;

    if (radiusKm) {
      filtered = filtered.filter((r) => {
        const lat = typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude;
        const lng = typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude;
        if (!lat || !lng) return false;
        return calculateDistanceKm(userLat, userLng, lat, lng) <= radiusKm;
      });
    }

    return [...filtered].sort((a, b) => {
      const latA = typeof a.latitude === 'string' ? parseFloat(a.latitude) : a.latitude;
      const lngA = typeof a.longitude === 'string' ? parseFloat(a.longitude) : a.longitude;
      const latB = typeof b.latitude === 'string' ? parseFloat(b.latitude) : b.latitude;
      const lngB = typeof b.longitude === 'string' ? parseFloat(b.longitude) : b.longitude;

      if (!latA || !lngA) return 1;
      if (!latB || !lngB) return -1;

      const distA = calculateDistanceKm(userLat, userLng, latA, lngA);
      const distB = calculateDistanceKm(userLat, userLng, latB, lngB);

      return distA - distB;
    });
  }
}
