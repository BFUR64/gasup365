import { LeafletMap } from 'expo-leaflet-navigation-map';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { kaliboCenter, stations as defaultStations } from '../data/mockStations';
import { fuelLabels } from '../services/fuelRouting';
import { colors } from '../theme/colors';
import { FuelType, Station, StationRouteScore } from '../types';

interface Props {
    selectedStationId: number | null;
    onSelectStation: (stationId: number) => void;
    stations?: Station[];
    fuelType?: FuelType;
    routeScores?: StationRouteScore[];
}

const kaliboCoordinates: [number, number] = [kaliboCenter.latitude, kaliboCenter.longitude];

export const StationLeafletMap: React.FC<Props> = ({
    selectedStationId,
    onSelectStation,
    stations = defaultStations,
    fuelType = 'diesel',
    routeScores = [],
}) => {
    const selectedStation = stations.find(station => station.id === selectedStationId);
    const scoreByStation = new Map(routeScores.map(score => [score.station.id, score]));
    const markers = [
        {
            id: 'kalibo-center',
            lat: kaliboCenter.latitude,
            lng: kaliboCenter.longitude,
            title: 'Kalibo, Aklan, Philippines',
        },
        ...stations.map(station => {
            const score = scoreByStation.get(station.id);

            return {
                id: station.id,
                lat: station.coordinates.latitude,
                lng: station.coordinates.longitude,
                title: `${station.name} - ${fuelLabels[fuelType]} P${station.prices[fuelType].toFixed(2)} - Save P${Math.max(0, score?.pesosSaved ?? 0).toFixed(0)}`,
            };
        }),
    ];
    const route = selectedStation
        ? {
            start: kaliboCoordinates,
            end: [selectedStation.coordinates.latitude, selectedStation.coordinates.longitude] as [number, number],
            routeColor: colors.primary,
            onFocus: true,
        }
        : null;

    return (
        <View style={styles.mapShell}>
            <LeafletMap
                coordinates={kaliboCoordinates}
                zoom={15}
                markers={markers}
                onMarkerPress={(markerId) => {
                    if (typeof markerId === 'number') onSelectStation(markerId);
                }}
                ShowZoomControls
                ShowDirectionPanel={false}
                route={route}
                theme="light"
            />
            <View style={styles.mapLabel}>
                <Text style={styles.liveDot}>LIVE</Text>
                <Text style={styles.mapLabelText}>Fuel map + smart route</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mapShell: {
        flex: 1,
        backgroundColor: colors.primarySoft,
        overflow: 'hidden',
    },
    mapLabel: {
        position: 'absolute',
        left: 16,
        top: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.94)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    liveDot: {
        color: colors.success,
        fontSize: 10,
        fontWeight: '900',
    },
    mapLabelText: {
        color: colors.primaryDark,
        fontSize: 12,
        fontWeight: '700',
    },
});
