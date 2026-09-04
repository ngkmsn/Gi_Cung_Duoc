import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity.js';
import { GooglePlacesService, SearchLocationOptions } from './google-places.service.js';
import { filterAndRankRestaurants } from './restaurant-ranking.util.js';

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
    const limit = location?.limit ? Math.min(Math.max(1, location.limit), 100) : 50;

    // 1. If Google Places API is configured, search real-time places from Google Places (New)
    if (this.googlePlacesService.isAvailable()) {
      this.logger.log(
        `Searching Google Places API (New) for query: "${trimmedQuery}" around coordinates: ${location?.latitude}, ${location?.longitude}, radius: ${location?.radius}`,
      );
      const places = await this.googlePlacesService.searchPlaces(trimmedQuery, location);
      if (places && places.length > 0) {
        return filterAndRankRestaurants(places, trimmedQuery, { ...location, limit });
      }
    }

    // 2. Determine active search & filter conditions
    const hasCategory = Boolean(location?.category && location.category.trim().length > 0);
    const hasQuery = Boolean(trimmedQuery.length > 0);

    // Fallback to PostgreSQL database search with pagination/take limit
    let results: Restaurant[];
    if (hasQuery) {
      results = await this.restaurantRepository.find({
        where: [
          { name: ILike(`%${trimmedQuery}%`) },
          { address: ILike(`%${trimmedQuery}%`) },
          { categories: { name: ILike(`%${trimmedQuery}%`) } },
          { categories: { slug: ILike(`%${trimmedQuery}%`) } },
        ],
        relations: { categories: true },
        take: 200,
      });
    } else if (hasCategory) {
      const cat = location!.category!.trim();
      results = await this.restaurantRepository.find({
        where: [
          { categories: { name: ILike(`%${cat}%`) } },
          { categories: { slug: ILike(`%${cat}%`) } },
        ],
        relations: { categories: true },
        take: 200,
      });
    } else {
      results = await this.restaurantRepository.find({
        relations: { categories: true },
        take: 300,
      });
    }

    return filterAndRankRestaurants(results, trimmedQuery, { ...location, limit });
  }
}

