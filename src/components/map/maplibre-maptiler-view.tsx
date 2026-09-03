import React, { useEffect, useMemo, useRef } from 'react';
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
}: MapLibreMapTilerViewProps) {
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = useMemo(() => {
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;
    const maptilerKey = Config.MAPTILER_API_KEY || '';

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
      width: 22px;
      height: 22px;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 0 7px rgba(37, 99, 235, 0.28);
      cursor: pointer;
      z-index: 100 !important;
    }

    /* Food Restaurant Marker Pill */
    .food-marker {
      display: flex;
      align-items: center;
      gap: 5px;
      background: #FFFFFF;
      color: #0F172A;
      padding: 6px 10px;
      border-radius: 18px;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.22);
      border: 1.5px solid #E2E8F0;
      white-space: nowrap;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, color 0.2s ease;
      transform: translate(-50%, -100%);
    }

    .food-marker:hover {
      transform: translate(-50%, -105%) scale(1.08);
    }

    .food-marker.active {
      background: #FF5A5F;
      color: #FFFFFF;
      border-color: #FFFFFF;
      box-shadow: 0 6px 16px rgba(255, 90, 95, 0.45);
      z-index: 999 !important;
      transform: translate(-50%, -108%) scale(1.15);
    }

    .food-marker .price {
      color: #059669;
      font-size: 10px;
      font-weight: 800;
    }

    .food-marker.active .price {
      color: #FFFFFF;
    }

    .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-bottom-left {
      display: none !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    const userLocation = [${userLng}, ${userLat}];
    const restaurants = ${restaurantsJson};
    let activeId = "${selectedRestaurant?.id || ''}";
    const markersMap = {};

    // Ultra-detailed map style with full street names, building footprints, house numbers, rivers & landmarks
    let mapStyle;
    const maptilerKey = "${maptilerKey}".trim();

    if (maptilerKey.length > 0) {
      mapStyle = 'https://api.maptiler.com/maps/streets-v2/style.json?key=' + maptilerKey;
    } else {
      // High-resolution Retina detailed street tile layer (CartoDB Voyager + OSM)
      mapStyle = {
        version: 8,
        sources: {
          'detailed-streets': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '© CARTO, © OpenStreetMap contributors',
            maxzoom: 20
          }
        },
        layers: [
          {
            id: 'detailed-streets-layer',
            type: 'raster',
            source: 'detailed-streets',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      };
    }

    const map = new maplibregl.Map({
      container: 'map',
      style: mapStyle,
      center: userLocation,
      zoom: 14.2,
      pitch: 0,
      attributionControl: false
    });

    // Add User Current Location Marker
    const userEl = document.createElement('div');
    userEl.className = 'user-marker';
    new maplibregl.Marker({ element: userEl })
      .setLngLat(userLocation)
      .addTo(map);

    // Add Restaurant Markers
    restaurants.forEach(r => {
      if (!r.lat || !r.lng) return;

      const el = document.createElement('div');
      el.className = 'food-marker' + (r.id === activeId ? ' active' : '');
      el.innerHTML = '<span>' + r.icon + '</span><span>' + r.name + '</span><span class="price">• ' + r.price + '</span>';

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        sendSelection(r.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([r.lng, r.lat])
        .addTo(map);

      markersMap[r.id] = { marker, el, lat: r.lat, lng: r.lng };
    });

    map.on('click', () => {
      sendSelection(null);
    });

    function sendSelection(id) {
      activeId = id;
      updateActiveMarker();

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
        if (data.type === 'SET_SELECTED' && data.id) {
          activeId = data.id;
          updateActiveMarker();
          const target = markersMap[data.id];
          if (target) {
            map.flyTo({ center: [target.lng, target.lat], zoom: 16, speed: 1.2 });
          }
        } else if (data.type === 'RECENTER') {
          map.flyTo({ center: userLocation, zoom: 14.5, speed: 1.2 });
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
  }, [restaurants, selectedRestaurant?.id, userLocation]);

  // Handle messages from Web / WebView
  const handleMessage = (event: any) => {
    try {
      const data =
        typeof event.nativeEvent?.data === 'string'
          ? JSON.parse(event.nativeEvent.data)
          : event.data;

      if (data.type === 'SELECT_RESTAURANT') {
        if (!data.id) {
          onSelectRestaurant(null);
          return;
        }
        const target = restaurants.find((r) => r.id === data.id);
        onSelectRestaurant(target || null);
      }
    } catch (err) {}
  };

  // Sync selection to Web / WebView
  useEffect(() => {
    const payload = JSON.stringify({
      type: 'SET_SELECTED',
      id: selectedRestaurant?.id || null,
    });

    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(payload, '*');
    } else {
      webViewRef.current?.postMessage(payload);
    }
  }, [selectedRestaurant?.id]);

  const handleZoomIn = () => {
    const payload = JSON.stringify({ type: 'ZOOM_IN' });
    if (Platform.OS === 'web') iframeRef.current?.contentWindow?.postMessage(payload, '*');
    else webViewRef.current?.postMessage(payload);
  };

  const handleZoomOut = () => {
    const payload = JSON.stringify({ type: 'ZOOM_OUT' });
    if (Platform.OS === 'web') iframeRef.current?.contentWindow?.postMessage(payload, '*');
    else webViewRef.current?.postMessage(payload);
  };

  const handleRecenter = () => {
    const payload = JSON.stringify({ type: 'RECENTER' });
    if (Platform.OS === 'web') iframeRef.current?.contentWindow?.postMessage(payload, '*');
    else webViewRef.current?.postMessage(payload);
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
    top: Platform.OS === 'web' ? 110 : 130,
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
