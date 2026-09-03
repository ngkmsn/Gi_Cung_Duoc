import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRestaurantAndCategorySchema1787913060715 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid-ossp extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create category table
        await queryRunner.query(`
            CREATE TABLE "category" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR(100) NOT NULL UNIQUE,
                "slug" VARCHAR(100) NOT NULL UNIQUE,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create restaurant table with address column
        await queryRunner.query(`
            CREATE TABLE "restaurant" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR(255) NOT NULL,
                "address" VARCHAR(255),
                "latitude" DECIMAL(10, 8) NOT NULL,
                "longitude" DECIMAL(11, 8) NOT NULL,
                "price_range" VARCHAR(4) CHECK ("price_range" IN ('$', '$$', '$$$', '$$$$')),
                "opening_hours" JSONB,
                "facilities" TEXT[] NOT NULL DEFAULT '{}',
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create restaurant_category junction table
        await queryRunner.query(`
            CREATE TABLE "restaurant_category" (
                "restaurant_id" UUID NOT NULL REFERENCES "restaurant" ("id") ON DELETE CASCADE,
                "category_id" UUID NOT NULL REFERENCES "category" ("id") ON DELETE CASCADE,
                PRIMARY KEY ("restaurant_id", "category_id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_category_slug" ON "category" ("slug")`);
        await queryRunner.query(`CREATE INDEX "idx_restaurant_geo" ON "restaurant" ("latitude", "longitude")`);
        await queryRunner.query(`CREATE INDEX "idx_restaurant_category_cat" ON "restaurant_category" ("category_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_restaurant_category_cat"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_restaurant_geo"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_category_slug"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "restaurant_category"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "restaurant"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "category"`);
    }

}
