import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import type * as Leaflet from 'leaflet';
import { colors } from '../theme/colors';

export interface LiveMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
}

interface LiveMapProps {
  markers: LiveMapMarker[];
  center: [number, number];
  zoom: number;
  onMarkerPress?: (markerId: string) => void;
}

const KALIBO_CENTER: [number, number] = [11.7089, 122.364];
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MARKER_ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const MARKER_ICON_2X_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const MARKER_SHADOW_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

type LocationStatus = 'checking' | 'granted' | 'denied';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const ensureWebLeafletCss = () => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS_URL;
  document.head.appendChild(link);
};

export const LiveMap: React.FC<LiveMapProps> = ({ markers, center, zoom, onMarkerPress }) => {
  const webViewRef = useRef<WebView>(null);
  const webMapRef = useRef<Leaflet.Map | null>(null);
  const webMarkerLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const webUserMarkerRef = useRef<Leaflet.Marker | null>(null);
  const webContainerRef = useRef<HTMLElement | null>(null);
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('checking');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const effectiveCenter = userLocation ?? (locationStatus === 'denied' ? KALIBO_CENTER : center);

  useEffect(() => {
    let mounted = true;

    const loadLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!mounted) return;

        if (permission.status !== 'granted') {
          setLocationStatus('denied');
          setUserLocation(null);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!mounted) return;

        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationStatus('granted');
      } catch {
        if (!mounted) return;
        setLocationStatus('denied');
        setUserLocation(null);
      }
    };

    loadLocation();

    return () => {
      mounted = false;
    };
  }, []);

  const mobileHtml = useMemo(
    () => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
      body { background: #fff7ed; }
      .user-dot {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #2563eb;
        border: 3px solid #ffffff;
        box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.18);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map;
      var markerLayer;
      var userMarker;
      var markerIcon = L.icon({
        iconUrl: '${MARKER_ICON_URL}',
        iconRetinaUrl: '${MARKER_ICON_2X_URL}',
        shadowUrl: '${MARKER_SHADOW_URL}',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      var userIcon = L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });

      function sendError(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: message }));
      }

      function addMarkers(markers) {
        markerLayer.clearLayers();
        markers.forEach(function(marker) {
          var popup = '<strong>' + marker.title + '</strong>' + (marker.description ? '<br />' + marker.description : '');
          L.marker([marker.lat, marker.lng], { icon: markerIcon })
            .addTo(markerLayer)
            .bindPopup(popup)
            .on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker_press', markerId: marker.id }));
            });
        });
      }

      function setUserLocation(userLocation) {
        if (!userLocation) return;
        if (userMarker) {
          userMarker.setLatLng(userLocation);
        } else {
          userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('Your location');
        }
      }

      function updateMap(payload) {
        if (!map || !payload) return;
        map.setView(payload.center, payload.zoom || map.getZoom());
        addMarkers(payload.markers || []);
        setUserLocation(payload.userLocation);
        setTimeout(function() { map.invalidateSize(); }, 60);
      }

      function handleMessage(event) {
        try {
          updateMap(JSON.parse(event.data));
        } catch (error) {
          sendError('Unable to update map');
        }
      }

      try {
        map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${center[0]}, ${center[1]}], ${zoom});
        L.tileLayer('${OSM_TILE_URL}', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        markerLayer = L.layerGroup().addTo(map);
        document.addEventListener('message', handleMessage);
        window.addEventListener('message', handleMessage);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
      } catch (error) {
        sendError('Unable to load map');
      }
    </script>
  </body>
</html>`,
    [center, zoom],
  );

  const sendMobileUpdate = useCallback(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        center: effectiveCenter,
        markers,
        userLocation,
        zoom,
      }),
    );
  }, [effectiveCenter, markers, userLocation, zoom]);

  useEffect(() => {
    if (Platform.OS !== 'web' && mapReady) {
      sendMobileUpdate();
    }
  }, [mapReady, sendMobileUpdate]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let cancelled = false;

    const initWebMap = async () => {
      try {
        ensureWebLeafletCss();
        const leaflet = await import('leaflet');
        if (cancelled || !webContainerRef.current || webMapRef.current) return;

        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: MARKER_ICON_2X_URL,
          iconUrl: MARKER_ICON_URL,
          shadowUrl: MARKER_SHADOW_URL,
        });

        const map = leaflet.map(webContainerRef.current).setView(initialCenterRef.current, initialZoomRef.current);
        leaflet
          .tileLayer(OSM_TILE_URL, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          })
          .addTo(map);

        webMarkerLayerRef.current = leaflet.layerGroup().addTo(map);
        webMapRef.current = map;
        setMapReady(true);
      } catch {
        setMapError('Unable to load map');
      }
    };

    initWebMap();

    return () => {
      cancelled = true;
      webMapRef.current?.remove();
      webMapRef.current = null;
      webMarkerLayerRef.current = null;
      webUserMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !webMapRef.current || !webMarkerLayerRef.current) return;

    const updateWebMarkers = async () => {
      const leaflet = await import('leaflet');

      webMapRef.current?.setView(effectiveCenter, zoom);
      webMarkerLayerRef.current?.clearLayers();

      markers.forEach((marker) => {
        const popup = `<strong>${escapeHtml(marker.title)}</strong>${
          marker.description ? `<br />${escapeHtml(marker.description)}` : ''
        }`;
        leaflet
          .marker([marker.lat, marker.lng])
          .addTo(webMarkerLayerRef.current!)
          .bindPopup(popup)
          .on('click', () => onMarkerPress?.(marker.id));
      });

      if (userLocation) {
        const userIcon = leaflet.divIcon({
          className: '',
          html: '<div style="width:18px;height:18px;border-radius:999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 8px rgba(37,99,235,.18);"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        if (webUserMarkerRef.current) {
          webUserMarkerRef.current.setLatLng(userLocation);
        } else {
          webUserMarkerRef.current = leaflet
            .marker(userLocation, { icon: userIcon })
            .addTo(webMapRef.current!)
            .bindPopup('Your location');
        }
      }

      setTimeout(() => webMapRef.current?.invalidateSize(), 60);
    };

    updateWebMarkers().catch(() => setMapError('Unable to load map'));
  }, [effectiveCenter, markers, onMarkerPress, userLocation, zoom]);

  const handleMobileMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        markerId?: string;
        message?: string;
      };

      if (message.type === 'ready') {
        setMapReady(true);
        setMapError(null);
      }

      if (message.type === 'marker_press' && message.markerId) {
        onMarkerPress?.(message.markerId);
      }

      if (message.type === 'error') {
        setMapError(message.message || 'Unable to load map');
      }
    } catch {
      setMapError('Unable to load map');
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        React.createElement('div', {
          ref: webContainerRef,
          id: 'map',
          style: { width: '100%', height: '100vh', flex: 1 },
        })
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mobileHtml }}
          style={styles.webView}
          onLoadEnd={sendMobileUpdate}
          onError={() => setMapError('Unable to load map')}
          onMessage={handleMobileMessage}
          injectedJavaScript="window.__gasup365MapReady = true; true;"
        />
      )}

      {!mapReady && !mapError ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.overlayText}>Loading live map...</Text>
        </View>
      ) : null}

      {locationStatus === 'denied' ? (
        <View style={styles.topNotice}>
          <Text style={styles.noticeText} selectable>
            Location permission denied
          </Text>
        </View>
      ) : null}

      {mapError ? (
        <View style={styles.overlay}>
          <Text style={styles.errorText} selectable>
            {mapError}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 253, 249, 0.86)',
  },
  overlayText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  topNotice: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: colors.destructive,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});
