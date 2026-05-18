import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { stations } from '../data/mockStations';
import { colors } from '../theme/colors';

interface Props {
    selectedStationId: number | null;
    onSelectStation: (stationId: number) => void;
}

const initialRegion = {
    latitude: 14.6760,
    longitude: 121.0437,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export const StationMap: React.FC<Props> = ({ selectedStationId, onSelectStation }) => {
    return (
        <MapView style={styles.map} initialRegion={initialRegion}>
            {stations.map(station => (
                <Marker
                    key={station.id}
                    coordinate={{
                        latitude: initialRegion.latitude + (station.mapPosition.y - 50) / 1000,
                        longitude: initialRegion.longitude + (station.mapPosition.x - 50) / 1000,
                    }}
                    onPress={() => onSelectStation(station.id)}
                >
                    <View style={styles.markerContainer}>
                        <Feather
                            name="map-pin"
                            size={28}
                            color={selectedStationId === station.id ? colors.primaryDark : colors.primary}
                        />
                        <View style={styles.priceBadge}>
                            <Text style={styles.priceBadgeText}>P{station.prices.diesel.toFixed(2)}</Text>
                        </View>
                    </View>
                </Marker>
            ))}
            <Marker coordinate={initialRegion}>
                <View style={styles.userDot} />
            </Marker>
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: { flex: 1 },
    markerContainer: { alignItems: 'center' },
    priceBadge: {
        position: 'absolute',
        top: -28,
        alignSelf: 'center',
        backgroundColor: colors.primaryDark,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priceBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    userDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2563EB',
        borderWidth: 2,
        borderColor: 'white',
    },
});
