import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import type { Coordinates } from '../services/gasStationParser';

export type LocationStatus = 'checking' | 'granted' | 'denied';

// Foreground location for the map and the scan flow. `request` re-asks, or
// opens system settings once the user has denied it permanently.
export const useUserLocation = () => {
    const [status, setStatus] = useState<LocationStatus>('checking');
    const [coords, setCoords] = useState<Coordinates | null>(null);
    const [canAskAgain, setCanAskAgain] = useState(true);

    const load = useCallback(async () => {
        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            setCanAskAgain(permission.canAskAgain);

            if (permission.status !== 'granted') {
                setStatus('denied');
                return;
            }

            const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
            setStatus('granted');
        } catch {
            setStatus('denied');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const request = useCallback(() => {
        if (!canAskAgain) {
            Linking.openSettings();
            return;
        }
        load();
    }, [canAskAgain, load]);

    return { status, coords, request };
};
