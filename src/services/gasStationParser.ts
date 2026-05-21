export type FuelType = 'unleaded' | 'special' | 'diesel';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ParsedFuelPrice {
  type: FuelType;
  price: number;
  currency: 'PHP';
}

export interface ParsedGasStationText {
  stationName: string | null;
  address: string | null;
  location: Coordinates | null;
  fuels: ParsedFuelPrice[];
  rawText: string;
}

export interface ParseGasStationOptions {
  exif?: Record<string, unknown> | null;
  fallbackLocation?: Coordinates | null;
}

const STATION_BRANDS = [
  { canonical: 'Petron', pattern: /\bpetron\b/i },
  { canonical: 'Shell', pattern: /\bshell\b/i },
  { canonical: 'Caltex', pattern: /\bcaltex\b/i },
  { canonical: 'Phoenix', pattern: /\bphoenix\b/i },
  { canonical: 'Total', pattern: /\btotal(?:energies)?\b/i },
  { canonical: 'SeaOil', pattern: /\bsea\s*oil\b|\bseaoil\b/i },
  { canonical: 'Uno', pattern: /\buno\b/i },
  { canonical: 'Flying V', pattern: /\bflying\s*v\b/i },
  { canonical: 'PTT', pattern: /\bptt\b/i },
  { canonical: 'Cleanfuel', pattern: /\bclean\s*fuel\b|\bcleanfuel\b/i },
  { canonical: 'Jetti', pattern: /\bjetti\b/i },
  { canonical: 'Unioil', pattern: /\bunioil\b/i },
  { canonical: 'RePhil', pattern: /\brephil\b|\bre-phil\b/i },
  { canonical: 'Petro Gazz', pattern: /\bpetro\s*gazz\b/i },
  { canonical: 'Pilipinas Shell', pattern: /\bpilipinas\s+shell\b/i },
];

const ADDRESS_PATTERN =
  /\b(?:st\.?|street|ave\.?|avenue|road|rd\.?|highway|hwy\.?|brgy\.?|barangay|city|province|poblacion|municipality|bayan|kalye|corner|cor\.?|zone|district|subd\.?)\b/i;

const PRICE_PATTERN = /(?:₱|PHP?\s?|P\s?)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:\/\s?L|per\s*lit(?:er|re)|ltr|liters?)?/gi;

const FUEL_PATTERNS: Record<FuelType, RegExp[]> = {
  unleaded: [
    /\bunleaded\b/i,
    /\bregular\b/i,
    /\bgasoline\b/i,
    /\bgas\b/i,
    /\b91\b/,
    /\bextra\b/i,
  ],
  special: [
    /\bspecial\b/i,
    /\bpremium\b/i,
    /\bxcs\b/i,
    /\bv[-\s]?power\b/i,
    /\bvelocity\b/i,
    /\bgold\b/i,
    /\b95\b/,
    /\b97\b/,
    /\bblaze\b/i,
  ],
  diesel: [
    /\bdiesel\b/i,
    /\bturbo\s*diesel\b/i,
    /\bdiesel\s*max\b/i,
    /\bpower\s*diesel\b/i,
    /\bauto\s*diesel\b/i,
  ],
};

const COORDINATE_KEYS = {
  latitude: ['GPSLatitude', 'gpsLatitude', 'latitude', 'Latitude'],
  longitude: ['GPSLongitude', 'gpsLongitude', 'longitude', 'Longitude'],
};

export const parseGasStationText = (
  rawText: string,
  options: ParseGasStationOptions = {},
): ParsedGasStationText => {
  const lines = normalizeLines(rawText);
  const fuels = parseFuelPrices(lines);

  return {
    stationName: parseStationName(lines),
    address: parseAddress(lines),
    location: parseExifLocation(options.exif) || options.fallbackLocation || null,
    fuels,
    rawText,
  };
};

export const getMissingGasStationFields = (parsed: ParsedGasStationText) => {
  const fuelTypes = new Set(parsed.fuels.map((fuel) => fuel.type));
  return {
    stationName: !parsed.stationName,
    address: !parsed.address,
    location: !parsed.location,
    unleaded: !fuelTypes.has('unleaded'),
    special: !fuelTypes.has('special'),
    diesel: !fuelTypes.has('diesel'),
  };
};

const normalizeLines = (rawText: string) =>
  rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const parseStationName = (lines: string[]) => {
  const firstLines = lines.slice(0, 8);
  const prioritizedLines = firstLines.length ? firstLines : lines;

  for (const line of prioritizedLines) {
    const brand = STATION_BRANDS.find((candidate) => candidate.pattern.test(line));
    if (brand) return brand.canonical;
  }

  for (const line of lines) {
    const brand = STATION_BRANDS.find((candidate) => candidate.pattern.test(line));
    if (brand) return brand.canonical;
  }

  return null;
};

const parseAddress = (lines: string[]) => {
  const addressLine = lines.find((line) => ADDRESS_PATTERN.test(line));
  if (!addressLine) return null;

  const nextLine = lines[lines.indexOf(addressLine) + 1];
  if (nextLine && /\b(?:philippines|city|province|aklan|cebu|davao|manila|quezon|laguna|cavite|iloilo|batangas)\b/i.test(nextLine)) {
    return `${addressLine}, ${nextLine}`;
  }

  return addressLine;
};

const parseFuelPrices = (lines: string[]) => {
  const candidates = new Map<FuelType, { price: number; distance: number }>();

  lines.forEach((line, index) => {
    for (const type of Object.keys(FUEL_PATTERNS) as FuelType[]) {
      if (!matchesFuelType(line, type)) continue;

      const nearbyText = [line, lines[index + 1], lines[index - 1]].filter(Boolean).join(' ');
      const prices = extractReasonablePrices(nearbyText);
      const price = prices[0];
      if (price === undefined) continue;

      const current = candidates.get(type);
      if (!current || 0 < current.distance) {
        candidates.set(type, { price, distance: 0 });
      }
    }
  });

  // Price boards sometimes show a label column followed by a price-only column.
  lines.forEach((line, index) => {
    for (const type of Object.keys(FUEL_PATTERNS) as FuelType[]) {
      if (candidates.has(type) || !matchesFuelType(line, type)) continue;

      const neighborPrices = extractReasonablePrices([lines[index + 1], lines[index + 2]].filter(Boolean).join(' '));
      if (neighborPrices[0] !== undefined) {
        candidates.set(type, { price: neighborPrices[0], distance: 1 });
      }
    }
  });

  return (['unleaded', 'special', 'diesel'] as FuelType[])
    .map((type) => {
      const candidate = candidates.get(type);
      return candidate ? { type, price: candidate.price, currency: 'PHP' as const } : null;
    })
    .filter((fuel): fuel is ParsedFuelPrice => Boolean(fuel));
};

const matchesFuelType = (line: string, type: FuelType) =>
  FUEL_PATTERNS[type].some((pattern) => pattern.test(line));

const extractReasonablePrices = (text: string) => {
  const prices: number[] = [];
  PRICE_PATTERN.lastIndex = 0;

  let match = PRICE_PATTERN.exec(text);
  while (match) {
    const price = Number(match[1].replace(/,/g, ''));
    const token = match[0];
    const looksLikeFuelPrice = match[1].includes('.') || /₱|PHP?\s?|P\s?|\/\s?L|per\s*lit|ltr|liters?/i.test(token);
    if (looksLikeFuelPrice && price >= 20 && price <= 120) prices.push(price);
    match = PRICE_PATTERN.exec(text);
  }

  return prices;
};

const parseExifLocation = (exif?: Record<string, unknown> | null): Coordinates | null => {
  if (!exif) return null;

  const latitude = getCoordinate(exif, COORDINATE_KEYS.latitude);
  const longitude = getCoordinate(exif, COORDINATE_KEYS.longitude);
  if (latitude === null || longitude === null) return null;

  const latitudeRef = getStringValue(exif, ['GPSLatitudeRef', 'gpsLatitudeRef']);
  const longitudeRef = getStringValue(exif, ['GPSLongitudeRef', 'gpsLongitudeRef']);

  return {
    latitude: latitudeRef?.toUpperCase() === 'S' ? -Math.abs(latitude) : latitude,
    longitude: longitudeRef?.toUpperCase() === 'W' ? -Math.abs(longitude) : longitude,
  };
};

const getCoordinate = (exif: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = exif[key];
    const coordinate = toDecimalCoordinate(value);
    if (coordinate !== null) return coordinate;
  }

  return null;
};

const getStringValue = (exif: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = exif[key];
    if (typeof value === 'string') return value;
  }

  return null;
};

const toDecimalCoordinate = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [degrees, minutes, seconds] = value.map(toRationalNumber);
    if (degrees === null || minutes === null || seconds === null) return null;
    return degrees + minutes / 60 + seconds / 3600;
  }

  return null;
};

const toRationalNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    if (value.includes('/')) {
      const [numerator, denominator] = value.split('/').map(Number);
      return denominator ? numerator / denominator : null;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};
