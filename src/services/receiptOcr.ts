import { getTextFromFrame } from 'expo-text-recognition';
import type { Coordinates, ParsedGasStationText } from './gasStationParser';
import { parseGasStationText } from './gasStationParser';

export interface CapturedGasStationImage {
  uri: string;
  exif?: Record<string, unknown> | null;
}

export type RecognizeText = (uri: string) => Promise<string[] | string>;

export const recognizeGasStationText: RecognizeText = async (uri) => {
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
