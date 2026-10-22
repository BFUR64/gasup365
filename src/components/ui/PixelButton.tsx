import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, palette } from '../../theme/colors';
import { pixel } from '../../theme/pixel';
import { fonts, shadow } from '../../theme/tokens';
import { IconName } from '../../ui/icons';
import { PixelIcon } from './PixelIcon';

type Variant = 'primary' | 'secondary' | 'danger' | 'reward' | 'ghost';

interface PixelButtonProps {
    label: string;
    onPress?: () => void;
    variant?: Variant;
    size?: 'lg' | 'sm';
    icon?: IconName;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    loading?: boolean;
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<Variant, { box: ViewStyle; text: string }> = {
    primary: { box: { backgroundColor: colors.action, boxShadow: shadow.primary }, text: colors.onAction },
    secondary: { box: { backgroundColor: colors.surface, boxShadow: shadow.secondary }, text: colors.onAction },
    danger: { box: { backgroundColor: colors.danger, boxShadow: shadow.danger }, text: palette.white },
    reward: { box: { backgroundColor: colors.highlight, boxShadow: shadow.reward }, text: colors.onAction },
    ghost: { box: { backgroundColor: 'transparent', borderColor: 'transparent' }, text: colors.actionStrong },
};

// Three stepped blocks, the pixel stand-in for a spinner.
const PixelSpinner: React.FC<{ color: string }> = ({ color }) => (
    <View style={styles.spinner}>
        <View style={[styles.spinBlock, { backgroundColor: color }]} />
        <View style={[styles.spinBlock, styles.spinBlockTall, { backgroundColor: color }]} />
        <View style={[styles.spinBlock, { backgroundColor: color }]} />
    </View>
);

export const PixelButton: React.FC<PixelButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'lg',
    icon,
    iconPosition = 'right',
    disabled = false,
    loading = false,
    accessibilityLabel,
    style,
}) => {
    const look = variantStyles[variant];
    const textColor = disabled ? colors.textMuted : look.text;
    const iconNode = icon ? <PixelIcon name={icon} size={20} color={textColor} /> : null;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{ disabled, busy: loading }}
            disabled={disabled || loading}
            onPress={onPress}
            style={({ pressed }) => [
                styles.base,
                size === 'sm' ? styles.small : styles.large,
                look.box,
                disabled && styles.disabled,
                pressed && variant !== 'ghost' && pixel.pressed,
                style,
            ]}
        >
            {loading ? (
                <PixelSpinner color={textColor} />
            ) : (
                <>
                    {iconPosition === 'left' ? iconNode : null}
                    <Text
                        style={[
                            styles.label,
                            size === 'sm' && styles.labelSmall,
                            variant === 'ghost' && styles.ghostLabel,
                            { color: textColor },
                        ]}
                    >
                        {label}
                    </Text>
                    {iconPosition === 'right' ? iconNode : null}
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: colors.outline,
    },
    large: { minHeight: 52 },
    small: { minHeight: 48 },
    disabled: {
        backgroundColor: colors.surfaceSunken,
        borderColor: colors.border,
        borderStyle: 'dashed',
        boxShadow: 'none',
    },
    label: { fontFamily: fonts.display600, fontSize: 18, lineHeight: 24, textAlign: 'center' },
    labelSmall: { fontSize: 16, lineHeight: 20 },
    ghostLabel: { fontFamily: fonts.body800, fontSize: 16, textDecorationLine: 'underline' },
    spinner: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 24, paddingBottom: 6 },
    spinBlock: { width: 8, height: 8 },
    spinBlockTall: { height: 12 },
});
