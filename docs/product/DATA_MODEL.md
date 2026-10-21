# Shared data model: GasUp365

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-21T10:55:54+08:00
Revision: 1
Status: Draft

## Entities and ownership

### 1. Domain `Station` (`src/types/index.ts`)
Used by `StationListScreen`, `StationCard`, `DashboardScreen`, and `fuelRouting.ts`.

| Field | Type | Source of Truth | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `number \| string` | Static seed ID or Firestore doc ID | Currently typed as `number` in `src/types/index.ts`; needs widening or deterministic mapping to support string Firestore IDs (`FEAT-001`). |
| `name` | `string` | `mockStations.ts` or `markers.title` | Station brand + branch name. |
| `address` | `string` | `mockStations.ts` or parsed from `markers` | Street / barangay / municipality. |
| `distance` | `number` | Calculated (km) or static fallback | Distance in kilometers from user's GPS coordinates (or Kalibo center fallback). |
| `lastUpdated` | `string` | Formatted from `markers.timestamp` | Human-readable relative time (e.g., `"Live now"`, `"5 min ago"`). |
| `prices` | `{ diesel: number; unleaded: number; premium: number }` | `mockStations.ts` or `markers.prices` | Prices in PHP per liter. |
| `coordinates` | `{ latitude: number; longitude: number }` | `markers.latitude`, `markers.longitude` | WGS84 decimal coordinates. |
| `imageUrl` | `string` (optional) | `markers.imageUrl` (Cloudinary) | Photo evidence URL (to be added to `Station` interface in `FEAT-001`/`FEAT-002`). |
| `source` | `'static-prototype' \| 'camera-ocr'` | Origin tag | Distinguishes seed stations from community OCR submissions. |
| `trustScore` | `number` (optional) | Community verification | 0–100 score. |

### 2. Firestore `markers/{markerId}` Document
Written by `src/screens/CameraCaptureScreen.tsx` and read by `src/hooks/useMapMarkers.ts`.

```ts
interface FirestoreMarkerDocument {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  imageUrl: string;
  imageStorage: 'cloudinary' | 'placeholder';
  cloudinaryPublicId: string | null;
  prices?: {
    diesel: number | null;
    unleaded: number | null;
    premium: number | null;
  };
  source?: 'camera-ocr';
  ocr?: {
    parser: string;
    rawText: string;
    extractedFuels: Array<{ type: 'unleaded' | 'special' | 'diesel'; price: number; currency: 'PHP' }>;
    missingFields: {
      stationName: boolean;
      address: boolean;
      location: boolean;
      unleaded: boolean;
      special: boolean;
      diesel: boolean;
    };
  };
  timestamp?: FieldValue; // Firestore serverTimestamp()
  userId?: string;        // Planned in FEAT-003
}
```

> **Fuel Type Key Mapping Note**:
> - `src/services/gasStationParser.ts` uses `FuelType = 'unleaded' | 'special' | 'diesel'`.
> - `src/types/index.ts` and Firestore `markers.prices` use `FuelType = 'diesel' | 'unleaded' | 'premium'`.
> - `CameraCaptureScreen.tsx` maps parser `'special'` → Firestore `'premium'` at submission time (`setPremium(fuelByType.get('special') || '')`).

### 3. Firestore `users/{uid}` Document
Written by `src/screens/AuthScreen.tsx` upon registration.

```ts
interface FirestoreUserDocument {
  displayName: string;
  email: string | null;
  createdAt: FieldValue; // serverTimestamp()
  points: number;        // Initialized to 0
  updates: number;       // Initialized to 0
  role: string;          // Initialized to 'Community Member'
}
```

## Interfaces and validation

- **Price Validation (`gasStationParser.ts` & `CameraCaptureScreen.tsx`)**:
  - OCR price extraction only accepts numeric values between `20` and `120` PHP/L that include a decimal point or currency/liter unit token (`₱`, `PHP`, `P`, `/L`, `per liter`).
  - Manual/reviewed submission requires at least one positive finite price (`diesel`, `unleaded`, or `premium`) and valid GPS coordinates (`markerLocation`).
- **Route Scoring (`fuelRouting.ts`)**:
  - `DEFAULT_FILL_LITERS = 20`, `DEFAULT_KM_PER_LITER = 12`.
  - `grossFuelSavings = Math.max(0, (areaAveragePrice - fuelPrice) * liters)`.
  - `estimatedTravelCost = ((distanceKm * 2) / kmPerLiter) * fuelPrice`.
  - `pesosSaved = grossFuelSavings - estimatedTravelCost`.

## Storage and recovery

- **Online/Realtime Sync**: `onSnapshot` in `useMapMarkers.ts` streams live changes from Firestore `markers`.
- **Permission-Denied / Offline Fallback**: If Firestore returns `permission-denied` or is unreachable, the app falls back to the 4 Kalibo prototype stations in `src/data/mockStations.ts` without crashing.

## Open questions and approval

- **Question 1 (Partial Fuel Prices on Live Markers)**: A user can submit a marker in `CameraCaptureScreen` with only *one* fuel price (e.g., `diesel: 61.50`, `unleaded: null`, `premium: null`). How should `StationCard` and `scoreStationsForRoute` handle `null` prices for a fuel type?
  - **Proposed Default**: Exclude stations missing the currently selected `fuelType` (price `<= 0` or `null`) from `scoreStationsForRoute` for that fuel type, and display `"—"` instead of `"₱0.00"` on `StationCard`.
- **Len's Approval**: *Pending chat review and approval of Revision 1.*
