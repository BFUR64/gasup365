// screens/CameraCaptureScreen.tsx
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export const CameraCaptureScreen: React.FC = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const cameraRef = useRef<CameraView>(null);

    // Request permission if not granted
    if (permission && !permission.granted && !permission.canAskAgain) {
        return (
        <View style={styles.centered}>
            <Text>Camera permission is required to capture fuel prices.</Text>
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
        </View>
        );
    }

    if (permission && !permission.granted) {
        return (
        <View style={styles.centered}>
            <Text>We need camera access to capture price boards.</Text>
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
            </TouchableOpacity>
        </View>
        );
    }

    if (!permission) {
        return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <Text>Loading camera...</Text>
        </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && cameraReady) {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        setProcessing(true);
        // Simulate OCR (replace with real API)
        setTimeout(() => {
            setProcessing(false);
            setExtractedData({
            stationName: 'Petron Station - Commonwealth',
            location: 'Commonwealth Ave, Quezon City',
            prices: { diesel: '62.50', unleaded: '65.20', premium: '75.80' },
            });
        }, 2000);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        });
        if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setExtractedData({
            stationName: 'Petron Station - Commonwealth',
            location: 'Commonwealth Ave, Quezon City',
            prices: { diesel: '62.50', unleaded: '65.20', premium: '75.80' },
            });
        }, 2000);
        }
    };

    const updatePrice = (fuelType: string, value: string) => {
        setExtractedData((prev: any) => ({
        ...prev,
        prices: { ...prev.prices, [fuelType]: value },
        }));
    };

    const updateField = (field: string, value: string) => {
        setExtractedData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleReset = () => {
        setCapturedImage(null);
        setProcessing(false);
        setExtractedData(null);
    };

    const handleSubmit = () => {
        Alert.alert('Success', 'Price submitted! Thank you for contributing to the community.');
        handleReset();
    };

    if (!capturedImage) {
        return (
        <View style={styles.container}>
            <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Fuel Price</Text>
            <Text style={styles.headerSub}>Help the community by sharing current prices</Text>
            </View>
            <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
            >
            <View style={styles.overlay}>
                <View style={styles.guideBox} />
            </View>
            </CameraView>
            <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
                <Feather name="image" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <Feather name="camera" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
                <Feather name="refresh-cw" size={24} color={colors.text} />
            </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Tap the camera button to capture the price board</Text>
        </View>
        );
    }

    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Review & Submit</Text>
            <TouchableOpacity onPress={handleReset}>
            <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
        </View>
        <View style={styles.imagePreview}>
            <Feather name="image" size={40} color="white" />
            <Text style={styles.imagePreviewText}>Captured Image</Text>
        </View>
        <ScrollView style={styles.formContainer}>
            {processing ? (
            <View style={styles.processing}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.processingText}>Processing Image...</Text>
                <Text style={styles.processingSub}>Extracting prices using OCR technology</Text>
            </View>
            ) : extractedData ? (
            <>
                <View style={styles.inputGroup}>
                <Text style={styles.label}>Station Name</Text>
                <TextInput
                    style={styles.input}
                    value={extractedData.stationName}
                    onChangeText={text => updateField('stationName', text)}
                />
                </View>
                <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.input}
                    value={extractedData.location}
                    onChangeText={text => updateField('location', text)}
                />
                </View>
                <View style={styles.card}>
                <Text style={styles.cardTitle}>Fuel Prices (per Liter)</Text>
                {Object.entries(extractedData.prices).map(([fuel, price]) => (
                    <View key={fuel} style={styles.priceRow}>
                    <Text style={styles.fuelLabel}>{fuel.charAt(0).toUpperCase() + fuel.slice(1)}</Text>
                    <View style={styles.priceInputContainer}>
                        <Text style={styles.currency}>₱</Text>
                        <TextInput
                        style={styles.priceInput}
                        value={price as string}
                        onChangeText={text => updatePrice(fuel, text)}
                        keyboardType="numeric"
                        />
                    </View>
                    </View>
                ))}
                </View>
                <View style={styles.infoBox}>
                <Text style={styles.infoText}>Please verify the extracted prices are correct before submitting.</Text>
                </View>
            </>
            ) : null}
        </ScrollView>
        {extractedData && !processing && (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Feather name="check" size={20} color="white" />
            <Text style={styles.submitText}>Submit Price Update</Text>
            </TouchableOpacity>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
    permissionButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    permissionButtonText: { color: 'white', fontWeight: 'bold' },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    camera: { flex: 1, marginTop: 0 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    guideBox: {
        width: '80%',
        height: '70%',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    controlButton: { padding: 12, backgroundColor: colors.accent, borderRadius: 40 },
    captureButton: { padding: 18, backgroundColor: colors.primary, borderRadius: 50 },
    hint: { textAlign: 'center', padding: 16, fontSize: 12, color: colors.muted },
    imagePreview: {
        height: 180,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePreviewText: { color: 'white', marginTop: 8 },
    formContainer: { flex: 1, padding: 16 },
    processing: { alignItems: 'center', paddingVertical: 40 },
    processingText: { marginTop: 16, fontSize: 16, fontWeight: '500' },
    processingSub: { marginTop: 8, fontSize: 12, color: colors.muted },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 12, color: colors.muted, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, backgroundColor: colors.card },
    card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, backgroundColor: colors.card, marginBottom: 16 },
    cardTitle: { fontWeight: '600', marginBottom: 12 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    fuelLabel: { fontSize: 14, flex: 1 },
    priceInputContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    currency: { marginRight: 4, fontSize: 14 },
    priceInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, width: 80, textAlign: 'center' },
    infoBox: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 24 },
    infoText: { fontSize: 12, color: '#1E40AF' },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        margin: 16,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    submitText: { color: 'white', fontWeight: '600' },
});