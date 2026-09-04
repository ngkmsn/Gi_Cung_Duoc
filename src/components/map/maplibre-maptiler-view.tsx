import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { Config } from '@/constants/Config';
import { Restaurant } from '@/types/restaurant';
import { calculateDistanceKm, DEFAULT_USER_LOCATION, formatDistance } from '@/utils/distance';
import { openMapsNavigation } from '@/utils/navigation';

interface MapLibreMapTilerViewProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant | null) => void;
  onOpenDetail?: (restaurant: Restaurant) => void;
  userLocation?: { latitude: number; longitude: number };
  isRealLocation?: boolean;
  selectedRadiusKm?: number | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  vietnamese: '🍜',
  coffee: '☕',
  western: '🍕',
  japanese: '🍣',
  dessert: '🍨',
};

export function MapLibreMapTilerView({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onOpenDetail,
  userLocation = DEFAULT_USER_LOCATION,
  isRealLocation = false,
  selectedRadiusKm = null,
}: MapLibreMapTilerViewProps) {
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const initialUserLocation = useRef(userLocation).current;

  const htmlContent = useMemo(() => {
    const userLat = initialUserLocation.latitude;
    const userLng = initialUserLocation.longitude;
    const maptilerKey = Config.MAPTILER_API_KEY || '';
    const initialRadius = selectedRadiusKm || 0;

    const restaurantsJson = JSON.stringify(
      restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address || '',
        lat: typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude,
        lng: typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude,
        price: r.price_range || '$',
        icon: CATEGORY_ICONS[r.categories?.[0]?.slug?.toLowerCase() || 'vietnamese'] || '🍽️',
      }))
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>MapLibre MapTiler Detailed Map</title>
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    /* User Location Pulse Marker */
    .user-marker {
      width: 20px;
      height: 20px;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.28);
      cursor: pointer;
      z-index: 100;
    }

    /* CRITICAL: MapLibre Marker root MUST be position absolute */
    .maplibregl-marker {
      position: absolute !important;
      top: 0;
      left: 0;
      will-change: transform;
      pointer-events: auto;
    }

    /* Clean Food Pin: fixed dimensions */
    .pin-container {
      width: 32px;
      height: 38px;
      cursor: pointer;
      user-select: none;
    }

    .pin-container.active {
      z-index: 9999 !important;
    }

    /* Pin Marker Head & Needle (Fixed 32x38px) */
    .pin-marker {
      width: 32px;
      height: 38px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      pointer-events: auto;
    }

    .pin-circle {
      width: 32px;
      height: 32px;
      background: #FFFFFF;
      border: 2.5px solid #FF5A5F;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      box-shadow: 0 3px 8px rgba(15, 23, 42, 0.22);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, border-color 0.2s ease;
      z-index: 2;
    }

    .pin-container:hover .pin-circle {
      transform: scale(1.15);
    }

    .pin-container.active .pin-circle {
      background: #FF5A5F;
      border-color: #FFFFFF;
      transform: scale(1.22);
      box-shadow: 0 5px 16px rgba(255, 90, 95, 0.55);
    }

    .pin-needle {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #FF5A5F;
      margin-top: -1px;
      z-index: 1;
      transition: border-top-color 0.2s ease;
    }

    .pin-container.active .pin-needle {
      border-top-color: #FF5A5F;
    }

    /* Floating Callout Label: positioned above pin head */
    .pin-label {
      position: absolute;
      bottom: 42px;
      left: 50%;
      transform: translateX(-50%);
      width: max-content;
      max-width: 220px;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      color: #FFFFFF;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
      z-index: 10;
    }

    .pin-label::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(15, 23, 42, 0.92);
    }

    .pin-label .price {
      color: #34D399;
      font-size: 10px;
      font-weight: 800;
    }

    /* Show label on hover */
    .pin-container:hover .pin-label {
      opacity: 1;
      pointer-events: auto;
    }

    /* Show label when active/selected */
    .pin-container.active .pin-label {
      opacity: 1;
      pointer-events: auto;
      background: #FF5A5F;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(255, 90, 95, 0.4);
    }

    .pin-container.active .pin-label::after {
      border-top-color: #FF5A5F;
    }

    .pin-container.active .pin-label .price {
      color: #FFFFFF;
    }

    /* Show labels on high zoom level (>= 15.5) */
    .map-zoomed-in .pin-container .pin-label {
      opacity: 0.95;
      pointer-events: auto;
    }

    .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-bottom-left {
      display: none !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    let userLocation = [${userLng}, ${userLat}];
    let restaurants = ${restaurantsJson};
    let activeId = "${selectedRestaurant?.id || ''}";
    let currentRadiusKm = ${initialRadius};
    let markersMap = {};
    let userMarker = null;
    let hasCenteredOnRealGps = false;

    let mapStyle;
    const maptilerKey = "${maptilerKey}".trim();

    if (maptilerKey.length > 0) {
      mapStyle = 'https://api.maptiler.com/maps/streets-v2/style.json?key=' + maptilerKey;
    } else {
      mapStyle = {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    }

    function calculateInitialZoom(radiusKm) {
      if (!radiusKm) return 14.2;
      if (radiusKm <= 1) return 15.0;
      if (radiusKm <= 3) return 13.8;
      if (radiusKm <= 5) return 12.8;
      return 11.8;
    }

    const map = new maplibregl.Map({
      container: 'map',
      style: mapStyle,
      center: userLocation,
      zoom: calculateInitialZoom(currentRadiusKm),
      pitch: 0,
      attributionControl: false
    });

    // Add User Current Location Marker with anchor: 'center'
    const userEl = document.createElement('div');
    userEl.className = 'user-marker';
    userMarker = new maplibregl.Marker({ element: userEl, anchor: 'center' })
      .setLngLat(userLocation)
      .addTo(map);

    function createGeoJSONCircle(center, radiusInKm, points = 64) {
      if (!radiusInKm) return { type: 'FeatureCollection', features: [] };
      const coords = { latitude: center[1], longitude: center[0] };
      const km = radiusInKm;
      const ret = [];
      const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
      const distanceY = km / 110.574;

      for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        ret.push([coords.longitude + x, coords.latitude + y]);
      }
      ret.push(ret[0]);
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [ret]
          }
        }]
      };
    }

    function checkZoomLevel() {
      const z = map.getZoom();
      const mapEl = document.getElementById('map');
      if (mapEl) {
        if (z >= 15.5) {
          mapEl.classList.add('map-zoomed-in');
        } else {
          mapEl.classList.remove('map-zoomed-in');
        }
      }
    }

    map.on('zoom', checkZoomLevel);

    map.on('load', () => {
      checkZoomLevel();

      // Add Radius Circle Source and Layers
      map.addSource('radius-circle-source', {
        type: 'geojson',
        data: createGeoJSONCircle(userLocation, currentRadiusKm)
      });

      map.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle-source',
        paint: {
          'fill-color': '#3B82F6',
          'fill-opacity': 0.08
        }
      });

      map.addLayer({
        id: 'radius-circle-line',
        type: 'line',
        source: 'radius-circle-source',
        paint: {
          'line-color': '#2563EB',
          'line-width': 2,
          'line-dasharray': [3, 2],
          'line-opacity': 0.75
        }
      });

      renderMarkers();

      // Notify parent that map is loaded and ready
      const readyMsg = JSON.stringify({ type: 'MAP_READY' });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(readyMsg);
      } else if (window.parent) {
        window.parent.postMessage(readyMsg, '*');
      }
    });

    function renderMarkers() {
      // Clear old markers
      Object.keys(markersMap).forEach(id => {
        markersMap[id].marker.remove();
      });
      markersMap = {};

      restaurants.forEach(r => {
        if (!r.lat || !r.lng) return;

        const el = document.createElement('div');
        el.className = 'pin-container' + (r.id === activeId ? ' active' : '');
        el.innerHTML =
          '<div class="pin-label">' +
            '<span>' + r.name + '</span>' +
            '<span class="price">• ' + r.price + '</span>' +
          '</div>' +
          '<div class="pin-marker">' +
            '<div class="pin-circle">' +
              '<span>' + r.icon + '</span>' +
            '</div>' +
            '<div class="pin-needle"></div>' +
          '</div>';

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectRestaurant(r.id, true);
        });

        // Use anchor: 'bottom' so needle tip points exactly to [r.lng, r.lat]
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([r.lng, r.lat])
          .addTo(map);

        markersMap[r.id] = { marker, el, lat: r.lat, lng: r.lng };
      });
    }

    map.on('click', () => {
      selectRestaurant(null, false);
    });

    function selectRestaurant(id, shouldFly = true) {
      activeId = id;
      updateActiveMarker();

      if (id && markersMap[id]) {
        const item = markersMap[id];
        if (shouldFly) {
          map.flyTo({
            center: [item.lng, item.lat],
            zoom: 16.5,
            speed: 1.2,
            curve: 1.2,
            essential: true
          });
        }
      }

      const message = JSON.stringify({ type: 'SELECT_RESTAURANT', id: id });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(message);
      } else if (window.parent) {
        window.parent.postMessage(message, '*');
      }
    }

    function updateActiveMarker() {
      Object.keys(markersMap).forEach(id => {
        const item = markersMap[id];
        if (id === activeId) {
          item.el.classList.add('active');
        } else {
          item.el.classList.remove('active');
        }
      });
    }

    // Message listener from React Native
    window.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'SET_SELECTED') {
          activeId = data.id || '';
          updateActiveMarker();
          if (data.id && markersMap[data.id]) {
            const target = markersMap[data.id];
            map.flyTo({
              center: [target.lng, target.lat],
              zoom: 16.5,
              speed: 1.2,
              curve: 1.2,
              essential: true
            });
          }
        } else if (data.type === 'SET_RADIUS') {
          currentRadiusKm = data.radiusKm || 0;
          const source = map.getSource('radius-circle-source');
          if (source) {
            source.setData(createGeoJSONCircle(userLocation, currentRadiusKm));
          }
          if (currentRadiusKm > 0) {
            map.flyTo({ center: userLocation, zoom: calculateInitialZoom(currentRadiusKm), speed: 1.2 });
          }
        } else if (data.type === 'UPDATE_USER_LOCATION') {
          if (data.latitude && data.longitude) {
            userLocation = [data.longitude, data.latitude];
            if (userMarker) {
              userMarker.setLngLat(userLocation);
            }
            const source = map.getSource('radius-circle-source');
            if (source) {
              source.setData(createGeoJSONCircle(userLocation, currentRadiusKm));
            }
            if (data.isRealLocation && !hasCenteredOnRealGps && !activeId) {
              hasCenteredOnRealGps = true;
              map.flyTo({ center: userLocation, zoom: calculateInitialZoom(currentRadiusKm), speed: 1.2 });
            }
          }
        } else if (data.type === 'UPDATE_RESTAURANTS' && Array.isArray(data.restaurants)) {
          restaurants = data.restaurants;
          renderMarkers();
        } else if (data.type === 'RECENTER') {
          map.flyTo({ center: userLocation, zoom: calculateInitialZoom(currentRadiusKm), speed: 1.2 });
        } else if (data.type === 'ZOOM_IN') {
          map.zoomIn();
        } else if (data.type === 'ZOOM_OUT') {
          map.zoomOut();
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
`;
  }, []);

  // Send message helper
  const postToMap = useCallback((payloadObj: any) => {
    const json = typeof payloadObj === 'string' ? payloadObj : JSON.stringify(payloadObj);
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(json, '*');
    } else {
      webViewRef.current?.postMessage(json);
    }
  }, []);

  // Handle messages from Web / WebView
  const handleMessage = useCallback(
    (event: any) => {
      try {
        const rawData =
          typeof event.nativeEvent?.data === 'string'
            ? event.nativeEvent.data
            : typeof event.data === 'string'
            ? event.data
            : event.data;

        const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        if (!data) return;

        if (data.type === 'SELECT_RESTAURANT') {
          if (!data.id) {
            onSelectRestaurant(null);
            return;
          }
          const target = restaurants.find((r) => r.id === data.id);
          onSelectRestaurant(target || null);
        } else if (data.type === 'MAP_READY') {
          // Map is loaded and ready: immediately push current location, restaurants, radius & selected
          postToMap({
            type: 'UPDATE_USER_LOCATION',
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            isRealLocation: Boolean(isRealLocation),
          });
          postToMap({
            type: 'UPDATE_RESTAURANTS',
            restaurants: restaurants.map((r) => ({
              id: r.id,
              name: r.name,
              address: r.address || '',
              lat: typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude,
              lng: typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude,
              price: r.price_range || '$',
              icon: CATEGORY_ICONS[r.categories?.[0]?.slug?.toLowerCase() || 'vietnamese'] || '🍽️',
            })),
          });
          postToMap({
            type: 'SET_RADIUS',
            radiusKm: selectedRadiusKm || 0,
          });
          if (selectedRestaurant?.id) {
            postToMap({
              type: 'SET_SELECTED',
              id: selectedRestaurant.id,
            });
          }
        }
      } catch (err) {}
    },
    [
      isRealLocation,
      onSelectRestaurant,
      postToMap,
      restaurants,
      selectedRadiusKm,
      selectedRestaurant?.id,
      userLocation.latitude,
      userLocation.longitude,
    ]
  );

  // Web Message listener bridge
  useEffect(() => {
    if (Platform.OS === 'web') {
      const onWebMessage = (event: MessageEvent) => {
        handleMessage(event);
      };
      window.addEventListener('message', onWebMessage);
      return () => {
        window.removeEventListener('message', onWebMessage);
      };
    }
  }, [handleMessage]);

  // Sync selected restaurant
  useEffect(() => {
    postToMap({
      type: 'SET_SELECTED',
      id: selectedRestaurant?.id || null,
    });
  }, [postToMap, selectedRestaurant?.id]);

  // Sync user location changes smoothly without reloading the map
  useEffect(() => {
    postToMap({
      type: 'UPDATE_USER_LOCATION',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      isRealLocation: Boolean(isRealLocation),
    });
  }, [isRealLocation, postToMap, userLocation.latitude, userLocation.longitude]);

  // Sync radius circle changes
  useEffect(() => {
    postToMap({
      type: 'SET_RADIUS',
      radiusKm: selectedRadiusKm || 0,
    });
  }, [postToMap, selectedRadiusKm]);

  // Sync restaurant list changes
  useEffect(() => {
    postToMap({
      type: 'UPDATE_RESTAURANTS',
      restaurants: restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address || '',
        lat: typeof r.latitude === 'string' ? parseFloat(r.latitude) : r.latitude,
        lng: typeof r.longitude === 'string' ? parseFloat(r.longitude) : r.longitude,
        price: r.price_range || '$',
        icon: CATEGORY_ICONS[r.categories?.[0]?.slug?.toLowerCase() || 'vietnamese'] || '🍽️',
      })),
    });
  }, [postToMap, restaurants]);

  const handleZoomIn = () => {
    postToMap({ type: 'ZOOM_IN' });
  };

  const handleZoomOut = () => {
    postToMap({ type: 'ZOOM_OUT' });
  };

  const handleRecenter = () => {
    postToMap({ type: 'RECENTER' });
  };

  const handleDirections = (restaurant: Restaurant) => {
    openMapsNavigation({
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      name: restaurant.name,
      address: restaurant.address,
    });
  };

  return (
    <View style={styles.container}>
      {/* Map Renderer: iframe on Web, WebView on Mobile */}
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={styles.webMapFrame as any}
          title="MapLibre MapTiler Detailed Map"
          onLoad={() => {
            postToMap({
              type: 'UPDATE_USER_LOCATION',
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              isRealLocation: Boolean(isRealLocation),
            });
          }}
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.mobileWebView}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={false}
          scrollEnabled={false}
        />
      )}

      {/* Floating Controls (Zoom & Recenter) */}
      <View style={styles.mapControlsColumn}>
        <Pressable
          onPress={handleZoomIn}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}>
          <ThemedText style={styles.controlBtnText}>+</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleZoomOut}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}>
          <ThemedText style={styles.controlBtnText}>−</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleRecenter}
          style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}>
          <ThemedText style={styles.controlIconText}>🎯</ThemedText>
        </Pressable>
      </View>

      {/* Selected Restaurant Floating Quick Preview Card with "Chỉ đường" Button */}
      {selectedRestaurant && (
        <View style={styles.floatingPreviewCard}>
          <Pressable
            onPress={() => onOpenDetail && onOpenDetail(selectedRestaurant)}
            style={styles.previewCardInner}>
            <View style={styles.previewInfoCol}>
              <View style={styles.previewHeaderRow}>
                <ThemedText numberOfLines={1} style={styles.previewName}>
                  {selectedRestaurant.name}
                </ThemedText>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onSelectRestaurant(null);
                  }}
                  style={styles.previewCloseBtn}>
                  <ThemedText style={styles.previewCloseText}>✕</ThemedText>
                </Pressable>
              </View>

              <View style={styles.previewRatingRow}>
                <ThemedText style={styles.previewStar}>★</ThemedText>
                <ThemedText style={styles.previewRatingVal}>
                  {selectedRestaurant.rating ? selectedRestaurant.rating.toFixed(1) : '4.8'}
                </ThemedText>
                {selectedRestaurant.price_range && (
                  <ThemedText style={styles.previewPriceVal}>• {selectedRestaurant.price_range}</ThemedText>
                )}
                {selectedRestaurant.address && (
                  <ThemedText numberOfLines={1} style={styles.previewAddressText}>
                    • {selectedRestaurant.address.split(',')[0]}
                  </ThemedText>
                )}
              </View>

              <View style={styles.previewFooterRow}>
                <ThemedText style={styles.previewDistanceText}>
                  🛵 Cách bạn{' '}
                  {formatDistance(
                    calculateDistanceKm(
                      userLocation.latitude,
                      userLocation.longitude,
                      typeof selectedRestaurant.latitude === 'string'
                        ? parseFloat(selectedRestaurant.latitude)
                        : selectedRestaurant.latitude,
                      typeof selectedRestaurant.longitude === 'string'
                        ? parseFloat(selectedRestaurant.longitude)
                        : selectedRestaurant.longitude
                    )
                  )}
                </ThemedText>

                <View style={styles.previewActionsRow}>
                  <Pressable
                    onPress={() => onOpenDetail && onOpenDetail(selectedRestaurant)}
                    style={({ pressed }) => [
                      styles.previewDetailBtn,
                      pressed && styles.previewDirectionsBtnPressed,
                    ]}>
                    <ThemedText style={styles.previewDetailText}>Chi tiết ➔</ThemedText>
                  </Pressable>

                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDirections(selectedRestaurant);
                    }}
                    style={({ pressed }) => [
                      styles.previewDirectionsBtn,
                      pressed && styles.previewDirectionsBtnPressed,
                    ]}>
                    <ThemedText style={styles.previewDirectionsText}>🧭 Chỉ đường</ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F9',
    position: 'relative',
  },
  webMapFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: '#F3F6F9',
  },
  mobileWebView: {
    flex: 1,
    backgroundColor: '#F3F6F9',
  },
  mapControlsColumn: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'web' ? 140 : 160,
    gap: 8,
    zIndex: 30,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlBtnPressed: {
    backgroundColor: '#F8FAFC',
  },
  controlBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
  },
  controlIconText: {
    fontSize: 15,
  },
  floatingPreviewCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    zIndex: 38,
    overflow: 'hidden',
  },
  previewCardInner: {
    padding: 12,
  },
  previewInfoCol: {
    gap: 6,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  previewName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 6,
  },
  previewCloseBtn: {
    padding: 2,
  },
  previewCloseText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  previewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewStar: {
    color: '#F59E0B',
    fontSize: 13,
  },
  previewRatingVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewPriceVal: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  previewAddressText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  previewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewDistanceText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  previewActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewDetailBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  previewDetailText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  previewDirectionsBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  previewDirectionsBtnPressed: {
    opacity: 0.85,
  },
  previewDirectionsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
