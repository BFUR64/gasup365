import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { stations } from '../data/mockStations';
import { colors } from '../theme/colors';

interface Props {
    selectedStationId: number | null;
    onSelectStation: (stationId: number) => void;
}

export const StationMap: React.FC<Props> = ({ selectedStationId, onSelectStation }) => {
    return (
        <View style={styles.webMap}>
            <View style={styles.roadPrimary} />
            <View style={styles.roadSecondary} />
            <View style={styles.roadVertical} />
            <View style={styles.userDot} />
            {stations.map(station => (
                <TouchableOpacity
                    key={station.id}
                    activeOpacity={0.86}
                    onPress={() => onSelectStation(station.id)}
                    style={[
                        styles.marker,
                        {
                            left: `${station.mapPosition.x}%`,
                            top: `${station.mapPosition.y}%`,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.priceBadge,
                            selectedStationId === station.id && styles.priceBadgeActive,
                        ]}
                    >
                        <Text style={styles.priceBadgeText}>P{station.prices.diesel.toFixed(2)}</Text>
                    </View>
                    <Feather
                        name="map-pin"
                        size={30}
                        color={selectedStationId === station.id ? colors.primaryDark : colors.primary}
                    />
                </TouchableOpacity>
            ))}
            <View style={styles.mapLabel}>
                <Feather name="map" size={14} color={colors.primaryDark} />
                <Text style={styles.mapLabelText}>Quezon City fuel map</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    webMap: {
        flex: 1,
        backgroundColor: '#F8EFE7',
        overflow: 'hidden',
    },
    roadPrimary: {
        position: 'absolute',
        left: '-10%',
        right: '-10%',
        top: '45%',
        height: 34,
        backgroundColor: '#FFFFFF',
        transform: [{ rotate: '-14deg' }],
        borderWidth: 1,
        borderColor: colors.border,
    },
    roadSecondary: {
        position: 'absolute',
        left: '-12%',
        right: '-12%',
        top: '66%',
        height: 22,
        backgroundColor: '#FFF8F2',
        transform: [{ rotate: '10deg' }],
        borderWidth: 1,
        borderColor: colors.border,
    },
    roadVertical: {
        position: 'absolute',
        top: '-10%',
        bottom: '-10%',
        left: '56%',
        width: 28,
        backgroundColor: '#FFFFFF',
        transform: [{ rotate: '7deg' }],
        borderWidth: 1,
        borderColor: colors.border,
    },
    marker: {
        position: 'absolute',
        alignItems: 'center',
        transform: [{ translateX: -24 }, { translateY: -38 }],
    },
    priceBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: -2,
    },
    priceBadgeActive: {
        backgroundColor: colors.primaryDark,
    },
    priceBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
    },
    userDot: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#2563EB',
        borderWidth: 2,
        borderColor: 'white',
    },
    mapLabel: {
        position: 'absolute',
        left: 16,
        bottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    mapLabelText: {
        color: colors.primaryDark,
        fontSize: 12,
        fontWeight: '700',
    },
});
