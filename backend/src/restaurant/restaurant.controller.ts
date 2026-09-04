import { Controller, Get, Query } from '@nestjs/common';
import { RestaurantService } from './restaurant.service.js';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('search')
  async search(
    @Query('query') query?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
    @Query('min_budget') minBudget?: string,
    @Query('max_budget') maxBudget?: string,
    @Query('price_range') priceRange?: string,
    @Query('category') category?: string,
    @Query('open_now') openNow?: string,
    @Query('limit') limit?: string,
  ) {
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lng = longitude ? parseFloat(longitude) : undefined;
    const rad = radius ? parseFloat(radius) : undefined;
    const minB = minBudget ? parseFloat(minBudget) : undefined;
    const maxB = maxBudget ? parseFloat(maxBudget) : undefined;
    const lim = limit ? parseInt(limit, 10) : undefined;

    return this.restaurantService.search(query || '', {
      latitude: isNaN(lat as number) ? undefined : lat,
      longitude: isNaN(lng as number) ? undefined : lng,
      radius: isNaN(rad as number) ? undefined : rad,
      min_budget: isNaN(minB as number) ? undefined : minB,
      max_budget: isNaN(maxB as number) ? undefined : maxB,
      price_range: priceRange?.trim() || undefined,
      category: category?.trim() || undefined,
      open_now: openNow === 'true' || openNow === '1' ? true : undefined,
      limit: isNaN(lim as number) ? undefined : lim,
    });
  }
}
