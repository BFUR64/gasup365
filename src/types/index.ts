export interface Station {
    id: number;
    name: string;
    address: string;
    distance: number;
    lastUpdated: string;
    prices: {
        diesel: number;
        unleaded: number;
        premium: number;
    };
    mapPosition: {
        x: number;   // percentage 0-100 for map simulation
        y: number;
    };
    coordinates: {
        latitude: number;
        longitude: number;
    };
    source?: 'static-prototype' | 'camera-ocr';
    trustScore?: number;
}

export type FuelType = 'diesel' | 'unleaded' | 'premium';

export interface StationRouteScore {
    station: Station;
    fuelType: FuelType;
    fuelPrice: number;
    areaAveragePrice: number;
    liters: number;
    distanceKm: number;
    estimatedTravelCost: number;
    grossFuelSavings: number;
    pesosSaved: number;
    isBestRoute: boolean;
}

export interface ExtractedFuelPrices {
    diesel?: number;
    unleaded?: number;
    premium?: number;
}
