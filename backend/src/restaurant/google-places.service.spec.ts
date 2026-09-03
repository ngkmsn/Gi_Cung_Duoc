import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GooglePlacesService } from './google-places.service.js';

describe('GooglePlacesService', () => {
  let service: GooglePlacesService;

  const mockConfigService = {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'GOOGLE_PLACES_API_KEY') return 'test_api_key_123';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GooglePlacesService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GooglePlacesService>(GooglePlacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return isAvailable true when API key is set', () => {
    expect(service.isAvailable()).toBe(true);
  });

  it('should map Google Place search response correctly', async () => {
    const mockApiResponse = {
      places: [
        {
          id: 'places/ChIJ12345',
          displayName: { text: 'Phở 10 Lý Quốc Sư', languageCode: 'vi' },
          formattedAddress: '10 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
          location: { latitude: 21.0305, longitude: 105.8488 },
          priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
          rating: 4.8,
          userRatingCount: 3500,
          primaryType: 'vietnamese_restaurant',
          photos: [{ name: 'places/ChIJ12345/photos/photo123' }],
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockApiResponse),
    } as any);

    const results = await service.searchPlaces('Pho Ly Quoc Su');

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Phở 10 Lý Quốc Sư');
    expect(results[0].price_range).toBe('$');
    expect(results[0].rating).toBe(4.8);
    expect(results[0].categories[0].slug).toBe('vietnamese');
    expect(results[0].image_url).toContain('places/ChIJ12345/photos/photo123');
  });
});
