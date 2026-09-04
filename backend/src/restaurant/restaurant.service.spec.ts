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

  it('should find restaurants from DB with take constraint when Google Places is not available and query is empty', async () => {
    mockGooglePlacesService.isAvailable.mockReturnValue(false);
    const result = await service.search('');
    expect(mockRepository.find).toHaveBeenCalledWith({
      relations: { categories: true },
      take: 300,
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

  it('should sort search results by distance from user location (nearest first)', async () => {
    const nearRestaurant: Partial<Restaurant> = {
      id: 'near',
      name: 'Near Restaurant',
      latitude: 21.0285,
      longitude: 105.8542, // Exactly at user location
    };
    const farRestaurant: Partial<Restaurant> = {
      id: 'far',
      name: 'Far Restaurant',
      latitude: 21.0800,
      longitude: 105.9000, // ~7 km away
    };

    // Return in reverse order (far first, near second)
    mockRepository.find.mockResolvedValue([farRestaurant, nearRestaurant]);
    mockGooglePlacesService.isAvailable.mockReturnValue(false);

    const result = await service.search('', {
      latitude: 21.0285,
      longitude: 105.8542,
    });

    expect(result[0].id).toBe('near');
    expect(result[1].id).toBe('far');
  });

  it('should rank search query matches using normalized text relevance over non-matching candidates', async () => {
    const matchedRestaurant: Partial<Restaurant> = {
      id: 'matched-pho',
      name: 'Phở Thìn Lò Đúc',
      latitude: 21.035,
      longitude: 105.858,
    };
    const otherRestaurant: Partial<Restaurant> = {
      id: 'other-cafe',
      name: 'Cà Phê Trứng Giảng',
      latitude: 21.0285,
      longitude: 105.8542,
    };

    mockRepository.find.mockResolvedValue([otherRestaurant, matchedRestaurant]);
    mockGooglePlacesService.isAvailable.mockReturnValue(false);

    const result = await service.search('pho thin', {
      latitude: 21.0285,
      longitude: 105.8542,
    });

    expect(result[0].id).toBe('matched-pho');
  });

  it('should apply hard filters (e.g. radius, budget, open_now) before ranking', async () => {
    const insideRadius: Partial<Restaurant> = {
      id: 'inside',
      name: 'Quán Gần',
      latitude: 21.029,
      longitude: 105.8545, // ~0.06 km
      price_range: '$',
    };
    const outsideRadius: Partial<Restaurant> = {
      id: 'outside',
      name: 'Quán Xa',
      latitude: 21.15,
      longitude: 105.95, // ~16 km
      price_range: '$',
    };

    mockRepository.find.mockResolvedValue([insideRadius, outsideRadius]);
    mockGooglePlacesService.isAvailable.mockReturnValue(false);

    const result = await service.search('', {
      latitude: 21.0285,
      longitude: 105.8542,
      radius: 3, // 3 km hard limit
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('inside');
  });

  it('should respect the limit parameter to restrict returned results count', async () => {
    const list = Array.from({ length: 10 }, (_, i) => ({
      id: `r-${i}`,
      name: `Restaurant ${i}`,
      latitude: 21.0285 + i * 0.001,
      longitude: 105.8542 + i * 0.001,
      price_range: '$',
    }));

    mockRepository.find.mockResolvedValue(list);
    mockGooglePlacesService.isAvailable.mockReturnValue(false);

    const result = await service.search('Restaurant', {
      latitude: 21.0285,
      longitude: 105.8542,
      limit: 3,
    });

    expect(result.length).toBe(3);
  });
});
