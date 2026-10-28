// Pure helpers for the Scan → Review → Share flow (DESIGN-002 §7.6).

export type FieldStatus = 'detected' | 'edited' | 'check';

export const fieldStatus = (value: string, detected: string | null | undefined): FieldStatus => {
    const trimmed = value.trim();
    if (!trimmed) return 'check';
    return detected && trimmed === detected.trim() ? 'detected' : 'edited';
};

export const toPriceOrNull = (value: string) => {
    const price = Number(value.replace(/,/g, '').trim());
    return value.trim() && Number.isFinite(price) && price > 0 ? price : null;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const reviewSummary = ({ scanned, priceCount, toCheck }: { scanned: boolean; priceCount: number; toCheck: number }) => {
    if (priceCount === 0) {
        return scanned ? "Couldn't read this board. Type the prices instead." : 'Type the prices from the board.';
    }
    const found = scanned ? `Found ${plural(priceCount, 'price')} · ` : '';
    return toCheck === 0 ? `${found}Ready to share` : `${found}${plural(toCheck, 'thing')} to check`;
};

// Why "Share price" is disabled, or null when it can be pressed.
export const shareBlocker = ({ priceCount, hasLocation }: { priceCount: number; hasLocation: boolean }) => {
    if (priceCount === 0) return 'Add at least one fuel price.';
    if (!hasLocation) return 'We need your location to place this station on the map.';
    return null;
};

// Coin values are placeholders until FEAT-003 (DESIGN-002 §7.6.3).
export const shareReward = (hasPhoto: boolean) => ({
    coins: hasPhoto ? 15 : 10,
    breakdown: hasPhoto ? '+10 for the price · +5 photo bonus' : '+10 for the price',
});
