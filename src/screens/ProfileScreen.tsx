import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dialog } from '../components/ui/Dialog';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelIcon, Sprite } from '../components/ui/PixelIcon';
import { Tag } from '../components/ui/Tag';
import { auth } from '../firebaseservices/firebase';
import { useReducedMotion } from '../hooks/useLayout';
import { SMART_ROUTE_EXPLAINER } from '../services/stationPresentation';
import { colors, palette } from '../theme/colors';
import { pixel } from '../theme/pixel';
import { type } from '../theme/tokens';
import { IconName } from '../ui/icons';
import { art } from '../ui/pixelArt';

// Stats show "—" until FEAT-003 wires users/{uid}; the honesty rule in
// DESIGN-002 §5.10 forbids invented numbers.
const STATS: { label: string; icon: IconName; color: string }[] = [
    { label: 'Updates', icon: 'camera', color: colors.outline },
    { label: 'Coins', icon: 'coin', color: palette.yellow700 },
    { label: 'Trust', icon: 'rewards', color: colors.border },
];

const BADGES = ['First Scan', 'Photo Pro', '???', '???'];

const SOON_ITEMS: { label: string; icon: IconName }[] = [
    { label: 'Saved locations', icon: 'pin' },
    { label: 'Notifications', icon: 'bell' },
    { label: 'Price alerts', icon: 'trendDown' },
    { label: 'Settings', icon: 'settings' },
    { label: 'Help & support', icon: 'help' },
];

// Me: the character sheet (DESIGN-002 §7.7).
export const ProfileScreen: React.FC = () => {
    const router = useRouter();
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const displayName = auth.currentUser?.displayName || 'GasUp365 Driver';

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <ProfileScene />

                <View style={styles.body}>
                    <View style={[pixel.panel, styles.card]}>
                        <View style={styles.identity}>
                            <View accessibilityLabel="Your avatar" style={styles.avatar}>
                                <Sprite art={art.avatar} width={64} height={64} />
                            </View>
                            <View style={styles.flex}>
                                <Text accessibilityRole="header" style={[type.displayLg, { color: colors.text }]}>
                                    {displayName}
                                </Text>
                                <Tag label="Rookie spotter" tone="rank" style={styles.rankTag} />
                            </View>
                        </View>
                        <View style={styles.xp}>
                            <View style={styles.xpHeader}>
                                <Text style={[type.tag, { color: colors.text }]}>XP</Text>
                                <Text style={[type.captionStrong, { color: colors.textMuted }]}>Share prices to rank up</Text>
                            </View>
                            <View style={styles.xpTrack} />
                        </View>
                    </View>

                    <View style={styles.stats}>
                        {STATS.map((stat) => (
                            <View key={stat.label} accessibilityLabel={`${stat.label}: not tracked yet`} style={[pixel.slot, styles.stat]}>
                                <PixelIcon name={stat.icon} size={24} color={stat.color} />
                                <Text style={[type.priceLg, { color: colors.text }]}>—</Text>
                                <Text style={[type.tag, { color: colors.textMuted }]}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.prompt}>
                        <Text style={[type.bodyStrong, styles.flex, { color: colors.text }]}>
                            Share your first price to earn your first badge!
                        </Text>
                        <PixelButton label="Scan" size="sm" onPress={() => router.navigate('/add')} />
                    </View>

                    <View accessibilityLabel="Badges" style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text accessibilityRole="header" style={[type.tag, { color: colors.text }]}>
                                Badges
                            </Text>
                            <Text style={[type.caption, { color: colors.textMuted }]}>Coming soon</Text>
                        </View>
                        <View style={styles.badges}>
                            {BADGES.map((badge, index) => (
                                <View key={index} accessibilityLabel={`${badge === '???' ? 'Hidden badge' : badge}, locked`} style={styles.badge}>
                                    <View style={styles.badgeFrame}>
                                        <PixelIcon name="lock" size={32} color={colors.border} />
                                    </View>
                                    <Text style={[type.caption, styles.badgeText]}>{badge}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[pixel.panel, styles.menu]}>
                        {SOON_ITEMS.map((item, index) => (
                            <View
                                key={item.label}
                                accessibilityLabel={`${item.label}, coming soon`}
                                accessibilityState={{ disabled: true }}
                                style={[styles.row, index > 0 && styles.rowDivider]}
                            >
                                <PixelIcon name={item.icon} size={24} color={colors.border} />
                                <Text style={[type.bodyLg, styles.flex, { color: colors.textMuted }]}>{item.label}</Text>
                                <Tag label="Soon" tone="soon" />
                            </View>
                        ))}
                        <Pressable accessibilityRole="button" onPress={() => setAboutOpen(true)} style={[styles.row, styles.rowDivider]}>
                            <PixelIcon name="info" size={24} />
                            <Text style={[type.bodyLg, styles.flex, { color: colors.text }]}>About GasUp365</Text>
                            <PixelIcon name="chevronRight" size={16} />
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={() => setConfirmSignOut(true)} style={[styles.row, styles.rowDivider]}>
                            <PixelIcon name="logOut" size={24} color={colors.danger} />
                            <Text style={[type.bodyLg, styles.flex, { color: colors.danger }]}>Sign out</Text>
                        </Pressable>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[type.tag, { color: colors.textMuted }]}>GasUp365 v1.0.0</Text>
                        <Text style={[type.caption, styles.footerText]}>Empowering Filipino drivers, one update at a time</Text>
                    </View>
                </View>
            </ScrollView>

            <Dialog
                visible={confirmSignOut}
                title="Sign out?"
                body="Your shared prices stay on the map."
                onRequestClose={() => setConfirmSignOut(false)}
                actions={[
                    { label: 'Stay', onPress: () => setConfirmSignOut(false) },
                    {
                        label: 'Sign out',
                        variant: 'danger',
                        onPress: () => {
                            setConfirmSignOut(false);
                            signOut(auth);
                        },
                    },
                ]}
            />

            <Dialog
                visible={aboutOpen}
                title="About GasUp365"
                body="Drivers in Kalibo share fuel prices by scanning station price boards, so everyone can find a better fuel stop."
                onRequestClose={() => setAboutOpen(false)}
                actions={[{ label: 'Close', variant: 'primary', onPress: () => setAboutOpen(false) }]}
            >
                <Text style={[type.tag, { color: colors.text }]}>How Smart Route works</Text>
                <Text style={[type.bodyMd, { color: colors.textMuted }]}>{SMART_ROUTE_EXPLAINER}</Text>
                <Text style={[type.bodyMd, { color: colors.textMuted }]}>
                    Prices are shared by the community. Always confirm at the pump.
                </Text>
                <Text style={[type.caption, { color: colors.textMuted }]}>Map data © OpenStreetMap contributors</Text>
            </Dialog>
        </View>
    );
};

// Sky, drifting cloud, hills and a little town (parallax mini-scene).
const ProfileScene: React.FC = () => {
    const reduced = useReducedMotion();
    const drift = useRef(new Animated.Value(-80)).current;

    useEffect(() => {
        if (reduced) return;
        const loop = Animated.loop(Animated.timing(drift, { toValue: 470, duration: 52000, easing: Easing.linear, useNativeDriver: true }));
        loop.start();
        return () => loop.stop();
    }, [drift, reduced]);

    return (
        <View pointerEvents="none" style={styles.scene}>
            <View style={styles.sceneSkyTop} />
            <Animated.View style={[styles.sceneCloud, { transform: [{ translateX: drift }] }]}>
                <Sprite art={art.cloud} width={64} height={24} />
            </Animated.View>
            <View style={styles.sceneSea} />
            <View style={styles.sceneHills}>
                <Sprite art={art.hills} width={390} height={72} />
                <Sprite art={art.hills} width={390} height={72} />
            </View>
            <Sprite art={art.palm} width={36} height={45} style={styles.scenePalm} />
            <Sprite art={art.nipaHut} width={48} height={36} style={styles.sceneHut} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scroll: { paddingBottom: 24 },
    flex: { flex: 1, minWidth: 0 },
    scene: {
        height: 196,
        overflow: 'hidden',
        backgroundColor: palette.sky300,
        borderBottomWidth: 4,
        borderBottomColor: palette.grass700,
    },
    sceneSkyTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 70, backgroundColor: palette.sky400 },
    sceneCloud: { position: 'absolute', top: 64, left: 0 },
    sceneSea: { position: 'absolute', left: 0, right: 0, top: 150, height: 10, backgroundColor: palette.sky600 },
    sceneHills: { position: 'absolute', top: 124, left: 0, flexDirection: 'row' },
    scenePalm: { position: 'absolute', top: 132, right: 24 },
    sceneHut: { position: 'absolute', top: 150, right: 70 },
    body: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 16, marginTop: -56, gap: 16 },
    card: { padding: 12, gap: 12 },
    identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
        width: 80,
        height: 80,
        marginTop: -40,
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        backgroundColor: palette.sky300,
        borderWidth: 2,
        borderColor: colors.outline,
        boxShadow: 'inset -2px -2px 0px #4A90E2, 0px 4px 0px rgba(59, 26, 8, 0.35)',
    },
    rankTag: { marginTop: 4 },
    xp: { gap: 6 },
    xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    xpTrack: { height: 22, borderWidth: 2, borderColor: colors.outline, backgroundColor: colors.surfaceSunken },
    stats: { flexDirection: 'row', gap: 8 },
    stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 10 },
    prompt: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: colors.surfaceTint,
        borderWidth: 2,
        borderColor: colors.outline,
    },
    section: { gap: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badges: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    badge: { flex: 1, alignItems: 'center', gap: 4 },
    badgeFrame: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceSunken,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.border,
    },
    badgeText: { color: colors.textMuted, textAlign: 'center' },
    menu: { overflow: 'hidden' },
    row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
    rowDivider: { borderTopWidth: 2, borderTopColor: colors.divider },
    footer: { alignItems: 'center', gap: 2 },
    footerText: { color: colors.textMuted, textAlign: 'center' },
});
