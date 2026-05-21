import { processGasStationCapture } from '../receiptOcr';

describe('processGasStationCapture', () => {
  it('runs capture to OCR to parser with mocked OCR output', async () => {
    const parsed = await processGasStationCapture(
      {
        uri: 'file:///tmp/shell-board.jpg',
        exif: null,
      },
      {
        fallbackLocation: { latitude: 14.5995, longitude: 120.9842 },
        recognizeText: async (uri) => {
          expect(uri).toBe('file:///tmp/shell-board.jpg');
          return [
            'SHELL',
            'Taft Avenue, Manila City',
            'Unleaded 66.35',
            'V-Power 77.20',
            'Diesel 63.40',
          ];
        },
      },
    );

    expect(parsed.stationName).toBe('Shell');
    expect(parsed.address).toBe('Taft Avenue, Manila City');
    expect(parsed.location).toEqual({ latitude: 14.5995, longitude: 120.9842 });
    expect(parsed.fuels).toEqual([
      { type: 'unleaded', price: 66.35, currency: 'PHP' },
      { type: 'special', price: 77.2, currency: 'PHP' },
      { type: 'diesel', price: 63.4, currency: 'PHP' },
    ]);
  });
});
