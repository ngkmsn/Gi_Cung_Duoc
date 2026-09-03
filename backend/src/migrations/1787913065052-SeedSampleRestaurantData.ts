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
            ON CONFLICT ("slug") DO NOTHING
        `);

        // Insert 20 Realistic Hanoi Restaurants
        await queryRunner.query(`
            INSERT INTO "restaurant" ("name", "address", "latitude", "longitude", "price_range", "opening_hours", "facilities") VALUES
            (
                'Pho Thin Lo Duc',
                '13 Lo Duc, Pham Dinh Ho, Hai Ba Trung, Ha Noi',
                21.01831800,
                105.85662100,
                '$',
                '{"monday": {"open": "06:00", "close": "20:30"}, "tuesday": {"open": "06:00", "close": "20:30"}, "wednesday": {"open": "06:00", "close": "20:30"}, "thursday": {"open": "06:00", "close": "20:30"}, "friday": {"open": "06:00", "close": "20:30"}, "saturday": {"open": "06:00", "close": "20:30"}, "sunday": {"open": "06:00", "close": "20:30"}}',
                '{"AC", "Parking"}'
            ),
            (
                'Bun Cha Huong Lien',
                '24 Le Van Huu, Phan Chu Trinh, Hai Ba Trung, Ha Noi',
                21.01889000,
                105.85412000,
                '$',
                '{"monday": {"open": "08:00", "close": "20:30"}, "tuesday": {"open": "08:00", "close": "20:30"}, "wednesday": {"open": "08:00", "close": "20:30"}, "thursday": {"open": "08:00", "close": "20:30"}, "friday": {"open": "08:00", "close": "20:30"}, "saturday": {"open": "08:00", "close": "20:30"}, "sunday": {"open": "08:00", "close": "20:30"}}',
                '{"AC", "Wifi", "Parking"}'
            ),
            (
                'Cafe Giang',
                '39 Nguyen Huu Huan, Ly Thai To, Hoan Kiem, Ha Noi',
                21.03310000,
                105.85390000,
                '$',
                '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}',
                '{"Wifi"}'
            ),
            (
                'Banh Mi 25',
                '25 Hang Ca, Hang Dao, Hoan Kiem, Ha Noi',
                21.03608000,
                105.84962000,
                '$',
                '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "07:00", "close": "21:00"}, "sunday": {"open": "07:00", "close": "21:00"}}',
                '{"Wifi", "Credit Card"}'
            ),
            (
                'Pizza 4P''s Trang Tien',
                '43 Trang Tien, Hoan Kiem, Ha Noi',
                21.02580000,
                105.85540000,
                '$$$',
                '{"monday": {"open": "11:00", "close": "22:30"}, "tuesday": {"open": "11:00", "close": "22:30"}, "wednesday": {"open": "11:00", "close": "22:30"}, "thursday": {"open": "11:00", "close": "22:30"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "11:00", "close": "22:30"}}',
                '{"AC", "Wifi", "Credit Card", "Parking"}'
            ),
            (
                'Cha Ca La Vong',
                '14 Cha Ca, Hang Dao, Hoan Kiem, Ha Noi',
                21.03651000,
                105.84883000,
                '$$',
                '{"monday": {"open": "11:00", "close": "21:00"}, "tuesday": {"open": "11:00", "close": "21:00"}, "wednesday": {"open": "11:00", "close": "21:00"}, "thursday": {"open": "11:00", "close": "21:00"}, "friday": {"open": "11:00", "close": "21:00"}, "saturday": {"open": "11:00", "close": "21:00"}, "sunday": {"open": "11:00", "close": "21:00"}}',
                '{"AC", "Private Room"}'
            ),
            (
                'Sushi Bar Ha Noi',
                '107 Kim Ma, Ba Dinh, Ha Noi',
                21.03150000,
                105.81640000,
                '$$$',
                '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "11:00", "close": "22:00"}}',
                '{"AC", "Wifi", "Credit Card", "Private Room"}'
            ),
            (
                'Kem Trang Tien',
                '35 Trang Tien, Hoan Kiem, Ha Noi',
                21.02450000,
                105.85420000,
                '$',
                '{"monday": {"open": "08:00", "close": "23:00"}, "tuesday": {"open": "08:00", "close": "23:00"}, "wednesday": {"open": "08:00", "close": "23:00"}, "thursday": {"open": "08:00", "close": "23:00"}, "friday": {"open": "08:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "23:00"}}',
                '{"Parking"}'
            ),
            (
                'The Note Coffee',
                '64 Luong Van Can, Hang Trong, Hoan Kiem, Ha Noi',
                21.03165000,
                105.85194000,
                '$',
                '{"monday": {"open": "08:00", "close": "22:30"}, "tuesday": {"open": "08:00", "close": "22:30"}, "wednesday": {"open": "08:00", "close": "22:30"}, "thursday": {"open": "08:00", "close": "22:30"}, "friday": {"open": "08:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "22:30"}}',
                '{"AC", "Wifi", "Credit Card"}'
            ),
            (
                'Quan An Ngon Phan Boi Chau',
                '18 Phan Boi Chau, Cua Nam, Hoan Kiem, Ha Noi',
                21.02511000,
                105.84532000,
                '$$',
                '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}',
                '{"AC", "Wifi", "Parking", "Credit Card"}'
            ),
            (
                'Pho Gia Truyen Bat Dan',
                '49 Bat Dan, Cua Dong, Hoan Kiem, Ha Noi',
                21.03460000,
                105.84750000,
                '$',
                '{"monday": {"open": "06:00", "close": "20:30"}, "tuesday": {"open": "06:00", "close": "20:30"}, "wednesday": {"open": "06:00", "close": "20:30"}, "thursday": {"open": "06:00", "close": "20:30"}, "friday": {"open": "06:00", "close": "20:30"}, "saturday": {"open": "06:00", "close": "20:30"}, "sunday": {"open": "06:00", "close": "20:30"}}',
                '{"Parking"}'
            ),
            (
                'Cafe Dinh',
                '13 Dinh Tien Hoang, Hang Bac, Hoan Kiem, Ha Noi',
                21.03120000,
                105.85330000,
                '$',
                '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}',
                '{"Wifi"}'
            ),
            (
                'Bun Dau Cay Da Thuy Khue',
                '235B Thuy Khue, Thuy Khue, Tay Ho, Ha Noi',
                21.04350000,
                105.82020000,
                '$',
                '{"monday": {"open": "09:00", "close": "21:00"}, "tuesday": {"open": "09:00", "close": "21:00"}, "wednesday": {"open": "09:00", "close": "21:00"}, "thursday": {"open": "09:00", "close": "21:00"}, "friday": {"open": "09:00", "close": "21:00"}, "saturday": {"open": "09:00", "close": "21:00"}, "sunday": {"open": "09:00", "close": "21:00"}}',
                '{"AC", "Parking"}'
            ),
            (
                'Net Hue Hang Bong',
                '198 Hang Bong, Hoan Kiem, Ha Noi',
                21.02980000,
                105.84360000,
                '$$',
                '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "22:00"}, "sunday": {"open": "08:00", "close": "22:00"}}',
                '{"AC", "Wifi", "Credit Card"}'
            ),
            (
                'Dim Sum Corner Hao Nam',
                '182 Hao Nam, O Cho Dua, Dong Da, Ha Noi',
                21.02430000,
                105.82470000,
                '$$',
                '{"monday": {"open": "10:00", "close": "22:00"}, "tuesday": {"open": "10:00", "close": "22:00"}, "wednesday": {"open": "10:00", "close": "22:00"}, "thursday": {"open": "10:00", "close": "22:00"}, "friday": {"open": "10:00", "close": "22:00"}, "saturday": {"open": "10:00", "close": "22:00"}, "sunday": {"open": "10:00", "close": "22:00"}}',
                '{"AC", "Wifi", "Credit Card", "Parking"}'
            ),
            (
                'Tokyo Deli Sushi Hoang Dao Thuy',
                'N04 Hoang Dao Thuy, Trung Hoa, Cau Giay, Ha Noi',
                21.00920000,
                105.80150000,
                '$$$',
                '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"open": "11:00", "close": "22:00"}}',
                '{"AC", "Wifi", "Credit Card", "Private Room"}'
            ),
            (
                'Cu Xa Ca Phe Ton That Tung',
                'Tang 2, A11 Ton That Tung, Dong Da, Ha Noi',
                21.00680000,
                105.83150000,
                '$',
                '{"monday": {"open": "08:00", "close": "22:30"}, "tuesday": {"open": "08:00", "close": "22:30"}, "wednesday": {"open": "08:00", "close": "22:30"}, "thursday": {"open": "08:00", "close": "22:30"}, "friday": {"open": "08:00", "close": "22:30"}, "saturday": {"open": "08:00", "close": "22:30"}, "sunday": {"open": "08:00", "close": "22:30"}}',
                '{"Wifi"}'
            ),
            (
                'Bo To Quan Moc Thai Thinh',
                '102 Thai Thinh, Dong Da, Ha Noi',
                21.01180000,
                105.81820000,
                '$$',
                '{"monday": {"open": "10:00", "close": "22:30"}, "tuesday": {"open": "10:00", "close": "22:30"}, "wednesday": {"open": "10:00", "close": "22:30"}, "thursday": {"open": "10:00", "close": "22:30"}, "friday": {"open": "10:00", "close": "22:30"}, "saturday": {"open": "10:00", "close": "22:30"}, "sunday": {"open": "10:00", "close": "22:30"}}',
                '{"AC", "Wifi", "Parking", "Private Room"}'
            ),
            (
                'Che Bon Mua Hang Can',
                '4 Hang Can, Hang Dao, Hoan Kiem, Ha Noi',
                21.03420000,
                105.84990000,
                '$',
                '{"monday": {"open": "09:00", "close": "23:00"}, "tuesday": {"open": "09:00", "close": "23:00"}, "wednesday": {"open": "09:00", "close": "23:00"}, "thursday": {"open": "09:00", "close": "23:00"}, "friday": {"open": "09:00", "close": "23:00"}, "saturday": {"open": "09:00", "close": "23:00"}, "sunday": {"open": "09:00", "close": "23:00"}}',
                '{"Wifi"}'
            ),
            (
                'El Gaucho Steakhouse Trang Tien',
                '11 Trang Tien, Hoan Kiem, Ha Noi',
                21.02530000,
                105.85690000,
                '$$$$',
                '{"monday": {"open": "11:00", "close": "23:00"}, "tuesday": {"open": "11:00", "close": "23:00"}, "wednesday": {"open": "11:00", "close": "23:00"}, "thursday": {"open": "11:00", "close": "23:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "11:00", "close": "23:00"}, "sunday": {"open": "11:00", "close": "23:00"}}',
                '{"AC", "Wifi", "Credit Card", "Parking", "Private Room"}'
            )
        `);

        // Insert mappings in junction table
        await queryRunner.query(`
            INSERT INTO "restaurant_category" ("restaurant_id", "category_id") VALUES
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Pho Thin Lo Duc'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Bun Cha Huong Lien'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cafe Giang'), (SELECT "id" FROM "category" WHERE "slug" = 'coffee')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cafe Giang'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Banh Mi 25'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Pizza 4P''s Trang Tien'), (SELECT "id" FROM "category" WHERE "slug" = 'western')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cha Ca La Vong'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Sushi Bar Ha Noi'), (SELECT "id" FROM "category" WHERE "slug" = 'japanese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Kem Trang Tien'), (SELECT "id" FROM "category" WHERE "slug" = 'dessert')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Kem Trang Tien'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'The Note Coffee'), (SELECT "id" FROM "category" WHERE "slug" = 'coffee')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'The Note Coffee'), (SELECT "id" FROM "category" WHERE "slug" = 'dessert')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Quan An Ngon Phan Boi Chau'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Pho Gia Truyen Bat Dan'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cafe Dinh'), (SELECT "id" FROM "category" WHERE "slug" = 'coffee')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Bun Dau Cay Da Thuy Khue'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Net Hue Hang Bong'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Dim Sum Corner Hao Nam'), (SELECT "id" FROM "category" WHERE "slug" = 'western')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Tokyo Deli Sushi Hoang Dao Thuy'), (SELECT "id" FROM "category" WHERE "slug" = 'japanese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cu Xa Ca Phe Ton That Tung'), (SELECT "id" FROM "category" WHERE "slug" = 'coffee')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Cu Xa Ca Phe Ton That Tung'), (SELECT "id" FROM "category" WHERE "slug" = 'dessert')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Bo To Quan Moc Thai Thinh'), (SELECT "id" FROM "category" WHERE "slug" = 'vietnamese')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'Che Bon Mua Hang Can'), (SELECT "id" FROM "category" WHERE "slug" = 'dessert')),
            ((SELECT "id" FROM "restaurant" WHERE "name" = 'El Gaucho Steakhouse Trang Tien'), (SELECT "id" FROM "category" WHERE "slug" = 'western'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "restaurant_category"`);
        await queryRunner.query(`DELETE FROM "category"`);
        await queryRunner.query(`DELETE FROM "restaurant"`);
    }

}
