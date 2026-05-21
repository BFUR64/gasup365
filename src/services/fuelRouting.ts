import { FuelType, Station, StationRouteScore } from '../types';

export const DEFAULT_FILL_LITERS = 20;
export const DEFAULT_KM_PER_LITER = 12;

export const fuelLabels: Record<FuelType, string> = {
    diesel: 'Diesel',
    unleaded: 'Unleaded',
    premium: 'Premium',
};

export const getFuelPrice = (station: Station, fuelType: FuelType) => station.prices[fuelType];

export const getAreaAveragePrice = (stations: Station[], fuelType: FuelType) => {
    if (stations.length === 0) return 0;
    const total = stations.reduce((sum, station) => sum + getFuelPrice(station, fuelType), 0);
    return total / stations.length;
};

export const estimateTravelCost = (
    distanceKm: number,
    fuelPrice: number,
    kmPerLiter = DEFAULT_KM_PER_LITER,
) => {
    const routeDistanceKm = distanceKm * 2;
    return (routeDistanceKm / kmPerLiter) * fuelPrice;
};

export const scoreStationsForRoute = (
    stations: Station[],
    fuelType: FuelType,
    liters = DEFAULT_FILL_LITERS,
    kmPerLiter = DEFAULT_KM_PER_LITER,
): StationRouteScore[] => {
    const areaAveragePrice = getAreaAveragePrice(stations, fuelType);

    const scores = stations.map((station) => {
        const fuelPrice = getFuelPrice(station, fuelType);
        const grossFuelSavings = Math.max(0, (areaAveragePrice - fuelPrice) * liters);
        const estimatedTravelCost = estimateTravelCost(station.distance, fuelPrice, kmPerLiter);

        return {
            station,
            fuelType,
            fuelPrice,
            areaAveragePrice,
            liters,
            distanceKm: station.distance,
            estimatedTravelCost,
            grossFuelSavings,
            pesosSaved: grossFuelSavings - estimatedTravelCost,
            isBestRoute: false,
        };
    });

    const bestScore = scores.reduce<StationRouteScore | null>((best, score) => {
        if (!best) return score;
        if (score.pesosSaved > best.pesosSaved) return score;
        if (score.pesosSaved === best.pesosSaved && score.distanceKm < best.distanceKm) return score;
        return best;
    }, null);

    return scores
        .map((score) => ({
            ...score,
            isBestRoute: score.station.id === bestScore?.station.id,
        }))
        .sort((a, b) => {
            if (b.pesosSaved !== a.pesosSaved) return b.pesosSaved - a.pesosSaved;
            return a.distanceKm - b.distanceKm;
        });
};

export const buildGoogleMapsDirectionsUrl = (station: Station) => {
    const destination = `${station.coordinates.latitude},${station.coordinates.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
};
