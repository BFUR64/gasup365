import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { stations } from '../data/mockStations';
import { buildGoogleMapsDirectionsUrl, fuelLabels, scoreStationsForRoute } from '../services/fuelRouting';
import { colors } from '../theme/colors';
import { FuelType } from '../types';
import { StationCard } from './StationCard';

export const StationListScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [fuelType, setFuelType] = useState<FuelType>('diesel');
    const [sortBy, setSortBy] = useState<'smart' | 'distance' | 'price'>('smart');

    const routeScores = useMemo(() => scoreStationsForRoute(stations, fuelType), [fuelType]);
    const filteredScores = routeScores
        .filter(score => score.station.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
            if (sortBy === 'price') return a.fuelPrice - b.fuelPrice;
            return b.pesosSaved - a.pesosSaved;
        });

    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Live Price List</Text>
            <Text style={styles.headerSub}>Sorted by price, distance, or net pesos saved</Text>
            <View style={styles.searchBar}>
            <Feather name="search" size={16} color="white" />
            <TextInput
                style={styles.searchInput}
                placeholder="Search gas stations..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            </View>
        </View>

        <View style={styles.filterRows}>
            <View style={styles.sortButtons}>
            {(['diesel', 'unleaded', 'premium'] as FuelType[]).map(type => (
                <TouchableOpacity
                    key={type}
                    style={[styles.sortButton, fuelType === type && styles.sortButtonActive]}
                    onPress={() => setFuelType(type)}
                >
                    <Text style={[styles.sortText, fuelType === type && styles.sortTextActive]}>
                        {fuelLabels[type]}
                    </Text>
                </TouchableOpacity>
            ))}
            </View>
            <View style={styles.sortButtons}>
            {[
                { id: 'smart' as const, label: 'Smart' },
                { id: 'distance' as const, label: 'Nearest' },
                { id: 'price' as const, label: 'Cheapest' },
            ].map(option => (
                <TouchableOpacity
                    key={option.id}
                    style={[styles.sortButton, sortBy === option.id && styles.sortButtonActive]}
                    onPress={() => setSortBy(option.id)}
                >
                    <Text style={[styles.sortText, sortBy === option.id && styles.sortTextActive]}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
            </View>
        </View>

        <FlatList
            data={filteredScores}
            keyExtractor={item => item.station.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
            <View style={styles.cardWrapper}>
                <StationCard
                    station={item.station}
                    showDistance
                    routeScore={item}
                    onNavigate={() => Linking.openURL(buildGoogleMapsDirectionsUrl(item.station))}
                />
                {index === 0 && sortBy === 'smart' && (
                <View style={styles.bestPriceBadge}>
                    <Feather name="trending-down" size={12} color="white" />
                    <Text style={styles.bestPriceText}>Best net save</Text>
                </View>
                )}
            </View>
            )}
        />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: 'white' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 3, marginBottom: 12 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    searchInput: { flex: 1, color: 'white', fontSize: 14 },
    filterRows: {
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sortButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    sortButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.accent },
    sortButtonActive: { backgroundColor: colors.primary },
    sortText: { fontSize: 12, color: colors.text, fontWeight: '700' },
    sortTextActive: { color: 'white' },
    listContent: { padding: 16, paddingBottom: 112, gap: 16 },
    cardWrapper: { position: 'relative' },
    bestPriceBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
    },
    bestPriceText: { fontSize: 10, fontWeight: 'bold', color: 'white' },
});
