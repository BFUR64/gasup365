import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { MapPin, PIN_CSS, USER_MARKER_HTML } from '../services/pinHtml';
import { colors, palette } from '../theme/colors';
import { pixel } from '../theme/pixel';
import { type } from '../theme/tokens';
import { art } from '../ui/pixelArt';
import { Sprite } from './ui/PixelIcon';

export interface LiveMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  recenter: (center: [number, number]) => void;
}

interface LiveMapProps {
  pins: MapPin[];
  initialCenter: [number, number];
  zoom: number;
  userLocation: [number, number] | null;
  followUser: boolean;
  onPinPress: (pinId: string) => void;
  onMapPress: () => void;
  onError: () => void;
  ref?: React.Ref<LiveMapHandle>;
}

type MapCommand =
  | { type: 'pins'; pins: MapPin[] }
  | { type: 'user'; center: [number, number]; html: string }
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'recenter'; center: [number, number] }
  | { type: 'resize' }
  | { type: 'destroy' };

type MapEvent = { type: 'ready' } | { type: 'error' } | { type: 'map_press' } | { type: 'pin_press'; id: string };

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const PIN_STYLE_ID = 'gasup365-pin-css';

// One map controller for both platforms: run inside the WebView on phones and
// through `new Function` on web. Pins arrive as pre-escaped HTML (pinHtml.ts),
// so nothing here concatenates user data into markup.
const MAP_CONTROLLER_JS = `
var map = L.map(el, { zoomControl: false, attributionControl: false }).setView(init.center, init.zoom);
L.tileLayer(init.tileUrl, { maxZoom: 19 }).addTo(map);
var pinLayer = L.layerGroup().addTo(map);
var userMarker = null;
map.on('click', function () { post({ type: 'map_press' }); });
function setPins(pins) {
  pinLayer.clearLayers();
  pins.forEach(function (pin) {
    var icon = L.divIcon({ className: 'gu-pin', html: pin.html, iconSize: pin.size, iconAnchor: pin.anchor });
    L.marker([pin.lat, pin.lng], { icon: icon, title: pin.title, keyboard: true, zIndexOffset: pin.zIndexOffset })
      .addTo(pinLayer)
      .on('click', function () { post({ type: 'pin_press', id: pin.id }); });
  });
}
function setUser(center, html) {
  if (userMarker) { userMarker.setLatLng(center); return; }
  var icon = L.divIcon({ className: 'gu-pin', html: html, iconSize: [30, 30], iconAnchor: [15, 15] });
  userMarker = L.marker(center, { icon: icon, title: 'Your location', interactive: false }).addTo(map);
}
function handle(command) {
  if (command.type === 'pins') setPins(command.pins);
  else if (command.type === 'user') setUser(command.center, command.html);
  else if (command.type === 'zoomIn') map.zoomIn();
  else if (command.type === 'zoomOut') map.zoomOut();
  else if (command.type === 'recenter') map.setView(command.center, Math.max(map.getZoom(), 14));
  else if (command.type === 'resize') map.invalidateSize();
  else if (command.type === 'destroy') map.remove();
}
return { handle: handle };
`;

type MapController = { handle: (command: MapCommand) => void };

const buildMobileHtml = (init: object) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="${LEAFLET_CSS_URL}" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@700&display=swap" />
    <script src="${LEAFLET_JS_URL}"></script>
    <style>html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }${PIN_CSS}</style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      function post(message) { window.ReactNativeWebView.postMessage(JSON.stringify(message)); }
      try {
        var api = (function (L, el, init, post) {${MAP_CONTROLLER_JS}})(L, document.getElementById('map'), ${JSON.stringify(init)}, post);
        var onMessage = function (event) { try { api.handle(JSON.parse(event.data)); } catch (error) {} };
        document.addEventListener('message', onMessage);
        window.addEventListener('message', onMessage);
        post({ type: 'ready' });
      } catch (error) {
        post({ type: 'error' });
      }
    </script>
  </body>
</html>`;

const ensureWebStyles = () => {
  if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS_URL;
    document.head.appendChild(link);
  }
  if (!document.getElementById(PIN_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = PIN_STYLE_ID;
    style.textContent = PIN_CSS;
    document.head.appendChild(style);
  }
};

export const LiveMap = ({ pins, initialCenter, zoom, userLocation, followUser, onPinPress, onMapPress, onError, ref }: LiveMapProps) => {
  const webViewRef = useRef<WebView>(null);
  const webContainerRef = useRef<HTMLElement | null>(null);
  const webControllerRef = useRef<MapController | null>(null);
  const callbacksRef = useRef({ onPinPress, onMapPress, onError });
  const centeredOnUserRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [init] = useState(() => ({ center: initialCenter, zoom, tileUrl: OSM_TILE_URL }));

  useEffect(() => {
    callbacksRef.current = { onPinPress, onMapPress, onError };
  });

  const send = useCallback((command: MapCommand) => {
    if (Platform.OS === 'web') webControllerRef.current?.handle(command);
    else webViewRef.current?.postMessage(JSON.stringify(command));
  }, []);

  const handleEvent = useCallback((event: MapEvent) => {
    if (event.type === 'ready') setReady(true);
    if (event.type === 'error') {
      setFailed(true);
      callbacksRef.current.onError();
    }
    if (event.type === 'map_press') callbacksRef.current.onMapPress();
    if (event.type === 'pin_press') callbacksRef.current.onPinPress(event.id);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => send({ type: 'zoomIn' }),
      zoomOut: () => send({ type: 'zoomOut' }),
      recenter: (center) => send({ type: 'recenter', center }),
    }),
    [send],
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let cancelled = false;

    const initWebMap = async () => {
      try {
        ensureWebStyles();
        const leaflet = await import('leaflet');
        if (cancelled || !webContainerRef.current || webControllerRef.current) return;
        const createController = new Function('L', 'el', 'init', 'post', MAP_CONTROLLER_JS);
        webControllerRef.current = createController(leaflet, webContainerRef.current, init, handleEvent) as MapController;
        handleEvent({ type: 'ready' });
        setTimeout(() => webControllerRef.current?.handle({ type: 'resize' }), 60);
      } catch {
        handleEvent({ type: 'error' });
      }
    };

    initWebMap();
    return () => {
      cancelled = true;
      webControllerRef.current?.handle({ type: 'destroy' });
      webControllerRef.current = null;
    };
  }, [handleEvent, init]);

  useEffect(() => {
    if (ready) send({ type: 'pins', pins });
  }, [pins, ready, send]);

  useEffect(() => {
    if (!ready || !userLocation) return;
    send({ type: 'user', center: userLocation, html: USER_MARKER_HTML });
    if (followUser && !centeredOnUserRef.current) {
      centeredOnUserRef.current = true;
      send({ type: 'recenter', center: userLocation });
    }
  }, [followUser, ready, send, userLocation]);

  const mobileHtml = useMemo(() => buildMobileHtml(init), [init]);

  const handleMobileMessage = (event: WebViewMessageEvent) => {
    try {
      handleEvent(JSON.parse(event.nativeEvent.data) as MapEvent);
    } catch {
      handleEvent({ type: 'error' });
    }
  };

  return (
    <View style={styles.container} accessibilityLabel="Map of Kalibo">
      {Platform.OS === 'web' ? (
        React.createElement('div', {
          ref: webContainerRef,
          style: { position: 'absolute', inset: 0 },
        })
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mobileHtml }}
          style={styles.webView}
          onError={() => handleEvent({ type: 'error' })}
          onMessage={handleMobileMessage}
        />
      )}

      {!ready && !failed ? (
        <View style={styles.overlay}>
          <View style={[pixel.panel, styles.loader]}>
            <Sprite art={art.jeepney} width={96} height={45} />
            <Text style={[type.displaySm, styles.loaderText]}>Loading map…</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.mapGround },
  webView: { flex: 1, backgroundColor: palette.mapGround },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.mapGround,
  },
  loader: { alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 16 },
  loaderText: { color: colors.text },
});
