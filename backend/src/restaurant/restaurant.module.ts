import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../entities/restaurant.entity.js';
import { Category } from '../entities/category.entity.js';
import { RestaurantService } from './restaurant.service.js';
import { RestaurantController } from './restaurant.controller.js';
import { GooglePlacesService } from './google-places.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [RestaurantService, GooglePlacesService],
  controllers: [RestaurantController],
  exports: [RestaurantService, GooglePlacesService],
})
export class RestaurantModule {}
