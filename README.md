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
- 📝 **Manual Review Before Submit** – Users can correct OCR results before saving a station update.
- 🔥 **Firebase Auth** – Email/password login and signup powered by Firebase Authentication.
- 🗺️ **Live Price Map** – Firestore `markers` stream into a Leaflet/OpenStreetMap-powered map.
- 📍 **GPS Location Capture** – Uses `expo-location` to place station updates on the map.
- ⛽ **Fuel Filters** – Compare diesel, unleaded, and premium prices.
- 💸 **Smart Route Savings** – Scores stations by fuel price, distance, estimated travel cost, and net pesos saved.
- 📋 **Searchable Price List** – Sort stations by smart savings, nearest, or cheapest.
- 🧭 **One-Tap Navigation** – Opens Google Maps driving directions to selected stations.
- 👤 **Community Profile UI** – User profile, contribution stats, menu actions, and sign out flow.
- 🧪 **Service Tests** – Jest tests cover OCR processing and gas station text parsing.

> Note: Camera OCR is mobile-only in the current app. Web builds show a mobile OCR notice while still supporting the map/list experience.

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
| Maps | Leaflet, OpenStreetMap tiles, `react-native-webview`, `expo-leaflet-navigation-map` |
| Icons | Feather icons via `@expo/vector-icons`, Expo Symbols |
| Styling | React Native `StyleSheet`, shared color theme |
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
npm install
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
npm run lint
npm test
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
    │   ├── _layout.tsx          # Auth gate + tab navigation
    │   ├── index.tsx            # Dashboard route
    │   ├── add.tsx              # Camera/OCR submission route
    │   ├── list.tsx             # Station list route
    │   ├── map.tsx              # Map dashboard route
    │   └── profile.tsx          # Profile route
    ├── components/              # Shared UI components
    ├── data/                    # Kalibo prototype station data
    ├── firebaseservices/        # Firebase initialization
    ├── hooks/                   # Firestore realtime marker hooks
    ├── screens/                 # App screens and screen-specific components
    ├── services/                # OCR parsing, routing, price extraction
    ├── test/                    # Test mocks
    ├── theme/                   # Shared color palette
    └── types/                   # Shared TypeScript types
```

## 📱 Usage

### Scan and submit a station update

1. Sign in or create an account.
2. Tap **Add**.
3. Allow camera and location permissions.
4. Scan a fuel station price board.
5. Review the extracted station name, location, and fuel prices.
6. Correct any missing fields.
7. Save the update to the live map.

### Find the best fuel stop

1. Open the map or list view.
2. Choose a fuel type: diesel, unleaded, or premium.
3. Sort by smart savings, nearest, or cheapest.
4. Tap a station card to inspect prices and route savings.
5. Tap **Navigate** to open Google Maps directions.

### Contribute better data

GasUp365 is built around a simple community loop: when one driver shares a verified price, every nearby driver benefits. Fresh station updates make the map more useful for transport workers, delivery riders, commuters, and fleet operators.

## 🤝 Contributing

Contributions are welcome.

Before opening a pull request:

```bash
npm install
npm run lint
npm test
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
