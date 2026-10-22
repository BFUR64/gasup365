import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, palette } from '../../theme/colors';
import { fonts, type } from '../../theme/tokens';
import { PixelIcon } from './PixelIcon';

const STEPS = ['Snap', 'Review', 'Share'];
const DASHES = 14;

// ① Snap · ② Review · ③ Share, joined by a dashed pixel path.
export const Stepper: React.FC<{ current: number }> = ({ current }) => (
    <View accessibilityRole="progressbar" accessibilityLabel={`Step ${current + 1} of 3: ${STEPS[current]}`} style={styles.row}>
        <View style={styles.path}>
            {Array.from({ length: DASHES }, (_, index) => (
                <View
                    key={index}
                    style={[styles.dash, { backgroundColor: index < (DASHES / 2) * current ? colors.success : colors.border }]}
                />
            ))}
        </View>
        {STEPS.map((label, index) => {
            const done = index < current;
            const active = index === current;
            return (
                <View key={label} style={styles.step}>
                    <View style={[styles.node, done && styles.nodeDone, active && styles.nodeActive]}>
                        {done ? (
                            <PixelIcon name="check" size={20} color={palette.white} />
                        ) : (
                            <Text style={[styles.nodeText, { color: active ? colors.onAction : colors.textMuted }]}>{index + 1}</Text>
                        )}
                    </View>
                    <Text style={[active ? type.bodyStrong : type.bodyMd, { color: index > current ? colors.textMuted : colors.text }]}>
                        {label}
                    </Text>
                </View>
            );
        })}
    </View>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 14 },
    path: {
        position: 'absolute',
        left: 68,
        right: 68,
        top: 30,
        height: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dash: { width: 8, height: 4 },
    step: { width: 72, alignItems: 'center', gap: 4 },
    node: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceSunken,
        borderWidth: 2,
        borderColor: colors.border,
    },
    nodeDone: { backgroundColor: colors.success, borderColor: colors.outline },
    nodeActive: { backgroundColor: colors.action, borderColor: colors.outline, boxShadow: '0px 0px 0px 3px #FFD54A' },
    nodeText: { fontFamily: fonts.display700, fontSize: 18, lineHeight: 22 },
});
