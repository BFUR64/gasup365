import { ExtractedFuelPrices } from '../types';

const fuelAliases: { fuel: keyof ExtractedFuelPrices; pattern: RegExp }[] = [
    { fuel: 'diesel', pattern: /diesel|dsl/i },
    { fuel: 'unleaded', pattern: /unleaded|regular|gasoline|gas/i },
    { fuel: 'premium', pattern: /premium|xp|velocity|extra/i },
];

const pricePattern = /(?:P|PHP|₱)?\s*(\d{2,3}(?:\.\d{1,2})?)/i;

export const sampleOcrText = [
    'PETRON KALIBO',
    'DIESEL P61.90',
    'UNLEADED P64.80',
    'PREMIUM P73.60',
].join('\n');

export const parseFuelPricesFromText = (rawText: string): ExtractedFuelPrices => {
    const prices: ExtractedFuelPrices = {};
    const lines = rawText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    lines.forEach((line) => {
        const match = line.match(pricePattern);
        if (!match) return;

        const alias = fuelAliases.find((candidate) => candidate.pattern.test(line));
        if (!alias) return;

        prices[alias.fuel] = Number(match[1]);
    });

    return prices;
};

export const formatExtractionSummary = (prices: ExtractedFuelPrices) => {
    const entries = [
        prices.diesel ? `Diesel P${prices.diesel.toFixed(2)}` : '',
        prices.unleaded ? `Unleaded P${prices.unleaded.toFixed(2)}` : '',
        prices.premium ? `Premium P${prices.premium.toFixed(2)}` : '',
    ].filter(Boolean);

    return entries.length > 0 ? entries.join(' | ') : 'No fuel prices detected';
};
