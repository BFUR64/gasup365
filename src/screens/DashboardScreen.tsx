import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LiveMap } from '../components/LiveMap';
import { useMapMarkers } from '../hooks/useMapMarkers';
import { colors } from '../theme/colors';

const DEFAULT_CENTER: [number, number] = [11.7089, 122.364];

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { markers, loading, error } = useMapMarkers();
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.id === selectedMarkerId),
    [markers, selectedMarkerId],
  );

  const handleMarkerPress = useCallback((markerId: string) => {
    setSelectedMarkerId(markerId);
  }, []);

  return (
    <View style={styles.container}>
      <LiveMap
        markers={markers}
        center={DEFAULT_CENTER}
        zoom={13}
        onMarkerPress={handleMarkerPress}
      />

      <View style={styles.headerPanel}>
        <View>
          <Text style={styles.eyebrow}>GasUp365</Text>
          <Text style={styles.title}>Live Map Dashboard</Text>
        </View>
        <View style={styles.countPill}>
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={styles.countText}>{markers.length}</Text>
          )}
        </View>
      </View>

      {error ? (
        <View style={styles.notice}>
          <Text style={styles.errorText} selectable>
            {error}
          </Text>
        </View>
      ) : null}

      {!loading && !error && markers.length === 0 ? (
        <View style={styles.notice}>
          <Text style={styles.emptyText}>No markers yet</Text>
        </View>
      ) : null}

      {selectedMarker ? (
        <Pressable style={styles.markerCard} onPress={() => setSelectedMarkerId(null)}>
          <View style={styles.markerIcon}>
            <Feather name="map-pin" size={18} color="white" />
          </View>
          <View style={styles.markerTextBlock}>
            <Text style={styles.markerTitle}>{selectedMarker.title}</Text>
            {selectedMarker.description ? (
              <Text style={styles.markerDescription}>{selectedMarker.description}</Text>
            ) : null}
          </View>
          <Feather name="x" size={18} color={colors.muted} />
        </Pressable>
      ) : null}

      <Pressable style={styles.cameraButton} onPress={() => router.push('/add')}>
        <Feather name="camera" size={22} color="white" />
        <Text style={styles.cameraButtonText}>Add Marker</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerPanel: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    minHeight: 76,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 8px 22px rgba(194, 65, 12, 0.16)',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
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
  notice: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
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
