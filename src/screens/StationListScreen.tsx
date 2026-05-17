import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { stations } from '../data/mockStations';
import { colors } from '../theme/colors';
import { StationCard } from './StationCard';

export const StationListScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');

    const filteredStations = stations
        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
        if (sortBy === 'distance') return a.distance - b.distance;
        return a.prices.diesel - b.prices.diesel;
        });

    return (
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Nearby Stations</Text>
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

        {/* Sort Options */}
        <View style={styles.sortBar}>
            <View style={styles.sortButtons}>
            <TouchableOpacity
                style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
                onPress={() => setSortBy('distance')}
            >
                <Text style={[styles.sortText, sortBy === 'distance' && styles.sortTextActive]}>Nearest</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
                onPress={() => setSortBy('price')}
            >
                <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>Cheapest</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.filterIcon}>
            <Feather name="sliders" size={16} color={colors.text} />
            </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
            data={filteredStations}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
            <View style={styles.cardWrapper}>
                <StationCard station={item} showDistance />
                {index === 0 && sortBy === 'price' && (
                <View style={styles.bestPriceBadge}>
                    <Feather name="trending-down" size={12} color="white" />
                    <Text style={styles.bestPriceText}>Best Price</Text>
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
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 12 },
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
    sortBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sortButtons: { flexDirection: 'row', gap: 8 },
    sortButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.accent },
    sortButtonActive: { backgroundColor: colors.primary },
    sortText: { fontSize: 12, color: colors.text },
    sortTextActive: { color: 'white' },
    filterIcon: { padding: 8 },
    listContent: { padding: 16, gap: 16 },
    cardWrapper: { position: 'relative' },
    bestPriceBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        zIndex: 1,
    },
    bestPriceText: { fontSize: 10, fontWeight: 'bold', color: 'white' },
});