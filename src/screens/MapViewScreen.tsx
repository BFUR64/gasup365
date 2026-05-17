// screens/MapViewScreen.tsx
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { stations } from '../data/mockStations';
import { colors } from '../theme/colors';
import { StationCard } from './StationCard';

export const MapViewScreen: React.FC = () => {
    const [selectedFuelType, setSelectedFuelType] = useState<string>('all');
    const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

    const fuelTypes = [
        { id: 'all', label: 'All' },
        { id: 'diesel', label: 'Diesel' },
        { id: 'unleaded', label: 'Unleaded' },
        { id: 'premium', label: 'Premium' },
    ];

    const selectedStation = stations.find(s => s.id === selectedStationId);

    // For demo, we use a fixed region (Quezon City)
    const initialRegion = {
        latitude: 14.6760,
        longitude: 121.0437,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <Text style={styles.title}>GasUp365</Text>
            <TouchableOpacity style={styles.filterButton}>
            <Feather name="filter" size={20} color="white" />
            </TouchableOpacity>
        </View>

        {/* Location Bar */}
        <TouchableOpacity style={styles.locationBar}>
            <Feather name="navigation" size={16} color="white" />
            <Text style={styles.locationText}>Quezon City, Metro Manila</Text>
            <Feather name="chevron-down" size={16} color="white" />
        </TouchableOpacity>

        {/* Fuel Filter */}
        <View style={styles.filterContainer}>
            {fuelTypes.map(type => (
            <TouchableOpacity
                key={type.id}
                style={[
                styles.filterChip,
                selectedFuelType === type.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFuelType(type.id)}
            >
                <Text style={[
                styles.filterChipText,
                selectedFuelType === type.id && styles.filterChipTextActive,
                ]}>{type.label}</Text>
            </TouchableOpacity>
            ))}
        </View>

        {/* Map */}
        <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
        >
            {stations.map(station => (
            <Marker
                key={station.id}
                coordinate={{
                latitude: initialRegion.latitude + (station.mapPosition.y - 50) / 1000,
                longitude: initialRegion.longitude + (station.mapPosition.x - 50) / 1000,
                }}
                onPress={() => setSelectedStationId(station.id)}
            >
                <View style={styles.markerContainer}>
                <Feather
                    name="map-pin"
                    size={28}
                    color={selectedStationId === station.id ? colors.destructive : colors.primary}
                />
                <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>₱{station.prices.diesel}</Text>
                </View>
                </View>
            </Marker>
            ))}
            {/* User location dot */}
            <Marker coordinate={initialRegion} pinColor="#3B82F6">
            <View style={styles.userDot} />
            </Marker>
        </MapView>

        {/* Bottom Station Card */}
        {selectedStation && (
            <View style={styles.cardContainer}>
            <StationCard
                station={selectedStation}
                onClose={() => setSelectedStationId(null)}
            />
            </View>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    filterButton: { padding: 8 },
    locationBar: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 16,
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: { flex: 1, fontSize: 14, color: 'white' },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.accent,
    },
    filterChipActive: { backgroundColor: colors.primary },
    filterChipText: { fontSize: 14, color: colors.text },
    filterChipTextActive: { color: 'white' },
    map: { flex: 1 },
    markerContainer: { alignItems: 'center' },
    priceBadge: {
        position: 'absolute',
        top: -28,
        alignSelf: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priceBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    userDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: 'white',
    },
    cardContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
});