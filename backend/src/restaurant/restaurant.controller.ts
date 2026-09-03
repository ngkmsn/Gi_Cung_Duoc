import { Controller, Get, Query } from '@nestjs/common';
import { RestaurantService } from './restaurant.service.js';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('search')
  async search(@Query('query') query?: string) {
    return this.restaurantService.search(query || '');
  }
}
