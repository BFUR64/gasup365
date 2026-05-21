import { getMissingGasStationFields, parseGasStationText } from '../gasStationParser';

describe('parseGasStationText', () => {
  it('extracts Petron receipt details with XCS and diesel', () => {
    const parsed = parseGasStationText(
      [
        'PETRON SERVICE STATION',
        'Roxas Avenue, Brgy. Poblacion, Kalibo, Aklan',
        'Unleaded 91 Php 64.80 /L',
        'XCS 95 P 73.60 per liter',
        'Turbo Diesel 61.90',
      ].join('\n'),
      { fallbackLocation: { latitude: 11.7052, longitude: 122.3661 } },
    );

    expect(parsed.stationName).toBe('Petron');
    expect(parsed.address).toContain('Roxas Avenue');
    expect(parsed.location).toEqual({ latitude: 11.7052, longitude: 122.3661 });
    expect(parsed.fuels).toEqual([
      { type: 'unleaded', price: 64.8, currency: 'PHP' },
      { type: 'special', price: 73.6, currency: 'PHP' },
      { type: 'diesel', price: 61.9, currency: 'PHP' },
    ]);
  });

  it('extracts Shell price-board text with V-Power labels', () => {
    const parsed = parseGasStationText(
      [
        'PILIPINAS SHELL',
        'Kalibo Crossing Highway',
        'FuelSave Unleaded 65.10',
        'V-Power Gasoline 75.20',
        'FuelSave Diesel 62.40',
      ].join('\n'),
    );

    expect(parsed.stationName).toBe('Shell');
    expect(parsed.address).toBe('Kalibo Crossing Highway');
    expect(getFuel(parsed, 'unleaded')).toBe(65.1);
    expect(getFuel(parsed, 'special')).toBe(75.2);
    expect(getFuel(parsed, 'diesel')).toBe(62.4);
  });

  it('extracts Caltex OCR with table-like multi-line prices', () => {
    const parsed = parseGasStationText(
      [
        'CALTEX',
        'Andagao Road, Kalibo City',
        'Silver 91',
        '64.30',
        'Premium 95',
        '73.90',
        'Diesel with Techron D',
        '61.50',
      ].join('\n'),
    );

    expect(parsed.stationName).toBe('Caltex');
    expect(getFuel(parsed, 'unleaded')).toBe(64.3);
    expect(getFuel(parsed, 'special')).toBe(73.9);
    expect(getFuel(parsed, 'diesel')).toBe(61.5);
  });

  it('extracts Phoenix and ignores octane numbers as prices', () => {
    const parsed = parseGasStationText(
      [
        'PHOENIX',
        'Estancia Ave., Kalibo, Aklan',
        'Unleaded 91 65.50 /L',
        'Premium 95 75.10 /L',
        'Diesel 62.10 /L',
      ].join('\n'),
    );

    expect(parsed.stationName).toBe('Phoenix');
    expect(getFuel(parsed, 'unleaded')).toBe(65.5);
    expect(getFuel(parsed, 'special')).toBe(75.1);
    expect(getFuel(parsed, 'diesel')).toBe(62.1);
  });

  it('extracts SeaOil and EXIF GPS coordinates', () => {
    const parsed = parseGasStationText(
      [
        'SEAOIL Philippines',
        'National Highway, Brgy. Tigayon, Kalibo',
        'Extreme 97 ₱76.25/L',
        'Unleaded ₱64.95/L',
        'Diesel Max ₱60.85/L',
      ].join('\n'),
      {
        exif: {
          GPSLatitude: [11, 42, 32.4],
          GPSLongitude: [122, 21, 50.4],
          GPSLatitudeRef: 'N',
          GPSLongitudeRef: 'E',
        },
      },
    );

    expect(parsed.stationName).toBe('SeaOil');
    expect(parsed.location?.latitude).toBeCloseTo(11.709);
    expect(parsed.location?.longitude).toBeCloseTo(122.364);
    expect(getFuel(parsed, 'special')).toBe(76.25);
    expect(getFuel(parsed, 'unleaded')).toBe(64.95);
    expect(getFuel(parsed, 'diesel')).toBe(60.85);
  });

  it('reports missing fields without throwing on sparse OCR', () => {
    const parsed = parseGasStationText('THANK YOU\nTOTAL 500.00\nVAT SALES');
    const missing = getMissingGasStationFields(parsed);

    expect(parsed.stationName).toBe('Total');
    expect(parsed.address).toBeNull();
    expect(parsed.fuels).toEqual([]);
    expect(missing.address).toBe(true);
    expect(missing.location).toBe(true);
    expect(missing.diesel).toBe(true);
  });

  it('handles unknown station names and missing GPS metadata', () => {
    const parsed = parseGasStationText(
      [
        'OFFICIAL RECEIPT',
        'Fuel Product',
        'Regular Gasoline Php 64.10 /L',
        'Diesel Php 60.70 /L',
      ].join('\n'),
    );
    const missing = getMissingGasStationFields(parsed);

    expect(parsed.stationName).toBeNull();
    expect(parsed.location).toBeNull();
    expect(getFuel(parsed, 'unleaded')).toBe(64.1);
    expect(getFuel(parsed, 'diesel')).toBe(60.7);
    expect(missing.stationName).toBe(true);
    expect(missing.location).toBe(true);
    expect(missing.special).toBe(true);
  });
});

const getFuel = (parsed: ReturnType<typeof parseGasStationText>, type: 'unleaded' | 'special' | 'diesel') =>
  parsed.fuels.find((fuel) => fuel.type === type)?.price;
