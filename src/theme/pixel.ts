import { StyleSheet } from 'react-native';
import { colors, palette } from './colors';
import { shadow } from './tokens';
import { FuelType } from '../types';

// PixelPanel variants (DESIGN-002 §5.2) as shared styles.
export const pixel = StyleSheet.create({
    panel: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.outline,
        boxShadow: shadow.panel,
    },
    tint: {
        backgroundColor: colors.surfaceTint,
        borderWidth: 2,
        borderColor: colors.outline,
        boxShadow: shadow.panel,
    },
    slot: {
        backgroundColor: colors.surfaceSunken,
        borderWidth: 2,
        borderColor: colors.outline,
        boxShadow: shadow.slot,
    },
    pressed: {
        transform: [{ translateY: 4 }],
        boxShadow: shadow.pressed,
    },
});

export interface FuelMeta {
    label: string;
    fill: string;
    onFill: string;
    dark: string;
}

export const fuelMeta: Record<FuelType, FuelMeta> = {
    diesel: { label: 'Diesel', fill: colors.fuelDiesel, onFill: colors.onAction, dark: palette.amber700 },
    unleaded: { label: 'Unleaded', fill: colors.fuelUnleaded, onFill: colors.onAction, dark: palette.green700 },
    premium: { label: 'Premium', fill: colors.fuelPremium, onFill: palette.white, dark: palette.red800 },
};

export const FUEL_TYPES: FuelType[] = ['diesel', 'unleaded', 'premium'];

// Gold, silver and bronze rank frames for the top three Smart picks.
export const medalColors = [palette.yellow400, palette.silver, palette.bronze];
