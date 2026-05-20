import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../services/firebase';
import { colors } from '../theme/colors';

export const CameraCaptureScreen: React.FC = () => {
    const router = useRouter();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
    const [stationName, setStationName] = useState('');
    const [location, setLocation] = useState('');
    const [diesel, setDiesel] = useState('');
    const [unleaded, setUnleaded] = useState('');
    const [premium, setPremium] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const submitUpdate = async () => {
        if (isSaving) return;

        setIsSaving(true);

        try {
            if (!cameraPermission?.granted) {
                const nextPermission = await requestCameraPermission();
                if (!nextPermission.granted) {
                    Alert.alert('Camera permission needed', 'Allow camera access to add a live map marker.');
                    return;
                }
            }

            const locationPermission = await Location.requestForegroundPermissionsAsync();
            if (locationPermission.status !== 'granted') {
                Alert.alert('Location permission denied', 'Allow location access so GasUp365 can place this marker on the map.');
                return;
            }

            const photo = await cameraRef?.takePictureAsync({ quality: 0.7 });
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const title = stationName.trim() || 'GasUp365 station update';
            const descriptionParts = [
                location.trim() || 'Current location',
                diesel.trim() ? `Diesel P${diesel.trim()}` : '',
                unleaded.trim() ? `Unleaded P${unleaded.trim()}` : '',
                premium.trim() ? `Premium P${premium.trim()}` : '',
            ].filter(Boolean);

            await addDoc(collection(db, 'markers'), {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                title,
                description: descriptionParts.join(' | '),
                imageUrl: photo?.uri || 'https://placehold.co/640x480/F97316/FFFFFF?text=GasUp365',
                timestamp: serverTimestamp(),
            });

            setStationName('');
            setLocation('');
            setDiesel('');
            setUnleaded('');
            setPremium('');
            router.back();
        } catch {
            Alert.alert('Unable to save', 'Please try adding the marker again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Fuel Price</Text>
                <Text style={styles.headerSub}>Share a quick GasUp365 station update</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.capturePanel}>
                    {cameraPermission?.granted ? (
                        <CameraView ref={setCameraRef} style={styles.cameraPreview} facing="back" />
                    ) : (
                        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
                            <View style={styles.iconCircle}>
                                <Feather name="camera" size={28} color={colors.primaryDark} />
                            </View>
                            <Text style={styles.panelTitle}>Enable camera</Text>
                            <Text style={styles.panelText}>Take a photo and pin this update to your current location.</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Station Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Petron Kalibo"
                        placeholderTextColor={colors.muted}
                        value={stationName}
                        onChangeText={setStationName}
                    />

                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Kalibo, Aklan, Philippines"
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

            <TouchableOpacity
                style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                onPress={submitUpdate}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Feather name="map-pin" size={20} color="white" />
                        <Text style={styles.submitText}>Save Live Map Marker</Text>
                    </>
                )}
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
        overflow: 'hidden',
    },
    cameraPreview: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: colors.text,
    },
    permissionButton: {
        width: '100%',
        alignItems: 'center',
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
    submitButtonDisabled: { opacity: 0.62 },
    submitText: { color: 'white', fontWeight: '700' },
});
