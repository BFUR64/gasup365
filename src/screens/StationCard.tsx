import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { Station } from '../types';

interface Props {
    station: Station;
    onClose?: () => void;
    showDistance?: boolean;
}

export const StationCard: React.FC<Props> = ({ station, onClose, showDistance }) => {
    return (
        <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerText}>
            <Text style={styles.name}>{station.name}</Text>
            <Text style={styles.address}>{station.address}</Text>
            {showDistance && (
                <View style={styles.distanceRow}>
                <Feather name="navigation" size={12} color={colors.muted} />
                <Text style={styles.distanceText}>{station.distance} km away</Text>
                </View>
            )}
            </View>
            {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={16} color={colors.muted} />
            </TouchableOpacity>
            )}
        </View>

        {/* Prices */}
        <View style={styles.pricesRow}>
            <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Diesel</Text>
            <Text style={styles.priceValue}>₱{station.prices.diesel.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceItem, styles.priceBorder]}>
            <Text style={styles.priceLabel}>Unleaded</Text>
            <Text style={styles.priceValue}>₱{station.prices.unleaded.toFixed(2)}</Text>
            </View>
            <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Premium</Text>
            <Text style={styles.priceValue}>₱{station.prices.premium.toFixed(2)}</Text>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <View style={styles.updateRow}>
            <Feather name="clock" size={12} color={colors.muted} />
            <Text style={styles.updateText}>Updated {station.lastUpdated}</Text>
            </View>
            <TouchableOpacity style={styles.navigateButton}>
            <Feather name="navigation" size={12} color="white" />
            <Text style={styles.navigateText}>Navigate</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerText: { flex: 1 },
    name: { fontWeight: '600', fontSize: 16, color: colors.text },
    address: { fontSize: 12, color: colors.muted, marginTop: 4 },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    distanceText: { fontSize: 10, color: colors.muted },
    closeButton: { padding: 4 },
    pricesRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    priceItem: { flex: 1, alignItems: 'center' },
    priceBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
    priceLabel: { fontSize: 10, color: colors.muted, marginBottom: 4 },
    priceValue: { fontWeight: '600', fontSize: 14, color: colors.text },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    updateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    updateText: { fontSize: 10, color: colors.muted },
    navigateButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        gap: 4,
    },
    navigateText: { color: 'white', fontSize: 12, fontWeight: '500' },
});