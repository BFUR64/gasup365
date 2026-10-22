import { fieldStatus, reviewSummary, shareBlocker, shareReward, toPriceOrNull } from '../scanReview';

describe('fieldStatus', () => {
    it('tags empty, detected and edited fields', () => {
        expect(fieldStatus('  ', 'Petron Kalibo')).toBe('check');
        expect(fieldStatus('Petron Kalibo ', 'Petron Kalibo')).toBe('detected');
        expect(fieldStatus('Petron', 'Petron Kalibo')).toBe('edited');
        expect(fieldStatus('61.90', null)).toBe('edited');
    });
});

describe('toPriceOrNull', () => {
    it('accepts positive numbers and rejects blanks and junk', () => {
        expect(toPriceOrNull('1,061.90')).toBe(1061.9);
        expect(toPriceOrNull('')).toBeNull();
        expect(toPriceOrNull('0')).toBeNull();
        expect(toPriceOrNull('abc')).toBeNull();
    });
});

describe('reviewSummary', () => {
    it('describes scan results', () => {
        expect(reviewSummary({ scanned: true, priceCount: 3, toCheck: 0 })).toBe('Found 3 prices · Ready to share');
        expect(reviewSummary({ scanned: true, priceCount: 1, toCheck: 1 })).toBe('Found 1 price · 1 thing to check');
        expect(reviewSummary({ scanned: true, priceCount: 0, toCheck: 5 })).toBe("Couldn't read this board. Type the prices instead.");
    });

    it('does not claim a scan for typed prices', () => {
        expect(reviewSummary({ scanned: false, priceCount: 0, toCheck: 5 })).toBe('Type the prices from the board.');
        expect(reviewSummary({ scanned: false, priceCount: 2, toCheck: 3 })).toBe('3 things to check');
    });
});

describe('shareBlocker and shareReward', () => {
    it('explains why sharing is disabled', () => {
        expect(shareBlocker({ priceCount: 0, hasLocation: true })).toBe('Add at least one fuel price.');
        expect(shareBlocker({ priceCount: 1, hasLocation: false })).toBe('We need your location to place this station on the map.');
        expect(shareBlocker({ priceCount: 1, hasLocation: true })).toBeNull();
    });

    it('adds the photo bonus only with a photo', () => {
        expect(shareReward(true)).toEqual({ coins: 15, breakdown: '+10 for the price · +5 photo bonus' });
        expect(shareReward(false).coins).toBe(10);
    });
});
