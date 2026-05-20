import { LeafletMap } from 'expo-leaflet-navigation-map';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { kaliboCenter, stations as defaultStations } from '../data/mockStations';
import { colors } from '../theme/colors';
import { Station } from '../types';

interface Props {
    selectedStationId: number | null;
    onSelectStation: (stationId: number) => void;
    stations?: Station[];
}

const kaliboCoordinates: [number, number] = [kaliboCenter.latitude, kaliboCenter.longitude];

export const StationLeafletMap: React.FC<Props> = ({
    selectedStationId,
    onSelectStation,
    stations = defaultStations,
}) => {
    const selectedStation = stations.find(station => station.id === selectedStationId);
    const markers = [
        {
            id: 'kalibo-center',
            lat: kaliboCenter.latitude,
            lng: kaliboCenter.longitude,
            title: 'Kalibo, Aklan, Philippines',
        },
        ...stations.map(station => ({
            id: station.id,
            lat: station.coordinates.latitude,
            lng: station.coordinates.longitude,
            title: `${station.name} - Diesel P${station.prices.diesel.toFixed(2)}`,
        })),
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
                <Text style={styles.liveDot}>●</Text>
                <Text style={styles.mapLabelText}>Live Kalibo fuel map</Text>
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
        fontSize: 12,
    },
    mapLabelText: {
        color: colors.primaryDark,
        fontSize: 12,
        fontWeight: '700',
    },
});
