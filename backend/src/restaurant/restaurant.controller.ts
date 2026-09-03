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
    @Query('max_budget') maxBudget?: string,
    @Query('price_range') priceRange?: string,
    @Query('open_now') openNow?: string,
  ) {
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lng = longitude ? parseFloat(longitude) : undefined;
    const rad = radius ? parseFloat(radius) : undefined;
    const budget = maxBudget ? parseFloat(maxBudget) : undefined;

    return this.restaurantService.search(query || '', {
      latitude: isNaN(lat as number) ? undefined : lat,
      longitude: isNaN(lng as number) ? undefined : lng,
      radius: isNaN(rad as number) ? undefined : rad,
      max_budget: isNaN(budget as number) ? undefined : budget,
      price_range: priceRange?.trim() || undefined,
      open_now: openNow === 'true' || openNow === '1' ? true : undefined,
    });
  }
}
