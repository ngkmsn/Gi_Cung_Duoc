import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity.js';
import { Category } from '../entities/category.entity.js';
import { OSMImporterService } from '../osm/osm-importer.service.js';

// Load .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function run() {
  console.log('=====================================================');
  console.log('🍜 Gì Cũng Được - OpenStreetMap Hanoi Import Pipeline');
  console.log('=====================================================');
  console.log(`Connecting to PostgreSQL Database: ${process.env.DB_DATABASE || 'foodfinder'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}...`);

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'foodfinder',
    entities: [Restaurant, Category],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ PostgreSQL database connected successfully.');

    const importer = new OSMImporterService(dataSource);
    const summary = await importer.importHanoiPlaces({
      timeoutSeconds: 60,
      maxRetries: 3,
    });

    console.log('\n-----------------------------------------------------');
    console.log('🎉 Import Summary:');
    console.log(` - Raw OSM Elements Fetched: ${summary.totalRawElements}`);
    console.log(` - Valid Within Hanoi:       ${summary.validNormalized}`);
    console.log(` - Unique Deduplicated:      ${summary.uniqueAfterDeduplication}`);
    console.log(` - Inserted Into Database:   ${summary.insertedCount}`);
    console.log(` - Updated In Database:      ${summary.updatedCount}`);
    console.log('-----------------------------------------------------\n');

    await dataSource.destroy();
    console.log('Database connection closed. Done!');
    process.exit(0);
  } catch (error: any) {
    const errorDetails =
      error?.errors?.map((e: any) => e.message).join(', ') || error?.message || String(error);
    console.error('\n❌ OpenStreetMap import failed:', errorDetails);
    if (errorDetails.includes('ECONNREFUSED')) {
      console.error('👉 Hint: PostgreSQL server is not running on localhost:5432. Please ensure PostgreSQL is started and accessible.');
    }
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

run();
