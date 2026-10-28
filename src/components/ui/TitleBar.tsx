import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { shadow, type } from '../../theme/tokens';

// Orange pixel title bar for every non-map screen (DESIGN-002 §6.24).
export const TitleBar: React.FC<{ title: string; subtitle?: string; insetTop?: boolean }> = ({ title, subtitle, insetTop = true }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.bar, { paddingTop: (insetTop ? insets.top : 0) + 12 }]}>
            <Text accessibilityRole="header" style={[type.displayMd, styles.text]}>
                {title}
            </Text>
            {subtitle ? <Text style={[type.bodyStrong, styles.text]}>{subtitle}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: colors.action,
        borderBottomWidth: 2,
        borderBottomColor: colors.outline,
        boxShadow: `inset 0px -4px 0px #C2410C, ${shadow.drop}`,
        zIndex: 1,
    },
    text: { color: colors.onAction },
});
