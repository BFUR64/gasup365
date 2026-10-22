import { stations } from '../../data/mockStations';
import { scoreStationsForRoute } from '../fuelRouting';
import {
    formatBreakdown,
    formatNetHeadline,
    formatNetShort,
    formatPeekLine,
    formatPeso,
    isWorthTheTrip,
    netVerdict,
    rankStations,
    smartRouteBanner,
} from '../stationPresentation';

const diesel = scoreStationsForRoute(stations, 'diesel');
const premium = scoreStationsForRoute(stations, 'premium');
const byName = (name: string) => diesel.find((score) => score.station.name.startsWith(name))!;

describe('price and saving formatting', () => {
    it('formats prices with the peso sign and two decimals', () => {
        expect(formatPeso(61.5)).toBe('₱61.50');
    });

    it('never claims a saving that rounds to ₱0', () => {
        expect(isWorthTheTrip(0.4)).toBe(false);
        expect(isWorthTheTrip(0.5)).toBe(true);
        expect(formatNetShort(0.4)).toBe('₱0.40 net');
        expect(formatNetShort(18.2)).toBe('Save ₱18');
        expect(formatNetHeadline(18.2)).toBe('Save ₱18 net');
    });

    it('shows negative nets honestly with a minus sign', () => {
        expect(formatNetShort(-8.95)).toBe('−₱8.95 net');
        expect(formatPeekLine(byName('Caltex'))).toBe('1.8 km · −₱8.95 · trip costs more');
        expect(formatBreakdown(byName('Caltex'))).toBe('₱9.50 fuel savings − ₱18.45 travel');
    });
});

describe('smart route banner and verdict', () => {
    it('uses the "Best value nearby" state when no diesel station beats the trip cost', () => {
        const banner = smartRouteBanner(diesel[0], 'Diesel');
        expect(diesel[0].station.name).toBe('Petron – Kalibo');
        expect(banner).toEqual({ tag: 'Smart route · Diesel', line: 'Best value nearby · 0.7 km', positive: false });
        expect(netVerdict(diesel[0])).toBe('Best value nearby. No station beats the trip cost today.');
        expect(netVerdict(byName('Caltex'))).toBe('Trip costs more than you save.');
    });

    it('shows the saving when the premium pick is worth it', () => {
        expect(smartRouteBanner(premium[0], 'Premium').line).toBe('Save ₱3 net · 0.7 km');
        expect(netVerdict(premium[0])).toBe('Worth the trip for a 20 L fill.');
    });
});

describe('rankStations', () => {
    it('keeps the smart order and filters by name', () => {
        expect(rankStations(diesel, 'smart', '').map((s) => s.station.id)).toEqual([1, 3, 2, 4]);
        expect(rankStations(diesel, 'smart', '  caltex ').map((s) => s.station.id)).toEqual([3]);
        expect(rankStations(diesel, 'smart', 'nothing')).toEqual([]);
    });

    it('sorts by distance or price without mutating the input', () => {
        expect(rankStations(diesel, 'nearest', '').map((s) => s.station.id)).toEqual([1, 2, 3, 4]);
        expect(rankStations(diesel, 'cheapest', '').map((s) => s.station.id)).toEqual([3, 1, 4, 2]);
        expect(diesel.map((s) => s.station.id)).toEqual([1, 3, 2, 4]);
    });
});
