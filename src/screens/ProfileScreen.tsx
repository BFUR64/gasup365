import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; badge?: string }> = ({ icon, label, badge }) => (
    <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuLeft}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
        {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
        <Feather name="chevron-right" size={16} color={colors.muted} />
    </TouchableOpacity>
);

export const ProfileScreen: React.FC = () => {
    return (
        <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.name}>Juan Dela Cruz</Text>
            <Text style={styles.role}>Community Member</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
            <View style={styles.statCard}>
            <Feather name="camera" size={16} color={colors.primary} />
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Updates</Text>
            </View>
            <View style={styles.statCard}>
            <Feather name="award" size={16} color="#EAB308" />
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
            <Feather name="star" size={16} color="#EAB308" />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
            </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
            <MenuItem icon={<Feather name="map-pin" size={20} color={colors.muted} />} label="Saved Locations" badge="3" />
            <MenuItem icon={<Feather name="bell" size={20} color={colors.muted} />} label="Notifications" />
            <MenuItem icon={<Feather name="trending-up" size={20} color={colors.muted} />} label="Price Alerts" />
            <MenuItem icon={<Feather name="settings" size={20} color={colors.muted} />} label="Settings" />
            <MenuItem icon={<Feather name="help-circle" size={20} color={colors.muted} />} label="Help & Support" />
            <MenuItem icon={<Feather name="info" size={20} color={colors.muted} />} label="About GasUp365" />
        </View>

        {/* Community Impact */}
        <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Community Impact</Text>
            <Text style={styles.impactText}>
            Your contributions have helped <Text style={styles.impactBold}>1,234 drivers</Text> save money this month!
            </Text>
            <View style={styles.impactFooter}>
            <Feather name="award" size={14} color="white" />
            <Text style={styles.impactFooterText}>Keep up the great work!</Text>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>GasUp365 v1.0.0</Text>
            <Text style={styles.footerSub}>Empowering Filipino drivers, one update at a time</Text>
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, paddingVertical: 24, alignItems: 'center' },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 28 },
    name: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 12 },
    role: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: -20, gap: 12 },
    statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border, shadowOpacity: 0.05, shadowRadius: 2 },
    statNumber: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
    statLabel: { fontSize: 10, color: colors.muted },
    menuContainer: { marginHorizontal: 16, marginTop: 20, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    menuLeft: { marginRight: 12 },
    menuLabel: { flex: 1, fontSize: 14, color: colors.text },
    badge: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    impactCard: { margin: 16, backgroundColor: '#3B82F6', borderRadius: 12, padding: 16 },
    impactTitle: { fontWeight: 'bold', color: 'white', marginBottom: 8 },
    impactText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
    impactBold: { fontWeight: 'bold' },
    impactFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    impactFooterText: { fontSize: 12, color: 'white' },
    footer: { alignItems: 'center', paddingVertical: 24, gap: 4 },
    footerText: { fontSize: 12, color: colors.muted },
    footerSub: { fontSize: 10, color: colors.muted, textAlign: 'center' },
});