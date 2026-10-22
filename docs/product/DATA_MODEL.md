# Shared data model: GasUp365

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-22T20:01:25+08:00
Revision: 2
Status: Draft

## Entities and ownership

### 1. Domain `Station` (`src/types/index.ts`)
Used by `fuelRouting.ts`, `StationListPanel`, `DashboardScreen` (through `stationView.fromScore`), and the legacy `StationCard`. Today only the 4 sample stations in `src/data/mockStations.ts` are `Station`s.

| Field | Type | Source of Truth | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `number \| string` | Static seed ID or Firestore doc ID | Currently typed as `number` in `src/types/index.ts`; needs widening or deterministic mapping to support string Firestore IDs (`FEAT-001`). |
| `name` | `string` | `mockStations.ts` or `markers.title` | Station brand + branch name. |
| `address` | `string` | `mockStations.ts` or parsed from `markers` | Street / barangay / municipality. |
| `distance` | `number` | Calculated (km) or static fallback | Distance in kilometers from user's GPS coordinates (or Kalibo center fallback). |
| `lastUpdated` | `string` | Formatted from `markers.timestamp` | Human-readable relative time (e.g., `"Live now"`, `"5 min ago"`). |
| `prices` | `{ diesel: number; unleaded: number; premium: number }` | `mockStations.ts` or `markers.prices` | Prices in PHP per liter. |
| `coordinates` | `{ latitude: number; longitude: number }` | `markers.latitude`, `markers.longitude` | WGS84 decimal coordinates. |
| `mapPosition` | `{ x: number; y: number }` | `mockStations.ts` | Percent position for the old simulated map. Unused by the current UI. |
| `source` | `'static-prototype' \| 'camera-ocr'` (optional) | Origin tag | Distinguishes seed stations from community OCR submissions. The UI uses `StationView.source` instead (section 2). |
| `trustScore` | `number` (optional) | Community verification | 0–100 score. |

The photo URL is not on `Station`; it lives on `StationView.photoUrl` (section 2).

### 2. UI view models: `MapMarker` and `StationView`

`useMapMarkers()` (`src/hooks/useMapMarkers.ts`) maps each `markers` document to:

```ts
interface MapMarker {
  id: string;            // Firestore doc ID
  lat: number;
  lng: number;
  title: string;         // markers.title, or 'Community station'
  description?: string;
  imageUrl?: string;
  prices?: { diesel?: number | null; unleaded?: number | null; premium?: number | null };
}
```

Documents without numeric `latitude` and `longitude` are skipped. `ocr`, `source`, `timestamp` and `imageStorage` are not read.

The map tab and station sheet render one shape, `StationView` (`src/services/stationView.ts`):

```ts
interface StationView {
  id: string;                               // 'station-<n>' for samples, doc ID for community
  name: string;
  address?: string;                         // community: text before the first ' | ' in description
  source: 'sample' | 'community';
  prices: Record<FuelType, number | null>;  // community: non-positive or missing → null
  coordinates: { latitude: number; longitude: number };
  score?: StationRouteScore;                // samples only; community markers are not scored yet (FEAT-001)
  photoUrl?: string;                        // community imageUrl, unless it is the placehold.co placeholder
}
```

`fromScore` builds sample views from `scoreStationsForRoute` results; `fromMarker` builds community views from `MapMarker`.

### 3. Firestore `markers/{markerId}` Document
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

> **Current writer** (`share()` in `CameraCaptureScreen.tsx`):
> - `prices` values come from `toPriceOrNull` (`scanReview.ts`): a positive finite number, or `null`.
> - `description` is `"<address> | Diesel P61.90 | Unleaded P… | Premium P…"`, listing only the prices that were entered. `fromMarker` reads the address back by splitting on `' | '`, so changing this format breaks the address in the sheet.
> - Without a photo, `imageUrl` is a `placehold.co` URL and `imageStorage` is `'placeholder'`.
> - `title` falls back to the parsed station name, then `'GasUp365 station update'`.

> **Fuel Type Key Mapping Note**:
> - `src/services/gasStationParser.ts` uses `FuelType = 'unleaded' | 'special' | 'diesel'`.
> - `src/types/index.ts` and Firestore `markers.prices` use `FuelType = 'diesel' | 'unleaded' | 'premium'`.
> - `CameraCaptureScreen.tsx` maps parser `'special'` → Firestore `'premium'` at submission time (`setPremium(fuelByType.get('special') || '')`).

### 4. Firestore `users/{uid}` Document
Written by `src/screens/AuthScreen.tsx` upon registration. Never read or updated afterwards: the Me screen shows "—" until FEAT-003, and the UI calls `points` "coins" (DESIGN-002 §13 Q2).

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

- **Price Validation (`gasStationParser.ts` & `scanReview.ts`)**:
  - OCR price extraction only accepts numeric values between `20` and `120` PHP/L that include a decimal point or currency/liter unit token (`₱`, `PHP`, `P`, `/L`, `per liter`).
  - Review → Share: `shareBlocker` keeps **Share price** disabled until at least one price parses as a positive finite number (`toPriceOrNull`, commas allowed) and a GPS location exists. Typed prices are not range-checked.
  - Each review field shows `detected`, `edited` or `check` (`fieldStatus`).
- **Share reward (`scanReview.shareReward`)**: placeholder +10 coins, +5 with a photo. Shown in `RewardPopup`, not saved (FEAT-003).
- **Route Scoring (`fuelRouting.ts`)**:
  - `DEFAULT_FILL_LITERS = 20`, `DEFAULT_KM_PER_LITER = 12`.
  - `grossFuelSavings = Math.max(0, (areaAveragePrice - fuelPrice) * liters)`.
  - `estimatedTravelCost = ((distanceKm * 2) / kmPerLiter) * fuelPrice`.
  - `pesosSaved = grossFuelSavings - estimatedTravelCost`.

## Storage and recovery

- **Online/Realtime Sync**: `onSnapshot` in `useMapMarkers.ts` streams live changes from Firestore `markers`.
- **Permission-Denied / Offline Fallback**: The 4 Kalibo sample stations in `src/data/mockStations.ts` always show. If Firestore returns `permission-denied`, `useMapMarkers` returns no community markers and logs a warning; any other error sets `error`, and the map shows a sample-data notice.

## Open questions and approval

- **Question 1 (Partial Fuel Prices on Live Markers)**: A user can share a marker with only *one* fuel price (e.g., `diesel: 61.50`, `unleaded: null`, `premium: null`). How should `scoreStationsForRoute` and the Stations list handle `null` prices for the selected fuel?
  - **Display (already built)**: the map pin shows "—" and the sheet says "No <fuel> price yet".
  - **Proposed Default for FEAT-001**: exclude stations missing the selected fuel from `scoreStationsForRoute` and the Stations list for that fuel.
- **Question 2 (Station identity)**: `Station.id` is a `number`, while community markers have string IDs and `StationView` already uses strings. **Proposed**: widen `Station.id` to `string` in FEAT-001.
- **Len's Approval**: *Pending chat review and approval of Revision 2.*
