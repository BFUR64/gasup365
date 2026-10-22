import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { StationSort } from '../../services/stationPresentation';
import { colors, palette } from '../../theme/colors';
import { FUEL_TYPES, fuelMeta, pixel } from '../../theme/pixel';
import { fonts, shadow, type } from '../../theme/tokens';
import { FuelType } from '../../types';
import { PixelIcon } from './PixelIcon';

interface FuelHotbarProps {
    value: FuelType;
    onChange: (fuel: FuelType) => void;
    framed?: boolean;
    style?: StyleProp<ViewStyle>;
}

// Three fuel item slots; the selected one is raised in its fuel colour.
export const FuelHotbar: React.FC<FuelHotbarProps> = ({ value, onChange, framed = true, style }) => (
    <View accessibilityRole="radiogroup" accessibilityLabel="Fuel type" style={[styles.grid, framed && [pixel.panel, styles.framed], style]}>
        {FUEL_TYPES.map((fuel) => {
            const meta = fuelMeta[fuel];
            const on = fuel === value;
            return (
                <Pressable
                    key={fuel}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`Fuel type: ${meta.label}`}
                    onPress={() => onChange(fuel)}
                    style={[
                        styles.slot,
                        on
                            ? { backgroundColor: meta.fill, boxShadow: shadow.selectedFuel, transform: [{ translateY: -2 }] }
                            : styles.slotOff,
                    ]}
                >
                    <PixelIcon name={fuel} size={20} color={on ? meta.onFill : meta.dark} />
                    <Text style={[styles.label, { color: on ? meta.onFill : colors.text }]}>{meta.label}</Text>
                </Pressable>
            );
        })}
    </View>
);

const SORTS: { id: StationSort; label: string }[] = [
    { id: 'smart', label: 'Smart' },
    { id: 'nearest', label: 'Nearest' },
    { id: 'cheapest', label: 'Cheapest' },
];

export const SortToggle: React.FC<{ value: StationSort; onChange: (sort: StationSort) => void }> = ({ value, onChange }) => (
    <View style={styles.sortRow}>
        <Text style={[type.tag, { color: colors.textMuted }]}>Sort</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Sort" style={styles.sortGroup}>
            {SORTS.map((sort, index) => {
                const on = sort.id === value;
                return (
                    <Pressable
                        key={sort.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        onPress={() => onChange(sort.id)}
                        style={[styles.sortButton, index > 0 && styles.sortDivider, on && styles.sortOn]}
                    >
                        <Text style={[type.bodyStrong, { color: on ? palette.white : colors.text }]}>{sort.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    </View>
);

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', gap: 6 },
    framed: { padding: 6 },
    slot: {
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 2,
        borderColor: colors.outline,
    },
    slotOff: { backgroundColor: colors.surfaceSunken, boxShadow: shadow.slotFlat },
    label: { fontFamily: fonts.body800, fontSize: 15, lineHeight: 20 },
    sortRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sortGroup: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: colors.outline,
        backgroundColor: colors.surfaceSunken,
    },
    sortButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sortDivider: { borderLeftWidth: 2, borderLeftColor: colors.outline },
    sortOn: { backgroundColor: colors.outline },
});
