import type { MapMarker } from '../hooks/useMapMarkers';
import { FuelType, Station, StationRouteScore } from '../types';

// One shape for the map sheet and detail panel, whether the station is a
// built-in sample (scored by Smart Route) or a community price update.
export interface StationView {
    id: string;
    name: string;
    address?: string;
    source: 'sample' | 'community';
    prices: Record<FuelType, number | null>;
    coordinates: Station['coordinates'];
    score?: StationRouteScore;
    photoUrl?: string;
}

export const sampleStationId = (stationId: number) => `station-${stationId}`;

export const fromScore = (score: StationRouteScore): StationView => ({
    id: sampleStationId(score.station.id),
    name: score.station.name,
    address: score.station.address,
    source: 'sample',
    prices: score.station.prices,
    coordinates: score.station.coordinates,
    score,
});

const PLACEHOLDER_PHOTO_HOST = 'placehold.co';

const priceOrNull = (value: number | null | undefined) => (typeof value === 'number' && value > 0 ? value : null);

export const fromMarker = (marker: MapMarker): StationView => ({
    id: marker.id,
    name: marker.title,
    // Community descriptions start with the address, then " | Diesel P61.90 | …".
    address: marker.description?.split(' | ')[0] || undefined,
    source: 'community',
    prices: {
        diesel: priceOrNull(marker.prices?.diesel),
        unleaded: priceOrNull(marker.prices?.unleaded),
        premium: priceOrNull(marker.prices?.premium),
    },
    coordinates: { latitude: marker.lat, longitude: marker.lng },
    photoUrl: marker.imageUrl && !marker.imageUrl.includes(PLACEHOLDER_PHOTO_HOST) ? marker.imageUrl : undefined,
});
