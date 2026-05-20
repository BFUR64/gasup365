import { collection, onSnapshot, query } from 'firebase/firestore';
import type { FirestoreError } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface MarkerDocument {
  latitude?: number;
  longitude?: number;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export const useMapMarkers = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const markersQuery = query(collection(db, 'markers'));

    const unsubscribe = onSnapshot(
      markersQuery,
      (snapshot) => {
        const nextMarkers: MapMarker[] = [];

        snapshot.docs.forEach((document) => {
          const data = document.data() as MarkerDocument;

          if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
            return;
          }

          nextMarkers.push({
            id: document.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.title || 'GasUp365 marker',
            description: data.description,
            imageUrl: data.imageUrl,
          });
        });

        setMarkers(nextMarkers);
        setError(null);
        setLoading(false);
      },
      (snapshotError: FirestoreError) => {
        if (snapshotError.code === 'permission-denied') {
          console.warn('Firestore markers read denied. Check rules for the markers collection.');
          setMarkers([]);
          setError(null);
          setLoading(false);
          return;
        }

        setError('Unable to load live markers.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return { markers, loading, error };
};
