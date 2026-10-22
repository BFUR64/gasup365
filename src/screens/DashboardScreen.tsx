import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveMap, LiveMapHandle } from '../components/LiveMap';
import { StationListPanel } from '../components/StationListPanel';
import { NavigateButton, StationDetails, StationSheet } from '../components/StationSheet';
import { FuelHotbar } from '../components/ui/FuelHotbar';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelIcon, Sprite } from '../components/ui/PixelIcon';
import { TitleBar } from '../components/ui/TitleBar';
import { kaliboCenter, stations } from '../data/mockStations';
import { useIsWide } from '../hooks/useLayout';
import { useMapMarkers } from '../hooks/useMapMarkers';
import { useUserLocation } from '../hooks/useUserLocation';
import { scoreStationsForRoute } from '../services/fuelRouting';
import { buildPin } from '../services/pinHtml';
import {
  StationSort,
  formatPeso,
  smartRouteBanner,
  sortSubtitle,
} from '../services/stationPresentation';
import { fromMarker, fromScore, sampleStationId } from '../services/stationView';
import { colors, palette } from '../theme/colors';
import { FUEL_TYPES, fuelMeta, pixel } from '../theme/pixel';
import { shadow, type } from '../theme/tokens';
import { FuelType } from '../types';
import { art } from '../ui/pixelArt';

const KALIBO_CENTER: [number, number] = [kaliboCenter.latitude, kaliboCenter.longitude];
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const stationsLatitude = average(stations.map((station) => station.coordinates.latitude));
const stationsLongitude = average(stations.map((station) => station.coordinates.longitude));
// Frame the sample stations in the part of the map the HUD and sheet leave open
// (phones: a little north; wide screens: east of the detail panel).
const PHONE_CENTER: [number, number] = [stationsLatitude + 0.0015, stationsLongitude];
const WIDE_CENTER: [number, number] = [stationsLatitude, stationsLongitude + 0.004];
// The sample stations are in Kalibo; only follow the user when they are nearby.
const isNearKalibo = ([latitude, longitude]: [number, number]) =>
  Math.abs(latitude - kaliboCenter.latitude) < 0.3 && Math.abs(longitude - kaliboCenter.longitude) < 0.3;
const isFuelType = (value: unknown): value is FuelType => FUEL_TYPES.includes(value as FuelType);

// Home: the "World + HUD" map (DESIGN-002 §4.3, §7.3), or the two-pane
// layout on wide screens (§4.6).
export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ station?: string; fuel?: string }>();
  const wide = useIsWide();
  const insets = useSafeAreaInsets();
  const { markers, loading, error } = useMapMarkers();
  const location = useUserLocation();
  const mapRef = useRef<LiveMapHandle>(null);
  const [fuel, setFuel] = useState<FuelType>('diesel');
  const [sort, setSort] = useState<StationSort>('smart');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [hudBottom, setHudBottom] = useState(0);
  const [peekHeight, setPeekHeight] = useState(0);

  const scores = useMemo(() => scoreStationsForRoute(stations, fuel), [fuel]);
  const best = scores[0];
  const views = useMemo(() => [...scores.map(fromScore), ...markers.map(fromMarker)], [markers, scores]);
  const activeId = wide ? selectedId ?? sampleStationId(best.station.id) : selectedId;
  const selected = views.find((view) => view.id === activeId);
  const fuelLabel = fuelMeta[fuel].label;
  const banner = smartRouteBanner(best, fuelLabel);
  const userLocation: [number, number] | null = location.coords
    ? [location.coords.latitude, location.coords.longitude]
    : null;

  const pins = useMemo(
    () =>
      views.map((view) => {
        const price = view.prices[fuel];
        return buildPin({
          id: view.id,
          lat: view.coordinates.latitude,
          lng: view.coordinates.longitude,
          title: `${view.name}, ${fuelLabel} ${price ? formatPeso(price) : 'no price yet'}`,
          label: price ? formatPeso(price) : null,
          community: view.source === 'community',
          best: view.score?.isBestRoute ?? false,
          selected: view.id === activeId,
        });
      }),
    [activeId, fuel, fuelLabel, views],
  );

  // "Show on map" from the Stations tab opens that station's sheet.
  const linkedStation = params.station;
  const linkedFuel = params.fuel;
  useEffect(() => {
    if (!linkedStation) return;
    setSelectedId(linkedStation);
    setExpanded(true);
    if (isFuelType(linkedFuel)) setFuel(linkedFuel);
    router.setParams({ station: '', fuel: '' });
  }, [linkedFuel, linkedStation, router]);

  const closeSheet = useCallback(() => {
    setSelectedId(null);
    setExpanded(false);
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (expanded) {
        setExpanded(false);
        return true;
      }
      if (selectedId) {
        closeSheet();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [closeSheet, expanded, selectedId]);

  const selectPin = useCallback((pinId: string) => {
    setSelectedId(pinId);
    setExpanded(false);
  }, []);

  const changeFuel = (nextFuel: FuelType) => {
    setFuel(nextFuel);
    if (wide) setSelectedId(null);
  };

  const retryMap = () => {
    setMapFailed(false);
    setMapKey((key) => key + 1);
  };

  const map = mapFailed ? (
    <View style={styles.failedWrap}>
      <View style={[pixel.panel, styles.failed]}>
        <Sprite art={art.brokenStation} width={96} height={56} />
        <Text accessibilityRole="header" style={[type.displayMd, styles.center]}>
          Couldn&apos;t load the map
        </Text>
        <Text style={[type.bodyMd, styles.muted, styles.center]}>The map needs internet. Prices are still in the Stations list.</Text>
        <View style={styles.failedActions}>
          <PixelButton label="Retry" onPress={retryMap} style={styles.flex} />
          <PixelButton label="See stations" variant="secondary" onPress={() => router.navigate('/list')} style={styles.flex} />
        </View>
      </View>
    </View>
  ) : (
    <LiveMap
      key={mapKey}
      ref={mapRef}
      pins={pins}
      initialCenter={wide ? WIDE_CENTER : PHONE_CENTER}
      zoom={15}
      userLocation={userLocation}
      followUser={userLocation ? isNearKalibo(userLocation) : false}
      onPinPress={selectPin}
      onMapPress={wide ? () => undefined : closeSheet}
      onError={() => setMapFailed(true)}
    />
  );

  const controls = mapFailed ? null : (
    <View style={[styles.controls, wide ? styles.controlsWide : { top: hudBottom + 12 }]}>
      <MapControl icon="plus" label="Zoom in" onPress={() => mapRef.current?.zoomIn()} />
      <MapControl icon="minus" label="Zoom out" onPress={() => mapRef.current?.zoomOut()} />
      <MapControl icon="recenter" label="Center on my location" onPress={() => mapRef.current?.recenter(userLocation ?? KALIBO_CENTER)} />
    </View>
  );

  const counter = (
    <View style={[pixel.panel, styles.counter]}>
      {loading ? (
        <ActivityIndicator color={colors.surfaceTint} size="small" accessibilityLabel="Loading community prices" />
      ) : (
        <Text style={[type.displayMd, styles.counterValue]}>{views.length}</Text>
      )}
      <Text style={[type.tag, styles.counterLabel]}>stations</Text>
    </View>
  );

  const locationChip =
    location.status === 'denied' ? (
      <View style={[pixel.panel, styles.chipRow]}>
        <PixelIcon name="pin" size={20} color={colors.warning} />
        <Text style={[type.bodyStrong, styles.flex, { color: colors.text }]}>
          Location off · showing Kalibo centre. Distances are estimates.
        </Text>
        <PixelButton label="Enable" size="sm" onPress={location.request} />
      </View>
    ) : null;

  const sampleChip = error ? (
    <View style={[pixel.panel, styles.sampleChip]}>
      <PixelIcon name="info" size={18} />
      <Text style={[type.bodyStrong, { color: colors.text }]}>Showing sample stations</Text>
    </View>
  ) : null;

  if (wide) {
    const lowest = scores.reduce((low, score) => (score.fuelPrice < low.fuelPrice ? score : low), best);
    const communityCount = markers.length;
    return (
      <View style={styles.wide}>
        <View style={styles.listPane}>
          <TitleBar title="Stations" subtitle={`${sortSubtitle[sort]} · Kalibo, Aklan`} />
          <ScrollView contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
            <StationListPanel
              fuel={fuel}
              onFuelChange={changeFuel}
              sort={sort}
              onSortChange={setSort}
              openId={selected?.score?.station.id ?? null}
              onRowPress={(id) => setSelectedId(sampleStationId(id))}
              mode="select"
            />
          </ScrollView>
        </View>
        <View style={styles.mapPane}>
          {map}
          {mapFailed ? null : (
            <View style={styles.metrics}>
              <Metric label="Stations live" value={String(views.length)} caption={`${stations.length} sample · ${communityCount} community`} />
              <Metric label={`Lowest ${fuelLabel}`} value={formatPeso(lowest.fuelPrice)} caption={lowest.station.name} />
              <Metric
                label="Best net save"
                value={banner.positive ? `₱${Math.round(best.pesosSaved)}` : 'None today'}
                valueColor={banner.positive ? colors.success : colors.text}
                caption={banner.positive ? best.station.name : `Best value: ${best.station.name}`}
                tint
              />
            </View>
          )}
          {controls}
          {locationChip ? <View style={styles.wideChip}>{locationChip}</View> : null}
          <Attribution bottom={12} left={16} />
          {selected ? (
            <View style={[pixel.panel, styles.aside]}>
              <ScrollView contentContainerStyle={styles.asideContent}>
                <StationDetails station={selected} fuel={fuel} alwaysExplain />
              </ScrollView>
              <View style={styles.asideFooter}>
                <NavigateButton station={selected} />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {map}

      <View
        style={[styles.hud, { top: insets.top + 8 }]}
        onLayout={(event) => setHudBottom(event.nativeEvent.layout.y + event.nativeEvent.layout.height)}
      >
        <View style={styles.hudRow}>
          <View style={[pixel.tint, styles.logoChip]}>
            <Image source={require('../../assets/images/Gasup.png')} style={styles.logo} accessibilityLabel="GasUp365" />
          </View>
          <View accessibilityLabel="Area: Kalibo, Aklan" style={[pixel.panel, styles.areaChip]}>
            <PixelIcon name="pin" size={20} color={colors.actionStrong} />
            <Text numberOfLines={1} style={[type.bodyLg, styles.flex, { color: colors.text }]}>
              Kalibo
            </Text>
          </View>
          {counter}
        </View>

        <FuelHotbar value={fuel} onChange={changeFuel} />

        {mapFailed ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${banner.tag}: ${best.station.name}, ${banner.line}. Show details`}
            onPress={() => selectPin(sampleStationId(best.station.id))}
            style={({ pressed }) => [pixel.tint, styles.banner, pressed && pixel.pressed]}
          >
            <View style={styles.bannerIcon}>
              <PixelIcon name="rewards" size={20} />
            </View>
            <View style={styles.flexShrink}>
              <Text style={[type.tag, { color: colors.outline }]}>{banner.tag}</Text>
              <Text numberOfLines={1} style={[type.displaySm, { color: colors.text }]}>
                {best.station.name}
              </Text>
              <Text style={[type.bodyStrong, { color: banner.positive ? colors.success : colors.text }]}>{banner.line}</Text>
            </View>
            <Text style={[type.displayMd, { color: colors.text }]}>{formatPeso(best.fuelPrice)}</Text>
            <PixelIcon name="chevronRight" size={16} />
          </Pressable>
        )}

        {locationChip}
        {sampleChip}
      </View>

      {controls}

      <Attribution bottom={selected && !expanded ? peekHeight + 16 : 8} left={8} />

      {selected ? (
        <StationSheet
          station={selected}
          fuel={fuel}
          expanded={expanded}
          onExpand={() => setExpanded(true)}
          onClose={closeSheet}
          onPeekHeight={setPeekHeight}
        />
      ) : null}
    </View>
  );
};

const MapControl: React.FC<{ icon: 'plus' | 'minus' | 'recenter'; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    style={({ pressed }) => [pixel.panel, styles.control, pressed && pixel.pressed]}
  >
    <PixelIcon name={icon} size={24} />
  </Pressable>
);

const Metric: React.FC<{ label: string; value: string; caption: string; valueColor?: string; tint?: boolean }> = ({
  label,
  value,
  caption,
  valueColor = colors.text,
  tint,
}) => (
  <View style={[tint ? pixel.tint : pixel.panel, styles.metric]}>
    <Text style={[type.tag, { color: tint ? colors.outline : colors.textMuted }]}>{label}</Text>
    <Text style={[type.priceLg, { color: valueColor }]}>{value}</Text>
    <Text numberOfLines={1} style={[type.caption, styles.muted]}>
      {caption}
    </Text>
  </View>
);

const Attribution: React.FC<{ bottom: number; left: number }> = ({ bottom, left }) => (
  <View pointerEvents="none" style={[styles.attribution, { bottom, left }]}>
    <Text style={[type.caption, { color: colors.text }]}>© OpenStreetMap contributors</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.mapGround },
  flex: { flex: 1 },
  flexShrink: { flex: 1, minWidth: 0 },
  center: { textAlign: 'center', color: colors.text },
  muted: { color: colors.textMuted },
  hud: { position: 'absolute', left: 16, right: 16, gap: 8, zIndex: 2 },
  hudRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoChip: { width: 128, height: 44, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 112, height: 27 },
  areaChip: { flex: 1, minWidth: 0, height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10 },
  counter: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.outline,
    boxShadow: shadow.drop,
  },
  counterValue: { color: colors.surfaceTint, fontFamily: type.priceLg.fontFamily },
  counterLabel: { color: colors.surfaceTint },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingLeft: 12, paddingRight: 8 },
  bannerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10, paddingRight: 4, paddingVertical: 4 },
  sampleChip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6 },
  controls: { position: 'absolute', right: 16, gap: 8, zIndex: 2 },
  controlsWide: { left: 16, right: undefined, top: 148 },
  control: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  attribution: { position: 'absolute', zIndex: 2, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: 'rgba(255, 255, 255, 0.88)' },
  failedWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 24 },
  failed: { width: '100%', maxWidth: 420, alignItems: 'center', gap: 12, padding: 20 },
  failedActions: { flexDirection: 'row', gap: 8, alignSelf: 'stretch' },
  wide: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  listPane: { width: 400, borderRightWidth: 2, borderRightColor: colors.outline, backgroundColor: colors.bg },
  listContent: { padding: 20, paddingTop: 16 },
  mapPane: { flex: 1, minWidth: 0, backgroundColor: palette.mapGround },
  metrics: { position: 'absolute', left: 16, right: 412, top: 16, flexDirection: 'row', gap: 10, zIndex: 2 },
  metric: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 10 },
  wideChip: { position: 'absolute', left: 80, right: 412, top: 148, zIndex: 2 },
  aside: { position: 'absolute', right: 16, top: 16, bottom: 16, width: 380, zIndex: 3 },
  asideContent: { padding: 16 },
  asideFooter: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 2, borderTopColor: colors.outline },
});
