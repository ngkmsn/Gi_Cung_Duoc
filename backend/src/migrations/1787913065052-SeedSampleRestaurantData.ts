import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedSampleRestaurantData1787913065052 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert Categories
        await queryRunner.query(`
            INSERT INTO "category" ("name", "slug") VALUES
            ('Vietnamese', 'vietnamese'),
            ('Coffee', 'coffee'),
            ('Japanese', 'japanese'),
            ('Western', 'western'),
            ('Dessert', 'dessert')
        `);

        // Insert Restaurants
        await queryRunner.query(`
            INSERT INTO "restaurant" ("name", "latitude", "longitude", "price_range", "opening_hours", "facilities") VALUES
            ('Banh Mi Phuong', 21.02851100, 105.80481700, '$', '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "07:00", "close": "21:00"}, "sunday": {"open": "07:00", "close": "21:00"}}', '{"AC", "Parking"}'),
            ('Cafe Giang', 21.03310000, 105.85390000, '$', '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}', '{"Wifi"}'),
            ('Pizza 4P''s', 21.02580000, 105.85040000, '$$', '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "22:30"}, "saturday": {"open": "11:00", "close": "22:30"}, "sunday": {"open": "11:00", "close": "22:00"}}', '{"AC", "Wifi", "Credit Card", "Parking"}'),
            ('Sushi Bar', 21.03150000, 105.81640000, '$$$', '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "11:00", "close": "22:00"}}', '{"AC", "Private Room"}'),
            ('Kem Trang Tien', 21.02450000, 105.85420000, '$', '{"monday": {"open": "08:00", "close": "23:00"}, "tuesday": {"open": "08:00", "close": "23:00"}, "wednesday": {"open": "08:00", "close": "23:00"}, "thursday": {"open": "08:00", "close": "23:00"}, "friday": {"open": "08:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "23:00"}}', '{"Parking"}')
        `);

        // Insert mappings in junction table
        await queryRunner.query(`
            INSERT INTO "restaurant_category" ("restaurant_id", "category_id") VALUES
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Banh Mi Phuong'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cafe Giang'), (SELECT "id" FROM "category" WHERE "slug" = 'coffee')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cafe Giang'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Pizza 4P''s'), (SELECT "id" FROM "category" WHERE "slug" = 'western')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Sushi Bar'), (SELECT "id" FROM "category" WHERE "slug" = 'japanese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Kem Trang Tien'), (SELECT "id" FROM "category" WHERE "slug" = 'dessert')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Kem Trang Tien'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Cascade delete from junction table happens automatically when deleting from main tables,
        // but we clean it up anyway
        await queryRunner.query(`DELETE FROM "restaurant_category"`);
        await queryRunner.query(`DELETE FROM "category"`);
        await queryRunner.query(`DELETE FROM "restaurant"`);
    }

}
