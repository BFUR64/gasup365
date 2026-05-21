import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fuelLabels } from '../services/fuelRouting';
import { colors } from '../theme/colors';
import { Station, StationRouteScore } from '../types';

interface Props {
    station: Station;
    onClose?: () => void;
    onNavigate?: () => void;
    showDistance?: boolean;
    routeScore?: StationRouteScore;
}

export const StationCard: React.FC<Props> = ({ station, onClose, onNavigate, showDistance, routeScore }) => {
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
            {routeScore?.isBestRoute ? (
                <View style={styles.bestRouteBadge}>
                <Feather name="zap" size={11} color="white" />
                <Text style={styles.bestRouteText}>Smart route</Text>
                </View>
            ) : null}
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

        {routeScore ? (
            <View style={styles.savingsPanel}>
            <View style={styles.savingsMetric}>
                <Text style={styles.savingsValue}>P{routeScore.pesosSaved.toFixed(2)}</Text>
                <Text style={styles.savingsLabel}>net pesos saved</Text>
            </View>
            <View style={styles.savingsDivider} />
            <View style={styles.savingsCopy}>
                <Text style={styles.routeTitle}>{fuelLabels[routeScore.fuelType]} route score</Text>
                <Text style={styles.routeText}>
                P{routeScore.grossFuelSavings.toFixed(2)} fuel savings minus P{routeScore.estimatedTravelCost.toFixed(2)} travel cost
                </Text>
            </View>
            </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
            <View style={styles.updateRow}>
            <Feather name="clock" size={12} color={colors.muted} />
            <Text style={styles.updateText}>Updated {station.lastUpdated}</Text>
            </View>
            <TouchableOpacity style={styles.navigateButton} onPress={onNavigate}>
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        boxShadow: '0 2px 10px rgba(31, 41, 51, 0.08)',
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
    bestRouteBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: colors.success,
    },
    bestRouteText: { color: 'white', fontSize: 10, fontWeight: '800' },
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
    priceValue: { fontWeight: '700', fontSize: 14, color: colors.primaryDark },
    savingsPanel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.primarySoft,
    },
    savingsMetric: { minWidth: 92 },
    savingsValue: {
        color: colors.success,
        fontSize: 17,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
    savingsLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    savingsDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
    savingsCopy: { flex: 1 },
    routeTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
    routeText: { color: colors.muted, fontSize: 11, marginTop: 2 },
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
