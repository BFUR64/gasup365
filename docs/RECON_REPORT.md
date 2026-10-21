# GasUp365 — Full Project Reconnaissance Report

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-21T15:30:16+08:00
Revision: 2
Status: Baseline Audit

> **Project Snapshot**: GasUp365 (`v1.0.0`) is a cross-platform (iOS, Android, Web) community-powered fuel price tracker and smart-route calculator built with **Expo SDK 55**, **React Native 0.83.6**, **React 19.2.0**, **Firebase (Auth + Firestore)**, and **Cloudinary**. The current MVP targets **Kalibo, Aklan, Philippines**.

---

## 1. Current Project Status

| Dimension | Status | Details |
| :--- | :--- | :--- |
| **Git Branch & Head** | `main` (`c0207da`) | Up to date with `origin/main`. Remote branches `origin/arnold/liveUIMap` (`237c113`) and `origin/ListTest-Arnold` (`5509ad9`) are already merged into `main`. |
| **Local Dependencies** | Installed (Rev 2) | `npm ci` installs 1084 packages. `@expo/vector-icons` is now a direct dependency, so lint and typecheck pass (see section 6). |
| **Test Suite** | 2 Jest Suites | `src/services/__tests__/gasStationParser.test.ts` (7 unit tests) and `src/services/__tests__/receiptOcr.test.ts` (1 integration test) cover OCR + NLP extraction. No UI or routing unit tests exist yet. |
| **Documentation Tree** | Initialized | `docs/SPEC_INDEX.md`, `HANDOFF.md`, and `docs/product/*` initialized to support the **Spec → Design → Create Test → Generate Code → Optimize/Bugfix** workflow. |

### Recent Commit History (`main`)
1. `c0207da` — **Update README.md**: Expanded project documentation, architecture overview, and 3-phase roadmap.
2. `237c113` — **Added: Cloudinary - Kyle**: Integrated unsigned Cloudinary image uploads into `src/screens/CameraCaptureScreen.tsx`.
3. `5509ad9` — **style: add sprite graphics and merge login layout**: Refined `src/screens/AuthScreen.tsx` and `src/screens/DashboardScreen.tsx` UI with brand logo graphics.
4. `94ea94e` — **Fixed Uncaught Error: Cannot find native module 'ExpoTextRecognition' in Web**: Guarded `expo-text-recognition` with dynamic import and web platform checks in `src/services/receiptOcr.ts`.
5. `1337d75` / `2c8f49c` — **Merge PR #6 (FixNLPCapture)**: Refactored camera preview, permissions, and OCR capture pipeline.

---

## 2. System Architecture Overview

```mermaid
flowchart TD
    subgraph Client["Frontend (Expo SDK 55 / React Native 0.83)"]
        Layout["RootLayout (src/app/_layout.tsx)"]
        Auth["AuthScreen (Login / Signup)"]
        Dash["DashboardScreen (Home Tab: / )"]
        List["StationListScreen (List Tab: /list)"]
        Add["CameraCaptureScreen (Add Tab: /add)"]
        Prof["ProfileScreen (Profile Tab: /profile)"]
        HiddenMap["MapViewScreen (Hidden Route: /map)"]

        OCR["receiptOcr.ts + gasStationParser.ts"]
        RouteSvc["fuelRouting.ts (Smart Route Scorer)"]
        MockData["mockStations.ts (4 Static Kalibo Stations)"]
        Hook["useMapMarkers.ts (Realtime Hook)"]
    end

    subgraph BaaS["Backend-as-a-Service (Serverless)"]
        FBAuth["Firebase Authentication"]
        FSUsers[("Firestore: users/{uid}")]
        FSMarkers[("Firestore: markers/{id}")]
        Cloudinary["Cloudinary API (dzisx3ntp)"]
    end

    Layout -->|Unauthenticated| Auth
    Layout -->|Authenticated| Dash
    Layout -->|Authenticated| List
    Layout -->|Authenticated| Add
    Layout -->|Authenticated| Prof
    Layout -.->|href: null| HiddenMap

    Auth -->|Sign In / Sign Up| FBAuth
    Auth -->|Create Profile Doc| FSUsers
    Prof -->|Sign Out / Read displayName| FBAuth

    Add -->|1. Capture & Parse| OCR
    Add -->|2. Upload Photo| Cloudinary
    Add -->|3. Write Station Doc| FSMarkers

    FSMarkers -->|onSnapshot| Hook
    Hook -->|Live Markers (No Prices)| Dash
    MockData -->|Static Stations| Dash
    MockData -->|Static Stations| List
    MockData -->|Static Stations| HiddenMap
    RouteSvc --> Dash
    RouteSvc --> List
    RouteSvc --> HiddenMap
```

---

## 3. Backend Analysis (Client-Direct Serverless BaaS)

There is **no custom backend server** (no Node/Express, Python, or Cloud Functions directory) in the repository. All backend operations occur directly from the React Native / Web client against Firebase and Cloudinary:

### 3.1 Firebase Initialization (`src/firebaseservices/firebase.ts` & `src/services/firebase.ts`)
- Connects to Firebase project `gasup365` (`gasup365.firebaseapp.com`).
- Exports `app`, `auth` (`getAuth(app)`), and `db` (`getFirestore(app)`).
- Initializes Firebase Analytics conditionally on supported web runtimes.
- **Technical Gap**: `getAuth(app)` is called without `initializeAuth` + React Native `AsyncStorage` persistence, which can cause mobile authentication state to reset on app restart.

### 3.2 Cloud Firestore Collections & Data Disconnects
1. **`users/{uid}` Collection** (Written in `src/screens/AuthScreen.tsx`):
   - Written on account registration via `setDoc(doc(db, 'users', credential.user.uid), ...)`:
     - Fields: `displayName`, `email`, `createdAt: serverTimestamp()`, `points: 0`, `updates: 0`, `role: 'Community Member'`.
   - **Disconnect**: Never read or updated anywhere else in the app.
2. **`markers/{id}` Collection** (Written in `src/screens/CameraCaptureScreen.tsx`, read in `src/hooks/useMapMarkers.ts`):
   - Written via `addDoc(collection(db, 'markers'), ...)` with rich fields:
     - `latitude`, `longitude`, `title`, `description`
     - `imageUrl`, `imageStorage` (`'cloudinary' | 'placeholder'`), `cloudinaryPublicId`
     - `prices: { diesel: number | null, unleaded: number | null, premium: number | null }`
     - `source: 'camera-ocr'`
     - `ocr: { parser, rawText, extractedFuels, missingFields }`
     - `timestamp: serverTimestamp()`
   - **Disconnect**: `src/hooks/useMapMarkers.ts` subscribes to `collection(db, 'markers')` via `onSnapshot`, but maps documents into `MapMarker` containing **only** `{ id, lat, lng, title, description, imageUrl }`. It discards `prices`, `ocr`, `source`, and `timestamp`.

### 3.3 Cloudinary Image Upload (`src/screens/CameraCaptureScreen.tsx`)
- Uploads captured price board photos via unsigned `POST` to `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload` using upload preset `pictures` (cloud name defaults to `dzisx3ntp`).
- Stores the returned `secure_url` in the Firestore marker's `imageUrl` field (or falls back to a `placehold.co` URL when submitting manual prices without a photo).

### 3.4 Missing Backend Config in Repo
- No `firebase.json`, `.firebaserc`, `firestore.rules`, or `firestore.indexes.json` files are tracked in git.

---

## 4. Frontend Analysis (Expo SDK 55 + React Native 0.83)

### 4.1 App Entry & Routing (`src/app/_layout.tsx`)
- `package.json` uses `"main": "expo-router/entry"`.
- `src/app/_layout.tsx` gates the entire app behind Firebase `onAuthStateChanged(auth, ...)`:
  - **Unauthenticated**: Renders `src/screens/AuthScreen.tsx` (segmented Login / Sign Up form).
  - **Authenticated**: Renders Expo Router `<Tabs>` with 4 visible tabs (`index` -> Home, `list` -> List, `add` -> floating Camera button, `profile` -> Profile) and 1 hidden route (`map` with `href: null`).

### 4.2 Screen-by-Screen Breakdown
- **`src/screens/DashboardScreen.tsx` (Home `/` Tab)**:
  - Renders `src/components/LiveMap.tsx`, a custom dual-platform Leaflet component (`WebView` with inline Leaflet HTML on iOS/Android; native DOM `leaflet` on Web) with `expo-location` user dot.
  - Combines the 4 static stations from `src/data/mockStations.ts` with live Firestore markers from `useMapMarkers()`.
  - Displays a top header with marker count and a "Smart diesel route" banner, plus a bottom popup card when a marker is tapped.
- **`src/screens/StationListScreen.tsx` (List `/list` Tab)**:
  - Provides search input, fuel-type filter chips (`Diesel`, `Unleaded`, `Premium`), and sort modes (`Smart`, `Nearest`, `Cheapest`).
  - Uses `scoreStationsForRoute()` from `src/services/fuelRouting.ts` to compute gross fuel savings (vs. area average for a 20L fill), round-trip travel cost (at 12 km/L), and net pesos saved.
  - Renders `src/screens/StationCard.tsx` with one-tap Google Maps navigation (`Linking.openURL`).
- **`src/screens/CameraCaptureScreen.tsx` (Add `/add` Tab)**:
  - Uses `expo-camera` (`CameraView`) on mobile (or displays a "Mobile OCR only" notice on Web).
  - Runs `processGasStationCapture()` (`src/services/receiptOcr.ts`) using `expo-text-recognition` (`getTextFromFrame`) and `parseGasStationText()` (`src/services/gasStationParser.ts`).
  - Extracts 15 Philippine station brands (Petron, Shell, Caltex, Phoenix, Total, SeaOil, Uno, Flying V, PTT, Cleanfuel, Jetti, Unioil, RePhil, Petro Gazz, Pilipinas Shell), street/barangay addresses, EXIF GPS coordinates, and prices for `unleaded`, `special` (mapped to `premium`), and `diesel`.
  - Allows manual editing of all fields before uploading to Cloudinary and saving to Firestore `markers`.
- **`src/screens/ProfileScreen.tsx` (Profile `/profile` Tab)**:
  - Displays `auth.currentUser?.displayName` and a working `signOut(auth)` button, alongside static placeholder stats and menu items.

---

## 5. Undergoing & Unfinished Workflows

### Workflow 1: Live Firestore Markers Disconnected from List & Smart Route Scoring
- **Files**: `src/hooks/useMapMarkers.ts`, `src/screens/StationListScreen.tsx`, `src/screens/DashboardScreen.tsx`, `src/services/fuelRouting.ts`.
- **Gap**:
  - `CameraCaptureScreen` saves `prices: { diesel, unleaded, premium }` to Firestore `markers`, but `useMapMarkers` drops the `prices` object.
  - `StationListScreen` only reads the 4 static stations from `src/data/mockStations.ts`. User-submitted stations never appear in the **List** tab.
  - `DashboardScreen` only runs `scoreStationsForRoute` on static stations (hardcoded to `'diesel'`), and tapping a live Firestore marker's bottom card only closes the card (`setSelectedMarkerId(null)`) instead of opening Google Maps directions.

### Workflow 2: Cloudinary Photo Evidence Not Displayed in UI
- **Files**: `src/screens/CameraCaptureScreen.tsx`, `src/hooks/useMapMarkers.ts`, `src/screens/DashboardScreen.tsx`, `src/components/LiveMap.tsx`, `src/screens/StationCard.tsx`.
- **Gap**:
  - Commit `237c113` added Cloudinary upload and wired `imageUrl` into `useMapMarkers`, but neither `DashboardScreen`'s `markerCard`, `LiveMap`'s popup, nor `StationCard` renders the uploaded station photo.

### Workflow 3: Two Competing Map Screens (`DashboardScreen` vs Hidden `MapViewScreen`)
- **Files**: `src/screens/DashboardScreen.tsx` + `src/components/LiveMap.tsx` vs. `src/screens/MapViewScreen.tsx` + `src/screens/StationLeafletMap.tsx` + `src/screens/StationMap.tsx` + `src/screens/StationMap.native.tsx`.
- **Gap**:
  - `MapViewScreen` (`/map`, hidden via `href: null`) has fuel-type filter chips (`Diesel`, `Unleaded`, `Premium`), a 3-metric summary strip (`Live stations`, `Lowest <Fuel>`, `Best net save`), route line rendering, and the full `StationCard` bottom sheet, but uses `expo-leaflet-navigation-map` and static mock data.
  - `DashboardScreen` (`/`) uses the cross-platform `src/components/LiveMap.tsx` and live Firestore markers, but lacks fuel-type filters and full `StationCard` integration.

### Workflow 4: User Profile Stats & Gamification Loop Unwired
- **Files**: `src/screens/AuthScreen.tsx`, `src/screens/ProfileScreen.tsx`, `src/screens/CameraCaptureScreen.tsx`.
- **Gap**:
  - `AuthScreen` initializes `users/{uid}` in Firestore with `points: 0, updates: 0`.
  - `ProfileScreen` displays hardcoded numbers (`24 Updates`, `156 Points`, `4.8 Rating`, `1,234 drivers`) and 6 unwired menu buttons (`Saved Locations`, `Notifications`, `Price Alerts`, `Settings`, `Help & Support`, `About GasUp365`).
  - `CameraCaptureScreen` does not record `userId` on submitted markers or increment the user's `updates`/`points` in Firestore.

### Workflow 5: Legacy Entry Points, Dead Files & Unused Dependencies
- **Files**:
  - `index.js` and `src/App.tsx`: Legacy pre-Expo-Router entry points (`index.js` has a broken `./App` import; `src/App.tsx` lacks the auth gate).
  - `src/screens/LiveMap.tsx`: Unused early map prototype.
  - `src/services/priceExtraction.ts`: Unused early regex parser superseded by `src/services/gasStationParser.ts`.
  - `src/screens/StationMap.native.tsx`: Identical copy of `src/screens/StationMap.tsx`.
  - `package.json`: Unused dependencies `react-native-maps` and `@tzmax/ocr-common`.

---

## 6. Revision 2 — Verification Addendum (2026-10-21)

Claude re-checked every claim in sections 1–5 against the source and git. All were confirmed, with one correction in 6.2.

### 6.1 Gate results

| Gate | Before dependency fix | After dependency fix |
| :--- | :--- | :--- |
| `npm test` | Pass (2 suites, 8 tests) | Pass (2 suites, 8 tests) |
| `npx tsc --noEmit` | Fail: 9 × `TS2307: Cannot find module '@expo/vector-icons'` | Pass |
| `npm run lint` | Fail: 9 × `import/no-unresolved` (`@expo/vector-icons`) | Pass (clear stale `.expo/cache/eslint` once) |
| `npx expo export --platform android` | Pass | Pass |
| `npx expo export --platform web` | Pass (7 static routes) | Pass (7 static routes) |

**Root cause**: 9 files import `Feather` from `@expo/vector-icons`, but `package.json` never listed it. npm placed it only at `node_modules/expo/node_modules/@expo/vector-icons`. Metro still resolved it, so the app bundled, but TypeScript and ESLint could not find it.
**Fix**: added `"@expo/vector-icons": "^15.0.2"` (the SDK 55 version in `expo/bundledNativeModules.json`) to `dependencies`. In `package-lock.json`, the existing 15.1.1 entry moves to the top level and nothing else changes.
**Note**: Expo's icon guide now marks `@expo/vector-icons` as deprecated in favor of `@react-native-vector-icons/*`. Migrating would be a code change, so it belongs in FEAT-004. The unused `react-native-vector-icons@10.3.0` is also deprecated (npm warns on install).

### 6.2 Correction

- Section 4.2 says the parser extracts 15 brands. `Pilipinas Shell` can never match, because `Shell` comes earlier in `STATION_BRANDS` and the first match wins (`src/services/gasStationParser.ts:128`). In effect it extracts 14.

### 6.3 Findings not covered in Revision 1

1. **Stored XSS in the mobile map** (`src/components/LiveMap.tsx:148`). Firestore `markers.title` and `description` are joined into the Leaflet popup HTML without escaping in the native WebView. The web path uses `escapeHtml`. Any authenticated user can write `markers`, and the repo has no Firestore rules, so a crafted title would run script in every mobile viewer's map WebView.
2. **Scan-on-save drops the scanned prices** (`src/screens/CameraCaptureScreen.tsx:146–167`). When Save triggers a capture, `applyParsedCapture` updates state, but `fuelPrices` is read from the previous render's `diesel`/`unleaded`/`premium` values. The first save fails with "Fuel price needed", and the user has to press Save again.
3. **Silent errors on web**. `react-native-web` implements `Alert.alert` as a no-op, so every validation and error alert in `CameraCaptureScreen` is invisible on web.
4. **More unused dependencies** (no imports in `src/`): `expo-image-picker`, `expo-image`, `react-native-vector-icons`, `expo-glass-effect`, `expo-symbols`, `expo-device`, `expo-web-browser`. Keep `@react-navigation/*`, `expo-constants` and `expo-linking`, because `expo-router` requires them.
5. **Auth persistence confirmed**. In the React Native build of `@firebase/auth`, `getAuth()` logs a no-persistence warning and falls back to `initializeAuth` without persistence. `@react-native-async-storage/async-storage` is not installed.
