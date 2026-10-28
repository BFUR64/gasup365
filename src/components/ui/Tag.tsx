import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, palette } from '../../theme/colors';
import { type } from '../../theme/tokens';

type Tone = 'sample' | 'community' | 'live' | 'soon' | 'highlight' | 'rank';

const tones: Record<Tone, { bg: string; border: string; text: string }> = {
    sample: { bg: colors.surfaceSunken, border: colors.border, text: colors.text },
    community: { bg: colors.surfaceTint, border: colors.actionStrong, text: colors.outline },
    live: { bg: colors.success, border: colors.outline, text: palette.white },
    soon: { bg: colors.stale, border: colors.outline, text: palette.white },
    highlight: { bg: colors.highlight, border: colors.outline, text: colors.outline },
    rank: { bg: colors.action, border: colors.outline, text: colors.onAction },
};

// Silkscreen micro tag: SAMPLE, COMMUNITY, SOON, BEST NET SAVE…
export const Tag: React.FC<{ label: string; tone?: Tone; style?: StyleProp<ViewStyle> }> = ({ label, tone = 'sample', style }) => {
    const look = tones[tone];
    return (
        <View style={[styles.tag, { backgroundColor: look.bg, borderColor: look.border }, style]}>
            <Text style={[type.tag, { color: look.text }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tag: { alignSelf: 'flex-start', paddingHorizontal: 6, borderWidth: 2 },
});
