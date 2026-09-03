import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity.js';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async search(query: string): Promise<Restaurant[]> {
    if (!query) {
      return this.restaurantRepository.find({
        relations: { categories: true },
      });
    }

    // Search by name, category name, or category slug using case-insensitive ILike
    return this.restaurantRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { categories: { name: ILike(`%${query}%`) } },
        { categories: { slug: ILike(`%${query}%`) } },
      ],
      relations: { categories: true },
    });
  }
}
