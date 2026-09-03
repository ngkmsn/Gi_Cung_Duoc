import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantController } from './restaurant.controller.js';
import { RestaurantService } from './restaurant.service.js';

describe('RestaurantController', () => {
  let controller: RestaurantController;
  let service: RestaurantService;

  const mockRestaurant = {
    id: 'test-uuid-1',
    name: 'Pho Thin Lo Duc',
    address: '13 Lo Duc, Hai Ba Trung, Ha Noi',
    latitude: 21.018318,
    longitude: 105.856621,
    price_range: '$',
    opening_hours: null,
    facilities: ['AC', 'Parking'],
    categories: [{ id: 'cat-1', name: 'Vietnamese', slug: 'vietnamese', restaurants: [], created_at: new Date(), updated_at: new Date() }],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRestaurantService = {
    search: vi.fn().mockResolvedValue([mockRestaurant]),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        {
          provide: RestaurantService,
          useValue: mockRestaurantService,
        },
      ],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return restaurants matching search query with optional coordinates, price and open status', async () => {
    const result = await controller.search('Pho Thin', '21.0285', '105.8542', '3000', '$$', 'true');
    expect(service.search).toHaveBeenCalledWith('Pho Thin', {
      latitude: 21.0285,
      longitude: 105.8542,
      radius: 3000,
      price_range: '$$',
      open_now: true,
    });
    expect(result).toEqual([mockRestaurant]);
  });

  it('should pass empty string when query parameter is omitted', async () => {
    await controller.search(undefined);
    expect(service.search).toHaveBeenCalledWith('', {
      latitude: undefined,
      longitude: undefined,
      radius: undefined,
      price_range: undefined,
      open_now: undefined,
    });
  });
});
