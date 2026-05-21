import type { Coordinates, ParsedGasStationText } from './gasStationParser';
import { parseGasStationText } from './gasStationParser';

export interface CapturedGasStationImage {
  uri: string;
  exif?: Record<string, unknown> | null;
}

export type RecognizeText = (uri: string) => Promise<string[] | string>;

export const recognizeGasStationText: RecognizeText = async (uri) => {
  if (isWebRuntime()) {
    throw new Error('Camera OCR is not available on web. Please use the mobile app.');
  }

  const { getTextFromFrame } = await import('expo-text-recognition');
  return getTextFromFrame(uri, false);
};

export const processGasStationCapture = async (
  photo: CapturedGasStationImage,
  options: {
    fallbackLocation?: Coordinates | null;
    recognizeText?: RecognizeText;
  } = {},
): Promise<ParsedGasStationText> => {
  const recognizeText = options.recognizeText || recognizeGasStationText;
  const recognized = await recognizeText(photo.uri);
  const rawText = Array.isArray(recognized) ? recognized.join('\n') : recognized;

  return parseGasStationText(rawText, {
    exif: photo.exif,
    fallbackLocation: options.fallbackLocation,
  });
};

const isWebRuntime = () => typeof window !== 'undefined' && typeof document !== 'undefined';
