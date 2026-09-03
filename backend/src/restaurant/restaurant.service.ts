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
    if (!location?.latitude || !location?.longitude) {
      return restaurants;
    }

    const userLat = location.latitude;
    const userLng = location.longitude;
    const radiusKm = location.radius
      ? location.radius > 50
        ? location.radius / 1000
        : location.radius
      : undefined;

    let filtered = restaurants;
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
