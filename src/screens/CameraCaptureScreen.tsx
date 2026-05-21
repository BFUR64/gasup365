import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../services/firebase';
import { getMissingGasStationFields, type Coordinates, type ParsedGasStationText } from '../services/gasStationParser';
import { processGasStationCapture } from '../services/receiptOcr';
import { colors } from '../theme/colors';

const emptyParsedText: ParsedGasStationText = {
  stationName: null,
  address: null,
  location: null,
  fuels: [],
  rawText: '',
};

export const CameraCaptureScreen: React.FC = () => {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [stationName, setStationName] = useState('');
  const [address, setAddress] = useState('');
  const [diesel, setDiesel] = useState('');
  const [unleaded, setUnleaded] = useState('');
  const [premium, setPremium] = useState('');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<Coordinates | null>(null);
  const [parsedText, setParsedText] = useState<ParsedGasStationText>(emptyParsedText);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const missingFields = useMemo(() => getMissingGasStationFields(parsedText), [parsedText]);

  const captureAndParse = async () => {
    if (isScanning) return;

    setIsScanning(true);

    try {
      if (!cameraPermission?.granted) {
        const nextPermission = await requestCameraPermission();
        if (!nextPermission.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access to scan a receipt or price board.');
          return;
        }
      }

      const photo = await cameraRef?.takePictureAsync({ quality: 0.82, exif: true });
      if (!photo?.uri) {
        Alert.alert('Camera not ready', 'Please wait for the camera preview, then try again.');
        return;
      }

      const fallbackLocation = await getDeviceLocation();
      const parsed = await processGasStationCapture(
        { uri: photo.uri, exif: photo.exif as Record<string, unknown> | null },
        { fallbackLocation },
      );

      const fuelByType = new Map(parsed.fuels.map((fuel) => [fuel.type, fuel.price.toFixed(2)]));

      setCapturedImageUri(photo.uri);
      setCapturedLocation(parsed.location || fallbackLocation);
      setParsedText(parsed);
      setStationName(parsed.stationName || '');
      setAddress(parsed.address || '');
      setDiesel(fuelByType.get('diesel') || '');
      setUnleaded(fuelByType.get('unleaded') || '');
      setPremium(fuelByType.get('special') || '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The OCR scan failed. You can still enter the values manually.';
      Alert.alert('Unable to scan text', message);
    } finally {
      setIsScanning(false);
    }
  };

  const submitUpdate = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const markerLocation = capturedLocation || (await getDeviceLocation());
      if (!markerLocation) {
        Alert.alert('Location needed', 'Allow location access or scan an image with GPS metadata before saving.');
        return;
      }

      const title = stationName.trim() || 'GasUp365 station update';
      const descriptionParts = [
        address.trim() || 'Current location',
        diesel.trim() ? `Diesel P${diesel.trim()}` : '',
        unleaded.trim() ? `Unleaded P${unleaded.trim()}` : '',
        premium.trim() ? `Premium P${premium.trim()}` : '',
      ].filter(Boolean);

      await addDoc(collection(db, 'markers'), {
        latitude: markerLocation.latitude,
        longitude: markerLocation.longitude,
        title,
        description: descriptionParts.join(' | '),
        imageUrl: capturedImageUri || 'https://placehold.co/640x480/F97316/FFFFFF?text=GasUp365',
        ocrRawText: parsedText.rawText || null,
        fuelPrices: {
          diesel: toPriceOrNull(diesel),
          unleaded: toPriceOrNull(unleaded),
          premium: toPriceOrNull(premium),
        },
        address: address.trim() || null,
        timestamp: serverTimestamp(),
      });

      setStationName('');
      setAddress('');
      setDiesel('');
      setUnleaded('');
      setPremium('');
      setCapturedImageUri(null);
      setCapturedLocation(null);
      setParsedText(emptyParsedText);
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
        <Text style={styles.headerTitle}>Scan Fuel Price</Text>
        <Text style={styles.headerSub}>Capture a receipt, price board, or pump display</Text>
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

        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.submitButtonDisabled]}
          onPress={captureAndParse}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="zap" size={18} color="white" />
              <Text style={styles.scanButtonText}>Scan Text and Prefill</Text>
            </>
          )}
        </TouchableOpacity>

        {parsedText.rawText ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Review extracted data</Text>
            <Text style={styles.noticeText} selectable>
              {buildReviewMessage(missingFields)}
            </Text>
          </View>
        ) : null}

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
            placeholder="Roxas Avenue, Kalibo, Aklan"
            placeholderTextColor={colors.muted}
            value={address}
            onChangeText={setAddress}
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
              <Text style={styles.label}>Special / Premium</Text>
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

        {parsedText.rawText ? (
          <View style={styles.rawTextCard}>
            <Text style={styles.label}>Raw OCR Text</Text>
            <Text style={styles.rawText} selectable>
              {parsedText.rawText}
            </Text>
          </View>
        ) : null}
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

const getDeviceLocation = async (): Promise<Coordinates | null> => {
  const locationPermission = await Location.requestForegroundPermissionsAsync();
  if (locationPermission.status !== 'granted') return null;

  const currentLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude,
  };
};

const toPriceOrNull = (value: string) => {
  const price = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(price) ? price : null;
};

const buildReviewMessage = (missingFields: ReturnType<typeof getMissingGasStationFields>) => {
  const missingLabels = [
    missingFields.stationName ? 'station name' : '',
    missingFields.address ? 'address' : '',
    missingFields.location ? 'GPS location' : '',
    missingFields.unleaded ? 'unleaded price' : '',
    missingFields.special ? 'special/premium price' : '',
    missingFields.diesel ? 'diesel price' : '',
  ].filter(Boolean);

  if (!missingLabels.length) {
    return 'Everything important was detected. Please confirm the fields before saving.';
  }

  return `Please fill or verify: ${missingLabels.join(', ')}.`;
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
  scanButton: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
    paddingVertical: 13,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonText: { color: 'white', fontWeight: '800' },
  formCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  noticeCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  noticeTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  noticeText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  rawTextCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  rawText: { color: colors.text, fontSize: 12, lineHeight: 18 },
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
