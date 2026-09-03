export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DayOpeningHours {
  open: string;
  close: string;
}

export interface OpeningHours {
  monday?: DayOpeningHours;
  tuesday?: DayOpeningHours;
  wednesday?: DayOpeningHours;
  thursday?: DayOpeningHours;
  friday?: DayOpeningHours;
  saturday?: DayOpeningHours;
  sunday?: DayOpeningHours;
  [key: string]: DayOpeningHours | undefined;
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string | null;
  latitude: number | string;
  longitude: number | string;
  price_range?: string | null;
  image_url?: string | null;
  rating?: number;
  review_count?: number;
  time_estimate?: string;
  badge?: string | null;
  specialty_dish?: string | null;
  opening_hours?: OpeningHours | null;
  facilities?: string[];
  categories?: Category[];
  created_at?: string;
  updated_at?: string;
}
