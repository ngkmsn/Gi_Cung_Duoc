import { Config } from '@/constants/Config';
import { Restaurant } from '@/types/restaurant';

export interface SearchLocationParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // In km or meters
  min_budget?: number; // In VNĐ
  max_budget?: number; // In VNĐ
  price_range?: string;
  category?: string;
  open_now?: boolean;
  limit?: number;
}

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Searches and retrieves restaurants from the NestJS backend API.
 * The backend handles all Overpass/PostgreSQL querying, hard filtering, and multi-factor ranking.
 */
export async function searchRestaurants(
  query: string = '',
  location?: SearchLocationParams,
): Promise<Restaurant[]> {
  const trimmedQuery = query.trim();

  const baseUrl = Config.API_URL.replace(/\/+$/, '');
  const endpoint = baseUrl.endsWith('/api')
    ? `${baseUrl}/restaurants/search`
    : `${baseUrl}/api/restaurants/search`;

  const searchParams = new URLSearchParams();
  if (trimmedQuery) searchParams.append('query', trimmedQuery);
  if (location?.latitude !== undefined) searchParams.append('latitude', location.latitude.toString());
  if (location?.longitude !== undefined) searchParams.append('longitude', location.longitude.toString());
  if (location?.radius !== undefined) {
    const radiusMeters = location.radius > 50 ? location.radius : location.radius * 1000;
    searchParams.append('radius', radiusMeters.toString());
  }
  if (location?.min_budget !== undefined) {
    searchParams.append('min_budget', location.min_budget.toString());
  }
  if (location?.max_budget !== undefined) {
    searchParams.append('max_budget', location.max_budget.toString());
  }
  if (location?.price_range) {
    searchParams.append('price_range', location.price_range);
  }
  if (location?.category) {
    searchParams.append('category', location.category);
  }
  if (location?.open_now) {
    searchParams.append('open_now', 'true');
  }
  if (location?.limit !== undefined) {
    searchParams.append('limit', location.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(Config.API_KEY ? { 'x-api-key': Config.API_KEY } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Server returned status: ${response.status}`);
  }

  const data: Restaurant[] = await response.json();
  return data;
}
