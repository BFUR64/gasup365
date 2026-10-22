import { StationRouteScore } from '../types';

export type StationSort = 'smart' | 'nearest' | 'cheapest';

const MINUS = '−';

export const formatPeso = (value: number) => `₱${value.toFixed(2)}`;

// A saving only counts once it rounds to at least ₱1, so the UI never says "Save ₱0".
export const isWorthTheTrip = (net: number) => Math.round(net) >= 1;

const signedNet = (net: number) => `${net < 0 ? MINUS : ''}₱${Math.abs(net).toFixed(2)}`;

// Leaderboard rows: "Save ₱18" or "−₱8.95 net".
export const formatNetShort = (net: number) =>
    isWorthTheTrip(net) ? `Save ₱${Math.round(net)}` : `${signedNet(net)} net`;

// Sheet and detail panel headline: "Save ₱18 net" or "−₱8.95 net".
export const formatNetHeadline = (net: number) =>
    isWorthTheTrip(net) ? `Save ₱${Math.round(net)} net` : `${signedNet(net)} net`;

// Sheet peek: "0.7 km · Save ₱18 net" or "0.7 km · −₱5.72 · trip costs more".
export const formatPeekLine = (score: StationRouteScore) =>
    `${score.distanceKm} km · ${
        isWorthTheTrip(score.pesosSaved)
            ? `Save ₱${Math.round(score.pesosSaved)} net`
            : `${signedNet(score.pesosSaved)} · trip costs more`
    }`;

export const formatBreakdown = (score: StationRouteScore) =>
    `${formatPeso(score.grossFuelSavings)} fuel savings ${MINUS} ${formatPeso(score.estimatedTravelCost)} travel`;

export const netVerdict = (score: StationRouteScore) => {
    if (isWorthTheTrip(score.pesosSaved)) return `Worth the trip for a ${score.liters} L fill.`;
    if (score.isBestRoute) return 'Best value nearby. No station beats the trip cost today.';
    return 'Trip costs more than you save.';
};

export const smartRouteBanner = (best: StationRouteScore, fuelLabel: string) => {
    const positive = isWorthTheTrip(best.pesosSaved);
    return {
        tag: `Smart route · ${fuelLabel}`,
        line: positive
            ? `Save ₱${Math.round(best.pesosSaved)} net · ${best.distanceKm} km`
            : `Best value nearby · ${best.distanceKm} km`,
        positive,
    };
};

export const sortSubtitle: Record<StationSort, string> = {
    smart: 'Ranked by net pesos saved',
    nearest: 'Sorted by distance',
    cheapest: 'Sorted by price per litre',
};

// Scores arrive already ranked by net saving (scoreStationsForRoute).
export const rankStations = (scores: StationRouteScore[], sort: StationSort, query: string) => {
    const needle = query.trim().toLowerCase();
    const matches = scores.filter((score) => score.station.name.toLowerCase().includes(needle));
    if (sort === 'nearest') return matches.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === 'cheapest') return matches.sort((a, b) => a.fuelPrice - b.fuelPrice);
    return matches;
};

export const SMART_ROUTE_EXPLAINER =
    "We compare each station's price with the area average for a 20-litre fill, then subtract the fuel you'd burn driving there and back (at 12 km per litre). The highest number is your Smart Route.";
