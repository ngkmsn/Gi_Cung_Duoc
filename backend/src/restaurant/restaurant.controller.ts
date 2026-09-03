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
  ) {
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lng = longitude ? parseFloat(longitude) : undefined;
    const rad = radius ? parseFloat(radius) : undefined;

    return this.restaurantService.search(query || '', {
      latitude: isNaN(lat as number) ? undefined : lat,
      longitude: isNaN(lng as number) ? undefined : lng,
      radius: isNaN(rad as number) ? undefined : rad,
    });
  }
}
