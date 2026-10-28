import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { pixel } from '../../theme/pixel';
import { shadow, type } from '../../theme/tokens';
import { PixelIcon } from './PixelIcon';

type Tone = 'default' | 'success' | 'warning' | 'error';

const toneBorder: Record<Tone, string> = {
    default: colors.outline,
    success: colors.success,
    warning: colors.warning,
    error: colors.danger,
};

interface PixelInputProps extends TextInputProps {
    tone?: Tone;
    dashed?: boolean;
    inputStyle?: StyleProp<TextStyle>;
}

// Slot-style text input with the yellow focus ring (DESIGN-002 §5.6 border.focus).
export const PixelInput: React.FC<PixelInputProps> = ({ tone = 'default', dashed, inputStyle, onFocus, onBlur, ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <TextInput
            placeholderTextColor={colors.textMuted}
            {...props}
            onFocus={(event) => {
                setFocused(true);
                onFocus?.(event);
            }}
            onBlur={(event) => {
                setFocused(false);
                onBlur?.(event);
            }}
            style={[
                pixel.slot,
                styles.input,
                { borderColor: toneBorder[tone], borderStyle: dashed ? 'dashed' : 'solid' },
                focused && styles.focused,
                inputStyle,
            ]}
        />
    );
};

export const SearchField: React.FC<{ value: string; onChangeText: (value: string) => void }> = ({ value, onChangeText }) => (
    <View>
        <PixelIcon name="search" size={20} style={styles.searchIcon} />
        <PixelInput
            accessibilityLabel="Search stations"
            placeholder="Search stations"
            value={value}
            onChangeText={onChangeText}
            autoCorrect={false}
            returnKeyType="search"
            inputStyle={styles.searchInput}
        />
        {value ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChangeText('')} style={styles.clear}>
                <PixelIcon name="close" size={16} />
            </Pressable>
        ) : null}
    </View>
);

const styles = StyleSheet.create({
    input: { minHeight: 52, paddingHorizontal: 12, ...type.bodyLg, color: colors.text },
    focused: { boxShadow: `${shadow.slot}, 0px 0px 0px 4px #FFD54A` },
    searchIcon: { position: 'absolute', left: 14, top: 16, zIndex: 1 },
    searchInput: { paddingLeft: 44, paddingRight: 48 },
    clear: { position: 'absolute', right: 2, top: 2, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
