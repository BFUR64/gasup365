import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { stations } from '../data/mockStations';
import { colors } from '../theme/colors';
import { StationCard } from './StationCard';
import { StationMap } from './StationMap';

export const MapViewScreen: React.FC = () => {
    const [selectedFuelType, setSelectedFuelType] = useState<string>('all');
    const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

    const fuelTypes = [
        { id: 'all', label: 'All' },
        { id: 'diesel', label: 'Diesel' },
        { id: 'unleaded', label: 'Unleaded' },
        { id: 'premium', label: 'Premium' },
    ];

    const selectedStation = stations.find(station => station.id === selectedStationId);
    const filteredStations = useMemo(() => {
        if (selectedFuelType === 'all') return stations;
        return stations.filter(station => station.prices[selectedFuelType as keyof typeof station.prices] > 0);
    }, [selectedFuelType]);
    const lowestDiesel = useMemo(
        () => Math.min(...stations.map(station => station.prices.diesel)),
        [],
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Kalibo Fuel Dashboard</Text>
                    <Text style={styles.subtitle}>Live fuel stations around Aklan&apos;s capital</Text>
                </View>

                <TouchableOpacity style={styles.filterButton}>
                    <Feather name="filter" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.locationBar}>
                    <Feather name="navigation" size={16} color="white" />
                    <Text style={styles.locationText}>Kalibo, Aklan, Philippines</Text>
                    <Feather name="chevron-down" size={16} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.dashboardStrip}>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricValue}>{stations.length}</Text>
                    <Text style={styles.metricLabel}>Live stations</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricBlock}>
                    <Text style={styles.metricValue}>₱{lowestDiesel.toFixed(2)}</Text>
                    <Text style={styles.metricLabel}>Lowest diesel</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricBlock}>
                    <Text style={styles.metricValue}>15</Text>
                    <Text style={styles.metricLabel}>Map zoom</Text>
                </View>
            </View>

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
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedFuelType === type.id && styles.filterChipTextActive,
                            ]}
                        >
                            {type.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <StationMap
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
                stations={filteredStations}
            />

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
        paddingBottom: 16,
        gap: 14,
    },
    title: { fontSize: 23, fontWeight: '800', color: 'white' },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 3 },
    filterButton: {
        position: 'absolute',
        right: 16,
        top: 48,
        padding: 9,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    locationBar: {
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: { flex: 1, fontSize: 14, color: 'white' },
    dashboardStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    metricBlock: { flex: 1, gap: 2 },
    metricValue: {
        color: colors.primaryDark,
        fontSize: 17,
        fontWeight: '900',
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
    },
    metricLabel: {
        color: colors.muted,
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    metricDivider: {
        width: 1,
        height: 28,
        backgroundColor: colors.border,
    },
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
        borderRadius: 999,
        backgroundColor: colors.accent,
    },
    filterChipActive: { backgroundColor: colors.primary },
    filterChipText: { fontSize: 13, fontWeight: '600', color: colors.text },
    filterChipTextActive: { color: 'white' },
    cardContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
});
