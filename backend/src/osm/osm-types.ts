export interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface NormalizedRestaurantCategory {
  name: string;
  slug: string;
}

export interface DayHours {
  open: string;
  close: string;
}

export type WeekOpeningHours = Record<string, DayHours>;

export interface NormalizedOSMRestaurant {
  osm_id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  price_range: string | null;
  opening_hours: WeekOpeningHours | null;
  facilities: string[];
  categories: NormalizedRestaurantCategory[];
}
