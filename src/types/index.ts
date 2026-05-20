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
}
