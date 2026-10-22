# GasUp365 ⛽️ – Live Community Fuel Prices in the Philippines

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-111827?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-SDK%2055-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=111827)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Build](https://img.shields.io/badge/CI-coming%20soon-lightgrey?style=for-the-badge)

GasUp365 helps Filipino drivers find better fuel stops faster with community-powered prices, camera-assisted updates, live maps, and smart route savings.

## 📚 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Screenshots & Demo](#-screenshots--demo)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

## 🌏 Overview

Fuel prices in the Philippines move constantly, and every peso per liter matters for jeepney, tricycle, bus, taxi, Grab, delivery, and daily commuter drivers. Today, many motorists still rely on word-of-mouth or burn extra fuel driving around just to compare nearby station prices.

GasUp365 turns that daily pain into a shared, real-time network. Drivers can scan a station price board, review OCR + NLP results, attach GPS location, and publish an update to a live fuel map. Other users can filter by fuel type, compare stations, estimate net savings after travel cost, and open Google Maps directions in one tap.

The current MVP is focused on Kalibo, Aklan and already includes authentication, camera capture, OCR parsing, Firebase-backed live markers, station lists, map views, and route scoring. The long-term vision is a national, community-powered fuel intelligence layer for Filipino motorists.

## ✨ Key Features

- 📸 **Scan Price Boards** – Capture fuel boards with `expo-camera`; mobile OCR uses `expo-text-recognition`.
- 🧠 **OCR + Gas Station NLP** – Extracts station brands, address hints, GPS metadata, and fuel prices for diesel, unleaded, and special/premium.
- 📝 **Snap → Review → Share** – Users check and correct the OCR results (each field is marked detected, edited or needs a check) before sharing a price.
- 🔥 **Firebase Auth** – Email/password login and signup powered by Firebase Authentication.
- 🗺️ **Live Price Map** – Firestore `markers` stream into a Leaflet/OpenStreetMap map with pixel-art price pins and a tap-to-expand station sheet showing prices, Smart Route savings and the price board photo.
- 📍 **GPS Location Capture** – Uses `expo-location` to place station updates on the map.
- ⛽ **Fuel Filters** – Switch between diesel, unleaded, and premium from the fuel hotbar.
- 💸 **Smart Route Savings** – Scores stations by fuel price, distance, estimated travel cost, and net pesos saved.
- 📋 **Searchable Price List** – Sort stations by smart savings, nearest, or cheapest.
- 🧭 **One-Tap Navigation** – Opens Google Maps driving directions to selected stations.
- 👤 **Me Screen** – Character-sheet profile with sign out. Stats, ranks and badges are placeholders until contributor points are wired up.
- 🎮 **Pixel Pump Town UI** – An original pixel-art game look with a hotbar tab bar, and a two-pane layout on wide screens.
- 🧪 **Service Tests** – Jest tests cover OCR processing, gas station text parsing, station presentation, map pins, scan review rules, and station view models.

> Note: Camera OCR is mobile-only in the current app. Web builds show a mobile OCR notice while still supporting manual price entry and the map and station list. Smart Route and the Stations list currently score only the 4 Kalibo sample stations; community updates appear on the map.

## 🖼 Screenshots & Demo

Add screenshots, GIFs, or short videos here once the app flow is captured.

```md
| Live Map | Scan Price | Station List |
| --- | --- | --- |
| ![Live Map](./docs/screenshots/live-map.png) | ![Scan Price](./docs/screenshots/scan-price.png) | ![Station List](./docs/screenshots/station-list.png) |
```

Suggested captures:

- Login / signup screen
- Live map with station markers
- Scan price board flow
- OCR review form
- Smart route station card
- Fuel list sorted by cheapest or best net save

## 🧰 Tech Stack

| Area | Technology |
| --- | --- |
| App framework | Expo SDK 55 |
| UI runtime | React Native 0.83, React 19.2 |
| Language | TypeScript 5.9 with `strict` mode |
| Routing | Expo Router typed routes |
| Navigation | Expo Router tabs, React Navigation |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Analytics | Firebase Analytics on supported web runtimes |
| Camera | `expo-camera` |
| OCR | `expo-text-recognition` |
| Location | `expo-location` |
| Maps | Leaflet, OpenStreetMap tiles, `react-native-webview` |
| Icons | Custom pixel-art icons and sprites drawn with `react-native-svg` |
| Fonts | Pixelify Sans, Silkscreen, Nunito via `@expo-google-fonts/*` |
| Styling | React Native `StyleSheet` with shared design tokens in `src/theme/` |
| State | React hooks, local state, Firestore realtime snapshots |
| Testing | Jest, ts-jest |
| Linting | Expo ESLint config |

## 🚀 Getting Started

### Prerequisites

Expo SDK 55 targets React Native 0.83 and React 19.2. Use a modern Node.js runtime compatible with Expo SDK 55.

Recommended:

```bash
node --version
npm --version
```

### 1. Clone the repository

```bash
git clone git@github.com:BFUR64/gasup365.git
cd gasup365
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure Firebase

The Firebase client is initialized in:

```txt
src/firebaseservices/firebase.ts
```

For your own Firebase project, replace the config object with your Firebase Web App config:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

Enable these Firebase services:

- Authentication → Email/Password provider
- Firestore Database
- Analytics, optional for supported web runtimes

The app currently reads and writes station updates in the `markers` collection.

### 4. Start the Expo development server

```bash
npx expo start
```

Then choose your target:

```bash
npm run android
npm run ios
npm run web
```

### 5. Run quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
```

## 🗂 Project Structure

```txt
gasup365/
├── app.json                     # Expo SDK 55 app config, plugins, permissions
├── package.json                 # Scripts and dependencies
├── tsconfig.json                # Strict TypeScript config and path aliases
├── jest.config.js               # Jest + ts-jest setup
├── assets/                      # App icons, splash assets, branding
├── scripts/                     # Expo project utility scripts
└── src/
    ├── app/                     # Expo Router tab routes
    │   ├── _layout.tsx          # Fonts, auth gate + Hotbar tab navigation
    │   ├── index.tsx            # Map tab
    │   ├── list.tsx             # Stations tab
    │   ├── add.tsx              # Scan tab (camera/OCR)
    │   ├── profile.tsx          # Me tab
    │   └── map.tsx              # Hidden legacy map route (to be removed)
    ├── components/              # Map, station sheet, list, Hotbar, reward popup
    │   └── ui/                  # Pixel buttons, inputs, dialogs, tags, stepper
    ├── data/                    # Kalibo sample station data
    ├── firebaseservices/        # Firebase initialization
    ├── hooks/                   # Firestore markers, user location, layout
    ├── screens/                 # App screens
    ├── services/                # OCR parsing, routing, station view models, pins, scan review
    ├── test/                    # Test mocks
    ├── theme/                   # Colors, type scale, shadows, spacing
    ├── types/                   # Shared TypeScript types
    └── ui/                      # Pixel-art icons and sprites
```

## 📱 Usage

### Scan and submit a station update

1. Sign in or create an account.
2. Tap **Scan**.
3. Allow camera and location permissions.
4. Snap a fuel station price board (or type the prices).
5. Review the extracted station name, address, and fuel prices.
6. Fix anything marked for a check.
7. Tap **Share price** to add the update to the live map.

### Find the best fuel stop

1. Open the **Map** or **Stations** tab.
2. Choose a fuel type: diesel, unleaded, or premium.
3. On Stations, sort by smart savings, nearest, or cheapest.
4. Tap a station pin or row to see its prices and route savings.
5. Tap **Navigate** to open Google Maps directions.

### Contribute better data

GasUp365 is built around a simple community loop: when one driver shares a verified price, every nearby driver benefits. Fresh station updates make the map more useful for transport workers, delivery riders, commuters, and fleet operators.

## 🤝 Contributing

Contributions are welcome.

Before opening a pull request:

```bash
npm ci
npm test
npm run lint
npx tsc --noEmit
```

Good first contribution areas:

- Improve OCR parsing for more Philippine fuel brands
- Add richer Firestore security rules documentation
- Add screenshots and demo GIFs
- Build price freshness indicators
- Add notification and alert flows
- Expand mock/prototype coverage beyond Kalibo, Aklan

Please keep changes focused, tested, and aligned with the app’s mission: helping Filipino drivers save money with accurate, timely fuel price data.

## 🛣 Roadmap

### Phase 1 – Kalibo MVP

- ✅ Firebase email authentication
- ✅ Live Firestore station markers
- ✅ Camera capture and OCR parsing on mobile
- ✅ Manual correction before submit
- ✅ Kalibo fuel map and station list
- ✅ Smart route savings calculation
- ✅ Google Maps navigation links
- ✅ Pixel Pump Town UI redesign
- 🚧 Community updates in Smart Route and the station list
- 🚧 Screenshot/demo documentation

### Phase 2 – Community Trust

- Upvote/downvote price accuracy
- Photo evidence review
- Timestamp freshness and dimmed stale entries
- Contributor points backed by real user activity
- Better station matching and duplicate prevention
- Firestore rules and moderation tooling

### Phase 3 – National Fuel Intelligence

- Price drop alerts and watched stations
- Offline fallback with last-synced prices
- Regional and national fuel price dashboard
- Fleet and LGU reporting views
- Wider rollout across provinces beyond Aklan
- Serverless validation and analytics pipelines

## 📄 License

GasUp365 is released under the [MIT License](./LICENSE).

Copyright © 2026 BFUR64.

## 🙏 Acknowledgements

GasUp365 is built with gratitude for the open-source mobile ecosystem:

- [Expo](https://expo.dev/) and [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Jest](https://jestjs.io/)
- The Filipino drivers, riders, commuters, and transport workers this project is designed to support
