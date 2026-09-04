import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { fetchOSMHanoiPlaces, FetchOSMOptions } from './osm-fetcher.js';
import { normalizeOSMElement, deduplicateRestaurants } from './osm-normalizer.js';
import { Category } from '../entities/category.entity.js';
import { Restaurant } from '../entities/restaurant.entity.js';
import { NormalizedOSMRestaurant } from './osm-types.js';

export interface ImportSummary {
  totalRawElements: number;
  validNormalized: number;
  uniqueAfterDeduplication: number;
  insertedCount: number;
  updatedCount: number;
}

const DEFAULT_CATEGORIES = [
  { name: 'Món Việt', slug: 'vietnamese' },
  { name: 'Cà Phê', slug: 'coffee' },
  { name: 'Đồ Tây', slug: 'western' },
  { name: 'Đồ Nhật', slug: 'japanese' },
  { name: 'Tráng Miệng', slug: 'dessert' },
];

@Injectable()
export class OSMImporterService {
  private readonly logger = new Logger(OSMImporterService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Runs the complete OpenStreetMap Hanoi import and database upsert pipeline.
   */
  async importHanoiPlaces(options?: FetchOSMOptions): Promise<ImportSummary> {
    this.logger.log('Starting OpenStreetMap Hanoi restaurant import pipeline...');

    // 1. Fetch raw OSM elements via Overpass API
    const rawElements = await fetchOSMHanoiPlaces(options, this.logger);
    this.logger.log(`Received ${rawElements.length} raw OSM elements.`);

    // 2. Normalize and validate elements
    const normalizedList: NormalizedOSMRestaurant[] = [];
    for (const el of rawElements) {
      const normalized = normalizeOSMElement(el);
      if (normalized) {
        normalizedList.push(normalized);
      }
    }
    this.logger.log(`Normalized ${normalizedList.length} valid food places within Hanoi bounds.`);

    // 3. Remove duplicates
    const uniqueRestaurants = deduplicateRestaurants(normalizedList);
    this.logger.log(`Deduplicated to ${uniqueRestaurants.length} unique restaurants.`);

    // 4. Upsert into PostgreSQL database
    const summary = await this.upsertIntoDatabase(uniqueRestaurants);

    this.logger.log('OpenStreetMap Hanoi import pipeline completed successfully.');
    this.logger.log(`Summary: Raw: ${rawElements.length}, Valid: ${normalizedList.length}, Unique: ${uniqueRestaurants.length}, Inserted: ${summary.insertedCount}, Updated: ${summary.updatedCount}`);

    return {
      totalRawElements: rawElements.length,
      validNormalized: normalizedList.length,
      uniqueAfterDeduplication: uniqueRestaurants.length,
      insertedCount: summary.insertedCount,
      updatedCount: summary.updatedCount,
    };
  }

  private async upsertIntoDatabase(
    restaurants: NormalizedOSMRestaurant[],
  ): Promise<{ insertedCount: number; updatedCount: number }> {
    const categoryRepo = this.dataSource.getRepository(Category);
    const restaurantRepo = this.dataSource.getRepository(Restaurant);

    // Ensure default categories exist in DB
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await categoryRepo.findOne({ where: { slug: cat.slug } });
      if (!existing) {
        const newCat = categoryRepo.create({ name: cat.name, slug: cat.slug });
        await categoryRepo.save(newCat);
      }
    }

    const allCategories = await categoryRepo.find();
    const catMapBySlug = new Map<string, Category>(allCategories.map((c) => [c.slug, c]));

    let insertedCount = 0;
    let updatedCount = 0;

    // Process in batches for performance
    const batchSize = 100;
    for (let i = 0; i < restaurants.length; i += batchSize) {
      const batch = restaurants.slice(i, i + batchSize);

      await this.dataSource.transaction(async (manager) => {
        for (const item of batch) {
          // Check if restaurant already exists by name and proximity (~50m)
          const existing = await manager
            .createQueryBuilder(Restaurant, 'r')
            .where('r.name = :name', { name: item.name })
            .andWhere('ABS(r.latitude - :lat) < 0.0005 AND ABS(r.longitude - :lon) < 0.0005', {
              lat: item.latitude,
              lon: item.longitude,
            })
            .getOne();

          const targetCategories: Category[] = [];
          for (const cat of item.categories) {
            const mapped = catMapBySlug.get(cat.slug);
            if (mapped) {
              targetCategories.push(mapped);
            }
          }
          if (targetCategories.length === 0 && catMapBySlug.has('vietnamese')) {
            targetCategories.push(catMapBySlug.get('vietnamese')!);
          }

          if (existing) {
            existing.address = item.address || existing.address;
            existing.latitude = item.latitude;
            existing.longitude = item.longitude;
            existing.price_range = item.price_range || existing.price_range;
            existing.opening_hours = item.opening_hours || existing.opening_hours;
            existing.facilities = item.facilities.length > 0 ? item.facilities : existing.facilities;
            existing.categories = targetCategories;

            await manager.save(existing);
            updatedCount++;
          } else {
            const newRestaurant = manager.create(Restaurant, {
              name: item.name,
              address: item.address || undefined,
              latitude: item.latitude,
              longitude: item.longitude,
              price_range: item.price_range || undefined,
              opening_hours: item.opening_hours || null,
              facilities: item.facilities || [],
              categories: targetCategories,
            });

            await manager.save(newRestaurant);
            insertedCount++;
          }
        }
      });
    }

    return { insertedCount, updatedCount };
  }
}
