import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export const CameraCaptureScreen: React.FC = () => {
    const [stationName, setStationName] = useState('');
    const [location, setLocation] = useState('');
    const [diesel, setDiesel] = useState('');
    const [unleaded, setUnleaded] = useState('');
    const [premium, setPremium] = useState('');

    const submitUpdate = () => {
        Alert.alert('Saved', 'Fuel price update added for review.');
        setStationName('');
        setLocation('');
        setDiesel('');
        setUnleaded('');
        setPremium('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Fuel Price</Text>
                <Text style={styles.headerSub}>Share a quick GasUp365 station update</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.capturePanel}>
                    <View style={styles.iconCircle}>
                        <Feather name="camera" size={28} color={colors.primaryDark} />
                    </View>
                    <Text style={styles.panelTitle}>Simple MVP update flow</Text>
                    <Text style={styles.panelText}>Enter a station and its current prices. Camera OCR can return later once the core UI is settled.</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Station Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Petron Commonwealth"
                        placeholderTextColor={colors.muted}
                        value={stationName}
                        onChangeText={setStationName}
                    />

                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Quezon City, Metro Manila"
                        placeholderTextColor={colors.muted}
                        value={location}
                        onChangeText={setLocation}
                    />

                    <View style={styles.priceGrid}>
                        <View style={styles.priceField}>
                            <Text style={styles.label}>Diesel</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="62.50"
                                placeholderTextColor={colors.muted}
                                keyboardType="numeric"
                                value={diesel}
                                onChangeText={setDiesel}
                            />
                        </View>
                        <View style={styles.priceField}>
                            <Text style={styles.label}>Unleaded</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="65.20"
                                placeholderTextColor={colors.muted}
                                keyboardType="numeric"
                                value={unleaded}
                                onChangeText={setUnleaded}
                            />
                        </View>
                        <View style={styles.priceField}>
                            <Text style={styles.label}>Premium</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="75.80"
                                placeholderTextColor={colors.muted}
                                keyboardType="numeric"
                                value={premium}
                                onChangeText={setPremium}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={submitUpdate}>
                <Feather name="check" size={20} color="white" />
                <Text style={styles.submitText}>Submit Price Update</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: 'white' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 4 },
    content: { padding: 16, paddingBottom: 116, gap: 16 },
    capturePanel: {
        alignItems: 'center',
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 18,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    panelTitle: { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
    panelText: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6 },
    formCard: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 16,
        gap: 10,
    },
    label: { fontSize: 12, color: colors.muted, fontWeight: '700' },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.card,
        color: colors.text,
    },
    priceGrid: { gap: 12, marginTop: 6 },
    priceField: { gap: 6 },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        margin: 16,
        paddingVertical: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    submitText: { color: 'white', fontWeight: '700' },
});
