import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../services/firebase';
import {
  getMissingGasStationFields,
  type Coordinates,
  type FuelType,
  type ParsedGasStationText,
} from '../services/gasStationParser';
import { processGasStationCapture } from '../services/receiptOcr';
import { colors } from '../theme/colors';

const emptyParsedText: ParsedGasStationText = {
  stationName: null,
  address: null,
  location: null,
  fuels: [],
  rawText: '',
};

const cloudinaryCloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzisx3ntp';
const cloudinaryUploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'pictures';
const placeholderImageUrl = 'https://placehold.co/640x480/F97316/FFFFFF?text=GasUp365';
const parserName = 'expo-text-recognition + gas-station-keyword-nlp';
const isWeb = Platform.OS === 'web';

type CapturedGasStationScan = {
  parsed: ParsedGasStationText;
  imageUri: string;
  location: Coordinates | null;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
};

const uploadImageToCloudinary = async (localUri: string): Promise<CloudinaryUploadResponse> => {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error('Cloudinary is missing EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME or EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }

  const formData = new FormData();
  const uploadFile = {
    uri: localUri,
    type: 'image/jpeg',
    name: `gasup365-${Date.now()}.jpg`,
  };

  formData.append('file', uploadFile as unknown as Blob);
  formData.append('upload_preset', cloudinaryUploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(parseCloudinaryError(responseText));
  }

  const uploadResult = JSON.parse(responseText) as CloudinaryUploadResponse;
  if (!uploadResult.secure_url) {
    throw new Error('Cloudinary upload succeeded but did not return a secure image URL.');
  }

  return uploadResult;
};

export const CameraCaptureScreen: React.FC = () => {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
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
  const extractionSummary = useMemo(() => buildExtractionSummary(parsedText, missingFields), [missingFields, parsedText]);

  const captureAndParse = async (): Promise<CapturedGasStationScan | null> => {
    if (isScanning) return null;

    if (isWeb) {
      Alert.alert('OCR unavailable on web', 'Camera OCR is not available on web. Please use the mobile app.');
      return null;
    }

    setIsScanning(true);

    try {
      const canUseCamera = await ensureCameraPermission();
      if (!canUseCamera) return null;

      if (!cameraRef.current || !isCameraReady) {
        Alert.alert('Camera not ready', 'Please wait for the camera preview, then try again.');
        return null;
      }

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.82, exif: true });
      if (!photo?.uri) {
        Alert.alert('Capture failed', 'No image was returned from the camera.');
        return null;
      }

      const fallbackLocation = await getDeviceLocation();
      const parsed = await processGasStationCapture(
        { uri: photo.uri, exif: photo.exif as Record<string, unknown> | null },
        { fallbackLocation },
      );

      applyParsedCapture(parsed, photo.uri, fallbackLocation);
      return { parsed, imageUri: photo.uri, location: parsed.location || fallbackLocation };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The OCR scan failed. You can still enter the values manually.';
      Alert.alert('Unable to scan text', message);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const submitUpdate = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      let parsedForSave = parsedText;
      let imageUriForSave = capturedImageUri;
      let locationForSave = capturedLocation;
      if (!parsedForSave.rawText && !hasAnyManualPrice()) {
        const capture = await captureAndParse();
        if (capture) {
          parsedForSave = capture.parsed;
          imageUriForSave = capture.imageUri;
          locationForSave = capture.location;
        }
      }

      const markerLocation = locationForSave || parsedForSave.location || (await getDeviceLocation());
      if (!markerLocation) {
        Alert.alert('Location needed', 'Allow location access so GasUp365 can place this marker on the map.');
        return;
      }

      const fuelPrices = {
        diesel: toPriceOrNull(diesel),
        unleaded: toPriceOrNull(unleaded),
        premium: toPriceOrNull(premium),
      };

      if (!fuelPrices.diesel && !fuelPrices.unleaded && !fuelPrices.premium) {
        Alert.alert('Fuel price needed', 'Scan the price board or enter at least one fuel price before saving.');
        return;
      }

      const title = stationName.trim() || parsedForSave.stationName || 'GasUp365 station update';
      const markerAddress = address.trim() || parsedForSave.address || 'Current location';
      const descriptionParts = [
        markerAddress,
        fuelPrices.diesel ? `Diesel P${fuelPrices.diesel.toFixed(2)}` : '',
        fuelPrices.unleaded ? `Unleaded P${fuelPrices.unleaded.toFixed(2)}` : '',
        fuelPrices.premium ? `Premium P${fuelPrices.premium.toFixed(2)}` : '',
      ].filter(Boolean);
      const cloudinaryImage = imageUriForSave ? await uploadImageToCloudinary(imageUriForSave) : null;

      await addDoc(collection(db, 'markers'), {
        latitude: markerLocation.latitude,
        longitude: markerLocation.longitude,
        title,
        description: descriptionParts.join(' | '),
        imageUrl: cloudinaryImage?.secure_url || placeholderImageUrl,
        imageStorage: cloudinaryImage ? 'cloudinary' : 'placeholder',
        cloudinaryPublicId: cloudinaryImage?.public_id || null,
        prices: fuelPrices,
        source: 'camera-ocr',
        ocr: {
          parser: parserName,
          rawText: parsedForSave.rawText,
          extractedFuels: parsedForSave.fuels,
          missingFields: getMissingGasStationFields(parsedForSave),
        },
        timestamp: serverTimestamp(),
      });

      resetForm();
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try adding the marker again.';
      Alert.alert('Unable to save', message);
    } finally {
      setIsSaving(false);
    }
  };

  const ensureCameraPermission = async () => {
    if (cameraPermission?.granted) return true;

    const nextPermission = await requestCameraPermission();
    if (!nextPermission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access to scan a station price board.');
      return false;
    }

    return true;
  };

  const applyParsedCapture = (
    parsed: ParsedGasStationText,
    imageUri: string,
    fallbackLocation: Coordinates | null,
  ) => {
    const fuelByType = new Map<FuelType, string>(parsed.fuels.map((fuel) => [fuel.type, fuel.price.toFixed(2)]));

    setCapturedImageUri(imageUri);
    setCapturedLocation(parsed.location || fallbackLocation);
    setParsedText(parsed);
    setStationName(parsed.stationName || '');
    setAddress(parsed.address || '');
    setDiesel(fuelByType.get('diesel') || '');
    setUnleaded(fuelByType.get('unleaded') || '');
    setPremium(fuelByType.get('special') || '');
  };

  const hasAnyManualPrice = () => Boolean(diesel.trim() || unleaded.trim() || premium.trim());

  const resetForm = () => {
    setStationName('');
    setAddress('');
    setDiesel('');
    setUnleaded('');
    setPremium('');
    setCapturedImageUri(null);
    setCapturedLocation(null);
    setParsedText(emptyParsedText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Station Update</Text>
        <Text style={styles.headerSub}>Scan a fuel board, review OCR + NLP results, then save to the live map.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.capturePanel}>
          {isWeb ? (
            <View style={styles.webUnavailablePanel}>
              <View style={styles.iconCircle}>
                <Feather name="smartphone" size={28} color={colors.primaryDark} />
              </View>
              <Text style={styles.panelTitle}>Mobile OCR only</Text>
              <Text style={styles.panelText}>Camera OCR is not available on web. Please use the mobile app.</Text>
            </View>
          ) : cameraPermission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.cameraPreview}
              facing="back"
              mode="picture"
              autofocus="off"
              onCameraReady={() => setIsCameraReady(true)}
              onMountError={(event) => Alert.alert('Camera error', event.message)}
            />
          ) : (
            <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
              <View style={styles.iconCircle}>
                <Feather name="camera" size={28} color={colors.primaryDark} />
              </View>
              <Text style={styles.panelTitle}>Enable camera</Text>
              <Text style={styles.panelText}>Take a photo and extract fuel prices with on-device OCR.</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.ocrCard}>
          <View style={styles.ocrHeader}>
            <View style={styles.ocrTextBlock}>
              <Text style={styles.label}>OCR + NLP</Text>
              <Text style={styles.ocrSummary}>{extractionSummary}</Text>
            </View>
            <TouchableOpacity
              style={[styles.scanButton, (isScanning || isSaving) && styles.submitButtonDisabled]}
              onPress={captureAndParse}
              disabled={isWeb || isScanning || isSaving}
            >
              {isScanning ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Feather name="zap" size={16} color="white" />
                  <Text style={styles.scanButtonText}>Scan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {parsedText.rawText ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Review extracted data</Text>
              <Text style={styles.noticeText} selectable>
                {buildReviewMessage(missingFields)}
              </Text>
            </View>
          ) : null}
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
        style={[styles.submitButton, (isSaving || isScanning) && styles.submitButtonDisabled]}
        onPress={submitUpdate}
        disabled={isSaving || isScanning}
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
  return Number.isFinite(price) && price > 0 ? price : null;
};

const parseCloudinaryError = (responseText: string) => {
  if (!responseText.trim()) return 'Cloudinary upload failed with an empty response.';

  try {
    const payload = JSON.parse(responseText) as { error?: { message?: string } };
    return payload.error?.message ? `Cloudinary upload failed: ${payload.error.message}` : 'Cloudinary upload failed.';
  } catch {
    return `Cloudinary upload failed: ${responseText}`;
  }
};

const buildExtractionSummary = (
  parsed: ParsedGasStationText,
  missingFields: ReturnType<typeof getMissingGasStationFields>,
) => {
  if (!parsed.rawText) return 'Ready to scan a station board or receipt.';

  const foundFuelLabels = parsed.fuels.map((fuel) => fuel.type).join(', ');
  const missingCount = Object.values(missingFields).filter(Boolean).length;
  const foundText = foundFuelLabels ? `Found ${foundFuelLabels}` : 'No fuel prices found';
  return missingCount ? `${foundText}. ${missingCount} item(s) need review.` : `${foundText}. Ready to save.`;
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
  webUnavailablePanel: {
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
  ocrCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  formCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  ocrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ocrTextBlock: { flex: 1 },
  ocrSummary: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 4 },
  scanButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  scanButtonText: { color: 'white', fontSize: 12, fontWeight: '800' },
  noticeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.primarySoft,
  },
  noticeTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  noticeText: { color: colors.muted, fontSize: 12, marginTop: 4 },
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
  rawTextCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  rawText: { color: colors.text, fontSize: 12, lineHeight: 18 },
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
