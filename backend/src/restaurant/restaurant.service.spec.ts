import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RestaurantService } from './restaurant.service.js';
import { GooglePlacesService } from './google-places.service.js';
import { Restaurant } from '../entities/restaurant.entity.js';

describe('RestaurantService', () => {
  let service: RestaurantService;

  const mockRestaurant: Partial<Restaurant> = {
    id: 'test-uuid-1',
    name: 'Pho Thin Lo Duc',
    address: '13 Lo Duc, Hai Ba Trung, Ha Noi',
    latitude: 21.018318,
    longitude: 105.856621,
    price_range: '$',
    facilities: ['AC', 'Parking'],
    categories: [],
  };

  const mockRepository = {
    find: vi.fn().mockResolvedValue([mockRestaurant]),
  };

  const mockGooglePlacesService = {
    isAvailable: vi.fn().mockReturnValue(false),
    searchPlaces: vi.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepository,
        },
        {
          provide: GooglePlacesService,
          useValue: mockGooglePlacesService,
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all restaurants from DB when Google Places is not available and query is empty', async () => {
    mockGooglePlacesService.isAvailable.mockReturnValue(false);
    const result = await service.search('');
    expect(mockRepository.find).toHaveBeenCalledWith({
      relations: { categories: true },
    });
    expect(result).toEqual([mockRestaurant]);
  });

  it('should return Google Places results when available and sort by location', async () => {
    const googlePlaceResult = [
      {
        id: 'places/ChIJ123',
        name: 'Phở 10 Lý Quốc Sư',
        address: '10 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
        latitude: 21.0305,
        longitude: 105.8488,
        price_range: '$',
      },
    ];
    mockGooglePlacesService.isAvailable.mockReturnValue(true);
    mockGooglePlacesService.searchPlaces.mockResolvedValue(googlePlaceResult);

    const result = await service.search('Pho Ly Quoc Su', {
      latitude: 21.0285,
      longitude: 105.8542,
    });
    expect(mockGooglePlacesService.searchPlaces).toHaveBeenCalledWith('Pho Ly Quoc Su', {
      latitude: 21.0285,
      longitude: 105.8542,
    });
    expect(result).toEqual(googlePlaceResult);
  });
});
