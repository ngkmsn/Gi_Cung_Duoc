import { Logger } from '@nestjs/common';
import { OSMElement } from './osm-types.js';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export interface FetchOSMOptions {
  timeoutSeconds?: number;
  maxRetries?: number;
  customBbox?: {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
  };
}

const DEFAULT_HANOI_BBOX = {
  minLat: 20.95,
  minLon: 105.70,
  maxLat: 21.12,
  maxLon: 105.95,
};

/**
 * Builds the Overpass QL query string for Hanoi food amenities and shops.
 */
export function buildOverpassQuery(
  bbox = DEFAULT_HANOI_BBOX,
  timeoutSeconds = 60,
): string {
  const { minLat, minLon, maxLat, maxLon } = bbox;
  const bboxStr = `${minLat},${minLon},${maxLat},${maxLon}`;

  return `
[out:json][timeout:${timeoutSeconds}];
(
  node["amenity"~"restaurant|cafe|fast_food|ice_cream|bar|pub|food_court"]["name"](${bboxStr});
  way["amenity"~"restaurant|cafe|fast_food|ice_cream|bar|pub|food_court"]["name"](${bboxStr});
  node["shop"~"bakery|pastry"]["name"](${bboxStr});
  way["shop"~"bakery|pastry"]["name"](${bboxStr});
);
out center body;
`.trim();
}

/**
 * Fetches food-related places in Hanoi from OpenStreetMap via Overpass API.
 * Includes automatic failover between mirror endpoints, configurable timeout, and exponential backoff.
 */
export async function fetchOSMHanoiPlaces(
  options?: FetchOSMOptions,
  logger = new Logger('OSMFetcher'),
): Promise<OSMElement[]> {
  const timeoutSec = options?.timeoutSeconds ?? 60;
  const maxRetries = options?.maxRetries ?? 3;
  const query = buildOverpassQuery(options?.customBbox ?? DEFAULT_HANOI_BBOX, timeoutSec);

  logger.log(`Querying OpenStreetMap Overpass API for Hanoi food places (timeout: ${timeoutSec}s)...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      logger.log(`Attempt ${attempt}/${maxRetries} connecting to Overpass endpoint: ${endpoint}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), (timeoutSec + 10) * 1000);

        const url = `${endpoint}?data=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'GiCungDuocApp/1.0 (contact@gicungduoc.app)',
            Accept: 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          logger.warn(`Overpass endpoint ${endpoint} returned HTTP status ${response.status}`);
          continue;
        }

        const text = await response.text();
        if (!text.startsWith('{')) {
          logger.warn(`Overpass endpoint ${endpoint} returned non-JSON response payload: ${text.slice(0, 150)}`);
          continue;
        }

        const data = JSON.parse(text);
        const elements: OSMElement[] = data.elements || [];

        logger.log(`Successfully received ${elements.length} raw elements from OpenStreetMap (${endpoint})`);
        return elements;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          logger.warn(`Request to ${endpoint} timed out after ${timeoutSec}s`);
        } else {
          logger.warn(`Failed to fetch from ${endpoint}: ${error.message}`);
        }
      }
    }

    if (attempt < maxRetries) {
      const delayMs = attempt * 2000;
      logger.log(`Retrying in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('All OpenStreetMap Overpass endpoints failed or timed out. Please verify internet connection.');
}
