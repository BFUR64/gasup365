import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RewardPopup } from '../components/RewardPopup';
import { Dialog, Toast, ToastMessage } from '../components/ui/Dialog';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelIcon } from '../components/ui/PixelIcon';
import { PixelInput } from '../components/ui/PixelInput';
import { Stepper } from '../components/ui/Stepper';
import { TitleBar } from '../components/ui/TitleBar';
import { useReducedMotion } from '../hooks/useLayout';
import { useUserLocation } from '../hooks/useUserLocation';
import { db } from '../services/firebase';
import {
  getMissingGasStationFields,
  type Coordinates,
  type FuelType as ParsedFuelType,
  type ParsedGasStationText,
} from '../services/gasStationParser';
import { processGasStationCapture } from '../services/receiptOcr';
import { FieldStatus, fieldStatus, reviewSummary, shareBlocker, shareReward, toPriceOrNull } from '../services/scanReview';
import { colors, palette } from '../theme/colors';
import { FUEL_TYPES, fuelMeta, pixel } from '../theme/pixel';
import { fonts, type } from '../theme/tokens';
import { FuelType } from '../types';
import { IconName } from '../ui/icons';

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

// The parser calls premium "special"; the app calls it premium.
const parsedFuelFor: Record<FuelType, ParsedFuelType> = { diesel: 'diesel', unleaded: 'unleaded', premium: 'special' };
const pricePlaceholder: Record<FuelType, string> = { diesel: '62.50', unleaded: '65.20', premium: '75.80' };

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
};

type Prices = Record<FuelType, string>;
const emptyPrices: Prices = { diesel: '', unleaded: '', premium: '' };

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

// Scan a price board: ① Snap → ② Review → ③ Share (DESIGN-002 §7.6).
export const CameraCaptureScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const location = useUserLocation();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [step, setStep] = useState<'snap' | 'review'>('snap');
  const [stationName, setStationName] = useState('');
  const [address, setAddress] = useState('');
  const [prices, setPrices] = useState<Prices>(emptyPrices);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<Coordinates | null>(null);
  const [parsedText, setParsedText] = useState<ParsedGasStationText>(emptyParsedText);
  const [isScanning, setIsScanning] = useState(false);
  const [shareStatus, setShareStatus] = useState<'uploading' | 'saving' | null>(null);
  const [dialog, setDialog] = useState<'uploadFailed' | 'saveFailed' | null>(null);
  const [reward, setReward] = useState<ReturnType<typeof shareReward> | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const markerLocation = capturedLocation ?? location.coords;
  const detectedPrices = useMemo(() => {
    const byType = new Map(parsedText.fuels.map((fuel) => [fuel.type, fuel.price.toFixed(2)]));
    return FUEL_TYPES.reduce((detected, fuel) => ({ ...detected, [fuel]: byType.get(parsedFuelFor[fuel]) ?? null }), {} as Record<FuelType, string | null>);
  }, [parsedText]);
  const priceCount = FUEL_TYPES.filter((fuel) => toPriceOrNull(prices[fuel]) !== null).length;
  const toCheck = [stationName, address, ...FUEL_TYPES.map((fuel) => prices[fuel])].filter((value) => !value.trim()).length;
  const blocker = shareBlocker({ priceCount, hasLocation: Boolean(markerLocation) });

  const captureAndParse = async () => {
    if (isScanning) return;

    if (!cameraRef.current || !isCameraReady) {
      setToast({ tone: 'info', message: 'Camera is starting. Try again in a second.' });
      return;
    }

    setIsScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.82, exif: true });
      if (!photo?.uri) {
        setToast({ tone: 'error', message: "Couldn't take the photo. Try again.", actionLabel: 'Retry', onAction: captureAndParse });
        return;
      }

      setCapturedImageUri(photo.uri);
      const fallbackLocation = location.coords ?? (await getDeviceLocation());
      try {
        const parsed = await processGasStationCapture(
          { uri: photo.uri, exif: photo.exif as Record<string, unknown> | null },
          { fallbackLocation },
        );
        applyParsedCapture(parsed, fallbackLocation);
      } catch {
        // The board couldn't be read; Review says so and the prices can be typed.
        applyParsedCapture(emptyParsedText, fallbackLocation);
      }
      setStep('review');
    } catch {
      setToast({ tone: 'error', message: "Couldn't take the photo. Try again.", actionLabel: 'Retry', onAction: captureAndParse });
    } finally {
      setIsScanning(false);
    }
  };

  const applyParsedCapture = (parsed: ParsedGasStationText, fallbackLocation: Coordinates | null) => {
    const fuelByType = new Map<ParsedFuelType, string>(parsed.fuels.map((fuel) => [fuel.type, fuel.price.toFixed(2)]));

    setCapturedLocation(parsed.location || fallbackLocation);
    setParsedText(parsed);
    setStationName(parsed.stationName || '');
    setAddress(parsed.address || '');
    setPrices({
      diesel: fuelByType.get('diesel') || '',
      unleaded: fuelByType.get('unleaded') || '',
      premium: fuelByType.get('special') || '',
    });
  };

  const share = async (withPhoto: boolean) => {
    if (shareStatus || blocker || !markerLocation) return;
    setDialog(null);

    let cloudinaryImage: CloudinaryUploadResponse | null = null;
    if (withPhoto && capturedImageUri) {
      setShareStatus('uploading');
      try {
        cloudinaryImage = await uploadImageToCloudinary(capturedImageUri);
      } catch {
        setShareStatus(null);
        setDialog('uploadFailed');
        return;
      }
    }

    setShareStatus('saving');
    try {
      const fuelPrices = {
        diesel: toPriceOrNull(prices.diesel),
        unleaded: toPriceOrNull(prices.unleaded),
        premium: toPriceOrNull(prices.premium),
      };
      const title = stationName.trim() || parsedText.stationName || 'GasUp365 station update';
      const markerAddress = address.trim() || parsedText.address || 'Current location';
      const descriptionParts = [
        markerAddress,
        fuelPrices.diesel ? `Diesel P${fuelPrices.diesel.toFixed(2)}` : '',
        fuelPrices.unleaded ? `Unleaded P${fuelPrices.unleaded.toFixed(2)}` : '',
        fuelPrices.premium ? `Premium P${fuelPrices.premium.toFixed(2)}` : '',
      ].filter(Boolean);

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
          rawText: parsedText.rawText,
          extractedFuels: parsedText.fuels,
          missingFields: getMissingGasStationFields(parsedText),
        },
        timestamp: serverTimestamp(),
      });

      setReward(shareReward(Boolean(cloudinaryImage)));
    } catch {
      setDialog('saveFailed');
    } finally {
      setShareStatus(null);
    }
  };

  const resetForm = () => {
    setStationName('');
    setAddress('');
    setPrices(emptyPrices);
    setCapturedImageUri(null);
    setCapturedLocation(null);
    setParsedText(emptyParsedText);
    setStep('snap');
  };

  const finish = () => {
    setReward(null);
    resetForm();
    router.navigate('/');
  };

  const retake = () => {
    setCapturedImageUri(null);
    setStep('snap');
  };

  const locationAction = location.status === 'denied' ? location.request : undefined;

  return (
    <View style={styles.container}>
      <TitleBar title="Scan a price board" />
      <Stepper current={step === 'snap' ? 0 : 1} />

      {step === 'snap' ? (
        <SnapStep
          cameraRef={cameraRef}
          permission={cameraPermission}
          onRequestPermission={requestCameraPermission}
          onCameraReady={() => setIsCameraReady(true)}
          onCameraError={() => setToast({ tone: 'error', message: "Camera isn't available. Type the prices instead." })}
          reading={isScanning}
          photoUri={capturedImageUri}
          locationStatus={location.status}
          onEnableLocation={locationAction}
          onScan={captureAndParse}
          onTypePrices={() => setStep('review')}
        />
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ReviewStep
            scanned={Boolean(capturedImageUri)}
            photoUri={capturedImageUri}
            onRetake={isWeb ? undefined : retake}
            stationName={stationName}
            onStationName={setStationName}
            address={address}
            onAddress={setAddress}
            prices={prices}
            onPrice={(fuel, value) => setPrices((current) => ({ ...current, [fuel]: value }))}
            detected={{ stationName: parsedText.stationName, address: parsedText.address, prices: detectedPrices }}
            rawText={parsedText.rawText}
            hasLocation={Boolean(markerLocation)}
            locationFromPhoto={Boolean(capturedLocation)}
            onEnableLocation={locationAction}
            summary={reviewSummary({ scanned: Boolean(capturedImageUri), priceCount, toCheck })}
            ready={priceCount > 0 && toCheck === 0}
          />
          <View style={styles.footer}>
            <PixelButton
              label="Share price"
              icon="navigate"
              disabled={Boolean(blocker)}
              loading={Boolean(shareStatus)}
              onPress={() => share(true)}
            />
            <Text style={[type.caption, styles.footerHelp]}>
              {shareStatus === 'uploading'
                ? 'Uploading photo…'
                : shareStatus === 'saving'
                  ? 'Sharing to the map…'
                  : blocker ?? (capturedImageUri ? '+10 coins · +5 photo bonus' : '+10 coins')}
            </Text>
          </View>
        </KeyboardAvoidingView>
      )}

      <Toast toast={toast} top={insets.top + 8} onDismiss={() => setToast(null)} />

      <Dialog
        visible={dialog === 'uploadFailed'}
        title="Photo didn't upload."
        body="Check your connection, or share the price without the photo."
        onRequestClose={() => setDialog(null)}
        actions={[
          { label: 'Share without photo', onPress: () => share(false) },
          { label: 'Retry', variant: 'primary', onPress: () => share(true) },
        ]}
      />
      <Dialog
        visible={dialog === 'saveFailed'}
        title="Couldn't share the price."
        body="Check your connection and try again."
        onRequestClose={() => setDialog(null)}
        actions={[
          { label: 'Cancel', onPress: () => setDialog(null) },
          { label: 'Try again', variant: 'primary', onPress: () => share(Boolean(capturedImageUri)) },
        ]}
      />
      <RewardPopup reward={reward} onDone={finish} />
    </View>
  );
};

interface SnapStepProps {
  cameraRef: React.RefObject<CameraView | null>;
  permission: ReturnType<typeof useCameraPermissions>[0];
  onRequestPermission: () => void;
  onCameraReady: () => void;
  onCameraError: () => void;
  reading: boolean;
  photoUri: string | null;
  locationStatus: ReturnType<typeof useUserLocation>['status'];
  onEnableLocation?: () => void;
  onScan: () => void;
  onTypePrices: () => void;
}

const SnapStep: React.FC<SnapStepProps> = ({
  cameraRef,
  permission,
  onRequestPermission,
  onCameraReady,
  onCameraError,
  reading,
  photoUri,
  locationStatus,
  onEnableLocation,
  onScan,
  onTypePrices,
}) => {
  if (isWeb) {
    return (
      <ScrollView contentContainerStyle={styles.stepContent}>
        <View style={[pixel.panel, styles.infoPanel]}>
          <View style={styles.phoneArt}>
            <View style={styles.phoneScreen}>
              <PixelIcon name="camera" size={32} />
            </View>
          </View>
          <Text accessibilityRole="header" style={[type.displayMd, styles.centerText]}>
            Mobile scan only
          </Text>
          <Text style={[type.bodyMd, styles.mutedCenter]}>Scanning works in the mobile app. On this computer, type the prices.</Text>
          <PixelButton label="Type prices" onPress={onTypePrices} style={styles.stretch} />
        </View>
      </ScrollView>
    );
  }

  if (!permission) return null;

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <ScrollView contentContainerStyle={styles.stepContent}>
        <View style={[pixel.panel, styles.infoPanel]}>
          <View style={styles.cameraArt}>
            <PixelIcon name="camera" size={64} />
          </View>
          <Text accessibilityRole="header" style={[type.displayMd, styles.centerText]}>
            {blocked ? 'Camera is off for GasUp365' : 'Use your camera to read the price board'}
          </Text>
          <Text style={[type.bodyMd, styles.mutedCenter]}>
            {blocked
              ? 'Turn it on in Settings, or type the prices.'
              : 'GasUp365 only uses the camera while you scan. The photo is shared with the price as proof.'}
          </Text>
          <PixelButton
            label={blocked ? 'Open Settings' : 'Enable camera'}
            onPress={blocked ? () => Linking.openSettings() : onRequestPermission}
            style={styles.stretch}
          />
          <PixelButton label="Type prices instead" variant="ghost" onPress={onTypePrices} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.stepContent}>
      <Viewfinder cameraRef={cameraRef} onCameraReady={onCameraReady} onCameraError={onCameraError} reading={reading} photoUri={photoUri} />
      {reading ? (
        <View accessibilityRole="progressbar" accessibilityLabel="Reading the price board" style={[pixel.panel, styles.readingPanel]}>
          <Text style={[type.displaySm, { color: colors.text }]}>Reading the price board…</Text>
          <ProgressLine done label="Photo taken" />
          <ProgressLine done={locationStatus === 'granted'} label={locationStatus === 'granted' ? 'Location captured' : 'No location yet'} />
          <ProgressLine label="Reading prices" />
        </View>
      ) : (
        <View style={styles.snapActions}>
          <LocationChip status={locationStatus} onEnable={onEnableLocation} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan the price board"
            onPress={onScan}
            style={({ pressed }) => [styles.shutter, pressed && pixel.pressed]}
          >
            <PixelIcon name="zap" size={32} color={colors.onAction} />
            <Text style={[type.displaySm, { color: colors.onAction }]}>Scan</Text>
          </Pressable>
          <PixelButton label="Type prices instead" variant="ghost" onPress={onTypePrices} />
        </View>
      )}
    </ScrollView>
  );
};

const Viewfinder: React.FC<{
  cameraRef: React.RefObject<CameraView | null>;
  onCameraReady: () => void;
  onCameraError: () => void;
  reading: boolean;
  photoUri: string | null;
}> = ({ cameraRef, onCameraReady, onCameraError, reading, photoUri }) => {
  const reduced = useReducedMotion();
  const sweep = useRef(new Animated.Value(0)).current;
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!reading || reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reading, reduced, sweep]);

  const corners: { icon: IconName; style: object }[] = [
    { icon: 'cornerTopLeft', style: { left: 12, top: 12 } },
    { icon: 'cornerTopRight', style: { right: 12, top: 12 } },
    { icon: 'cornerBottomLeft', style: { left: 12, bottom: 12 } },
    { icon: 'cornerBottomRight', style: { right: 12, bottom: 12 } },
  ];

  return (
    <View accessibilityLabel="Camera viewfinder" style={styles.finder} onLayout={(event) => setHeight(event.nativeEvent.layout.height)}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        autofocus="off"
        onCameraReady={onCameraReady}
        onMountError={onCameraError}
      />
      {reading && photoUri ? <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      {corners.map((corner) => (
        <PixelIcon key={corner.icon} name={corner.icon} size={36} color={colors.highlight} style={[styles.corner, corner.style]} />
      ))}
      {reading ? (
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: reduced ? height / 2 : sweep.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(0, height - 6)] }) }] },
          ]}
        />
      ) : null}
      <View style={styles.hint}>
        <Text style={[type.bodyStrong, styles.hintText]}>{reading ? 'Hold still…' : 'Fit the whole price board in the frame'}</Text>
      </View>
    </View>
  );
};

const ProgressLine: React.FC<{ label: string; done?: boolean }> = ({ label, done }) => (
  <View style={styles.progressLine}>
    {done ? <PixelIcon name="check" size={18} color={colors.success} /> : <View style={styles.progressDot} />}
    <Text style={[type.bodyStrong, { color: colors.text }]}>{label}</Text>
  </View>
);

const LocationChip: React.FC<{ status: ReturnType<typeof useUserLocation>['status']; onEnable?: () => void }> = ({ status, onEnable }) => (
  <View style={[pixel.panel, styles.locationChip]}>
    <PixelIcon name="pin" size={18} color={status === 'granted' ? colors.success : colors.warning} />
    <Text style={[type.bodyStrong, styles.flex, { color: status === 'granted' ? colors.success : colors.text }]}>
      {status === 'granted' ? 'Location captured' : status === 'checking' ? 'Finding your location…' : 'Location off'}
    </Text>
    {onEnable ? <PixelButton label="Enable" size="sm" onPress={onEnable} /> : null}
  </View>
);

const statusLook: Record<FieldStatus, { label: string; icon: IconName; color: string; tone: 'success' | 'warning' | 'default' }> = {
  detected: { label: 'Detected', icon: 'sparkle', color: colors.success, tone: 'success' },
  edited: { label: 'Edited', icon: 'edit', color: colors.text, tone: 'default' },
  check: { label: 'Please check', icon: 'warning', color: colors.warning, tone: 'warning' },
};

const StatusTag: React.FC<{ status: FieldStatus }> = ({ status }) => {
  const look = statusLook[status];
  return (
    <View style={styles.statusTag}>
      <PixelIcon name={look.icon} size={12} color={look.color} />
      <Text style={[type.captionStrong, { color: look.color }]}>{look.label}</Text>
    </View>
  );
};

interface ReviewStepProps {
  scanned: boolean;
  photoUri: string | null;
  onRetake?: () => void;
  stationName: string;
  onStationName: (value: string) => void;
  address: string;
  onAddress: (value: string) => void;
  prices: Prices;
  onPrice: (fuel: FuelType, value: string) => void;
  detected: { stationName: string | null; address: string | null; prices: Record<FuelType, string | null> };
  rawText: string;
  hasLocation: boolean;
  locationFromPhoto: boolean;
  onEnableLocation?: () => void;
  summary: string;
  ready: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  scanned,
  photoUri,
  onRetake,
  stationName,
  onStationName,
  address,
  onAddress,
  prices,
  onPrice,
  detected,
  rawText,
  hasLocation,
  locationFromPhoto,
  onEnableLocation,
  summary,
  ready,
}) => {
  const { width } = useWindowDimensions();
  const [rawOpen, setRawOpen] = useState(false);
  const nameStatus = fieldStatus(stationName, detected.stationName);
  const addressStatus = fieldStatus(address, detected.address);
  const stackPrices = width < 380;

  return (
    <ScrollView contentContainerStyle={styles.reviewContent} keyboardShouldPersistTaps="handled">
      <View accessibilityRole="summary" style={[styles.summary, { backgroundColor: ready ? palette.green50 : palette.amber50 }]}>
        <PixelIcon name={ready ? 'check' : 'warning'} size={22} color={ready ? colors.success : colors.warning} />
        <Text style={[type.bodyStrong, styles.flex, { color: colors.text }]}>{summary}</Text>
      </View>

      {photoUri ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: photoUri }} style={[pixel.slot, styles.thumb]} accessibilityLabel="Price board photo" />
          <View style={styles.flex}>
            <Text style={[type.bodyStrong, { color: colors.text }]}>Photo added</Text>
            <Text style={[type.caption, { color: colors.textMuted }]}>+5 coins for sharing proof</Text>
          </View>
          {onRetake ? <PixelButton label="Retake" variant="secondary" size="sm" icon="camera" iconPosition="left" onPress={onRetake} /> : null}
        </View>
      ) : onRetake ? (
        <View style={styles.photoRow}>
          <View style={[pixel.slot, styles.thumb, styles.thumbEmpty]}>
            <PixelIcon name="photo" size={24} color={colors.border} />
          </View>
          <View style={styles.flex}>
            <Text style={[type.bodyStrong, { color: colors.text }]}>No photo</Text>
            <Text style={[type.caption, { color: colors.textMuted }]}>Add one for +5 coins</Text>
          </View>
          <PixelButton label="Snap" variant="secondary" size="sm" icon="camera" iconPosition="left" onPress={onRetake} />
        </View>
      ) : null}

      <ReviewField label="Station name" status={nameStatus}>
        <PixelInput
          accessibilityLabel="Station name"
          placeholder="e.g. Petron Kalibo"
          value={stationName}
          onChangeText={onStationName}
          tone={statusLook[nameStatus].tone}
        />
      </ReviewField>

      <ReviewField
        label="Address"
        status={addressStatus}
        helper={address.trim() ? 'Thanks, drivers will see this address.' : "We couldn't read an address. Add the street so drivers can find it."}
        helperColor={address.trim() ? colors.textMuted : colors.warning}
      >
        <PixelInput
          accessibilityLabel="Address"
          placeholder="Roxas Avenue, Kalibo, Aklan"
          value={address}
          onChangeText={onAddress}
          tone={statusLook[addressStatus].tone}
          dashed={addressStatus === 'check'}
        />
      </ReviewField>

      <View style={styles.field}>
        <Text style={[type.tag, { color: colors.text }]}>Location</Text>
        <View style={[pixel.slot, styles.locationRow, { borderColor: hasLocation ? colors.success : colors.warning }]}>
          <PixelIcon name="pin" size={20} color={hasLocation ? colors.success : colors.warning} />
          <Text style={[type.bodyLg, styles.flex, { color: hasLocation ? colors.success : colors.warning }]}>
            {hasLocation ? 'Location captured' : 'Location needed'}
          </Text>
          {hasLocation ? (
            <Text style={[type.caption, { color: colors.textMuted }]}>{locationFromPhoto ? 'from the photo' : 'from your phone'}</Text>
          ) : onEnableLocation ? (
            <PixelButton label="Enable" size="sm" onPress={onEnableLocation} />
          ) : null}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[type.tag, { color: colors.text }]}>Prices per litre</Text>
        <View style={[styles.priceGrid, stackPrices && styles.priceStack]}>
          {FUEL_TYPES.map((fuel) => {
            const meta = fuelMeta[fuel];
            const status = fieldStatus(prices[fuel], detected.prices[fuel]);
            return (
              <View key={fuel} style={[styles.priceField, !stackPrices && styles.flex]}>
                <View style={styles.statusTag}>
                  <PixelIcon name={fuel} size={14} color={meta.dark} />
                  <Text style={[type.captionStrong, { color: colors.text }]}>{fuel === 'premium' ? 'Special / Premium' : meta.label}</Text>
                </View>
                <View>
                  <Text style={styles.pesoPrefix}>₱</Text>
                  <PixelInput
                    accessibilityLabel={`${meta.label} price`}
                    placeholder={pricePlaceholder[fuel]}
                    keyboardType="decimal-pad"
                    value={prices[fuel]}
                    onChangeText={(value) => onPrice(fuel, value)}
                    tone={statusLook[status].tone}
                    inputStyle={styles.priceInput}
                  />
                </View>
                <StatusTag status={status} />
              </View>
            );
          })}
        </View>
      </View>

      {scanned && rawText ? (
        <View style={styles.raw}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: rawOpen }} onPress={() => setRawOpen(!rawOpen)} style={styles.rawToggle}>
            <Text style={[type.bodyStrong, { color: colors.text }]}>Show what the camera read</Text>
            <PixelIcon name="chevronDown" size={16} style={rawOpen ? styles.chevronOpen : undefined} />
          </Pressable>
          {rawOpen ? (
            <Text selectable style={styles.rawText}>
              {rawText}
            </Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
};

const ReviewField: React.FC<{ label: string; status: FieldStatus; helper?: string; helperColor?: string; children: React.ReactNode }> = ({
  label,
  status,
  helper,
  helperColor,
  children,
}) => (
  <View style={styles.field}>
    <View style={styles.fieldHeader}>
      <Text style={[type.tag, { color: colors.text }]}>{label}</Text>
      <StatusTag status={status} />
    </View>
    {children}
    {helper ? <Text style={[type.caption, { color: helperColor }]}>{helper}</Text> : null}
  </View>
);

const getDeviceLocation = async (): Promise<Coordinates | null> => {
  try {
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    if (locationPermission.status !== 'granted') return null;

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
  } catch {
    return null;
  }
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, minWidth: 0 },
  stretch: { alignSelf: 'stretch' },
  centerText: { color: colors.text, textAlign: 'center' },
  mutedCenter: { color: colors.textMuted, textAlign: 'center' },
  stepContent: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 16, gap: 12 },
  infoPanel: { alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 24 },
  cameraArt: {
    width: 112,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.sky300,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  phoneArt: { width: 72, height: 112, padding: 6, paddingTop: 8, paddingBottom: 14, backgroundColor: colors.text, borderWidth: 2, borderColor: colors.outline },
  phoneScreen: { flex: 1, backgroundColor: palette.sky300, alignItems: 'center', justifyContent: 'center' },
  finder: { width: '100%', aspectRatio: 4 / 3, overflow: 'hidden', backgroundColor: palette.viewfinder, borderWidth: 2, borderColor: colors.outline },
  corner: { position: 'absolute' },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 6,
    backgroundColor: colors.highlight,
    boxShadow: '0px 0px 0px 2px #3B1A08',
  },
  hint: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: palette.night900,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  hintText: { color: palette.white, textAlign: 'center' },
  readingPanel: { padding: 14, gap: 10 },
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressDot: { width: 10, height: 10, margin: 4, backgroundColor: colors.action, borderWidth: 2, borderColor: colors.outline },
  snapActions: { alignItems: 'center', gap: 10 },
  locationChip: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 40,
    boxShadow: 'none',
  },
  shutter: {
    width: 96,
    height: 80,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.action,
    borderWidth: 2,
    borderColor: colors.outline,
    boxShadow:
      'inset 3px 3px 0px #FFB066, inset -3px -3px 0px #C2410C, 0px 0px 0px 4px #FFFDF9, 0px 0px 0px 6px #3B1A08, 0px 8px 0px 2px rgba(59, 26, 8, 0.35)',
  },
  reviewContent: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 14 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 2, borderColor: colors.outline },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 88, height: 66 },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderColor: colors.border },
  field: { gap: 4 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  priceGrid: { flexDirection: 'row', gap: 8 },
  priceStack: { flexDirection: 'column' },
  priceField: { gap: 4 },
  pesoPrefix: { position: 'absolute', left: 8, top: 14, zIndex: 1, fontFamily: fonts.body800, fontSize: 18, lineHeight: 24, color: colors.textMuted },
  priceInput: { paddingLeft: 24, paddingRight: 6, fontFamily: fonts.body800, fontSize: 20 },
  raw: { borderWidth: 2, borderColor: colors.outline },
  rawToggle: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: colors.surfaceSunken },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  rawText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: colors.outline,
    backgroundColor: palette.white,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 14,
    lineHeight: 20,
  },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 6, backgroundColor: colors.bg, borderTopWidth: 2, borderTopColor: colors.outline },
  footerHelp: { color: colors.textMuted, textAlign: 'center' },
});
