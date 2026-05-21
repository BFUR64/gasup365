import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { LiveMap } from '../components/LiveMap';
import { stations } from '../data/mockStations';
import { useMapMarkers } from '../hooks/useMapMarkers';
import { buildGoogleMapsDirectionsUrl, scoreStationsForRoute } from '../services/fuelRouting';
import { colors } from '../theme/colors';

const DEFAULT_CENTER: [number, number] = [11.7089, 122.364];
const stationMarkerId = (stationId: number) => `station-${stationId}`;

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { markers, loading, error } = useMapMarkers();
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const routeScores = useMemo(() => scoreStationsForRoute(stations, 'diesel'), []);
  const bestRouteScore = routeScores[0];
  const staticStationMarkers = useMemo(
    () => routeScores.map(score => ({
      id: stationMarkerId(score.station.id),
      lat: score.station.coordinates.latitude,
      lng: score.station.coordinates.longitude,
      title: `${score.station.name} - Diesel P${score.fuelPrice.toFixed(2)}`,
      description: `Save P${Math.max(0, score.pesosSaved).toFixed(0)} net after travel cost | ${score.station.lastUpdated}`,
    })),
    [routeScores],
  );
  const combinedMarkers = useMemo(
    () => [...staticStationMarkers, ...markers],
    [markers, staticStationMarkers],
  );
  const selectedStationScore = useMemo(
    () => routeScores.find(score => stationMarkerId(score.station.id) === selectedMarkerId),
    [routeScores, selectedMarkerId],
  );
  const selectedMarker = useMemo(
    () => combinedMarkers.find((marker) => marker.id === selectedMarkerId),
    [combinedMarkers, selectedMarkerId],
  );

  const handleMarkerPress = useCallback((markerId: string) => {
    setSelectedMarkerId(markerId);
  }, []);

  return (
    <View style={styles.container}>
      <LiveMap
        markers={combinedMarkers}
        center={DEFAULT_CENTER}
        zoom={13}
        onMarkerPress={handleMarkerPress}
      />

      <View style={styles.topStack}>
        <View style={styles.headerPanel}>
          <View>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/images/Gasup.png')}
                style={styles.headerLogo}
                resizeMode="contain"
                accessibilityLabel="GasUp"
              />
            </View>
            <Text style={styles.title}>Live Price Map</Text>
          </View>
          <View style={styles.countPill}>
            {loading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.countText}>{combinedMarkers.length}</Text>
            )}
          </View>
        </View>

        <View style={styles.smartPanel}>
          <Text style={styles.smartLabel}>Smart diesel route</Text>
          <Text style={styles.smartValue}>{bestRouteScore?.station.name}</Text>
          <Text style={styles.smartMeta}>Net savings P{Math.max(0, bestRouteScore?.pesosSaved ?? 0).toFixed(0)} after estimated travel cost</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.notice}>
          <Text style={styles.errorText} selectable>
            {error}
          </Text>
        </View>
      ) : null}

      {selectedMarker ? (
        <Pressable
          style={styles.markerCard}
          onPress={() => {
            if (selectedStationScore) {
              Linking.openURL(buildGoogleMapsDirectionsUrl(selectedStationScore.station));
              return;
            }
            setSelectedMarkerId(null);
          }}
        >
          <View style={styles.markerIcon}>
            <Feather name={selectedStationScore ? 'navigation' : 'map-pin'} size={18} color="white" />
          </View>
          <View style={styles.markerTextBlock}>
            <Text style={styles.markerTitle}>{selectedMarker.title}</Text>
            {selectedMarker.description ? (
              <Text style={styles.markerDescription}>{selectedMarker.description}</Text>
            ) : null}
          </View>
          <Feather name={selectedStationScore ? 'external-link' : 'x'} size={18} color={colors.muted} />
        </Pressable>
      ) : null}

      <Pressable style={styles.cameraButton} onPress={() => router.push('/add')}>
        <Feather name="camera" size={22} color="white" />
        <Text style={styles.cameraButtonText}>Scan Price</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topStack: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    boxShadow: '0 8px 22px rgba(194, 65, 12, 0.16)',
  },
  headerPanel: {
    minHeight: 76,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoBox: {
    alignSelf: 'flex-start',
    minWidth: 134,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    boxShadow: '0 6px 14px rgba(194, 65, 12, 0.14)',
  },
  headerLogo: { width: 112, height: 27 },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  countPill: {
    minWidth: 42,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  smartPanel: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smartLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  smartValue: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 2 },
  smartMeta: { color: colors.success, fontSize: 12, fontWeight: '800', marginTop: 3 },
  notice: {
    position: 'absolute',
    top: 226,
    left: 16,
    right: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  markerCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 112,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 10px 26px rgba(31, 41, 51, 0.14)',
  },
  markerIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  markerTextBlock: {
    flex: 1,
    gap: 2,
  },
  markerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  markerDescription: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  cameraButton: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    boxShadow: '0 8px 20px rgba(194, 65, 12, 0.28)',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
  },
});
