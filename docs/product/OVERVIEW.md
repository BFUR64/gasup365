# Product overview: GasUp365

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-21T10:55:54+08:00
Revision: 1
Status: Draft

## Purpose and users

Fuel prices in the Philippines fluctuate weekly, directly impacting the daily take-home pay of transport workers (*manggagawa sa transportasyon* — jeepney, tricycle, bus, taxi, TNVS/Grab drivers), delivery riders, and daily commuters. Currently, drivers rely on word-of-mouth or burn fuel driving around to compare station prices.

**GasUp365** is a community-powered mobile and web application (MVP focused on Kalibo, Aklan) that turns price discovery into a real-time loop:
1. **Capture**: Drivers snap a photo of a gas station price board (or enter prices manually).
2. **Extract**: On-device OCR (`expo-text-recognition`) + keyword/regex NLP (`gasStationParser.ts`) extracts station brand, address, GPS coordinates, and prices for Diesel, Unleaded, and Premium/Special.
3. **Share**: Verified prices and photo evidence (via Cloudinary) are published to Cloud Firestore (`markers`).
4. **Save & Navigate**: Nearby drivers view live prices on the map or list, compare stations by **Smart Route Savings** (gross fuel savings minus round-trip travel fuel cost), and launch turn-by-turn Google Maps navigation in one tap.

**Observable Success**: A driver can sign in, view both baseline and community-submitted stations on the map and list, filter by fuel type (`diesel`, `unleaded`, `premium`), see accurate net peso savings based on their location, and submit a new station price update with photo evidence.

## Planned capabilities and main flows

Based on the baseline audit in [../RECON_REPORT.md](../RECON_REPORT.md), the product capabilities and backlog features are organized as follows:

| Feature ID | Feature Name | Current State | Target Outcome |
| :--- | :--- | :--- | :--- |
| **FEAT-001** | **Unified Live Station Data & Smart Routing Pipeline** | Partial (`useMapMarkers` drops `prices`; `StationListScreen` and `scoreStationsForRoute` only use static `mockStations.ts`) | Parse Firestore `markers` into full `Station` objects with live prices, dynamic user-distance calculation, list integration, and Google Maps navigation for live markers. |
| **FEAT-002** | **Map Dashboard Consolidation & Photo Evidence UI** | Partial (Split between active `DashboardScreen` and hidden `MapViewScreen`; Cloudinary `imageUrl` not rendered) | Consolidate fuel-type filter chips, metric strip, and `StationCard` + Cloudinary photo preview into the main `DashboardScreen` map flow. |
| **FEAT-003** | **Community Profile & Contributor Points Loop** | Unwired (`AuthScreen` creates `users/{uid}`, but `ProfileScreen` shows hardcoded stats and `CameraCaptureScreen` does not credit users) | Connect `ProfileScreen` to live Firestore `users/{uid}` data and increment user `updates` and `points` when submitting station updates. |
| **FEAT-004** | **Codebase Hygiene & Legacy Cleanup** | Pending (`index.js`, `src/App.tsx`, `src/screens/LiveMap.tsx`, `src/services/priceExtraction.ts`, unused deps) | Remove dead prototypes and unused packages, and ensure clean lint, typecheck, and Jest test execution. |
| **FEAT-005** | **Community Trust & Freshness Indicators (Phase 2)** | Planned | Price timestamp freshness labels, stale entry dimming, and accuracy upvote/report mechanics. |

## Scope and non-goals

### In Scope (Kalibo MVP Baseline)
- Cross-platform Expo SDK 55 app (Android, iOS, Web) using Expo Router tabs.
- Firebase Email/Password authentication and Cloud Firestore real-time synchronization.
- Mobile camera capture + on-device OCR (`expo-text-recognition`) + Philippine fuel station NLP parser (`gasStationParser.ts`), with manual input fallback on Web and Mobile.
- Unsigned Cloudinary photo upload for price board evidence.
- Smart route scoring (`fuelRouting.ts`) and external Google Maps driving direction links.

### Non-Goals (Current Release)
- Custom backend server or relational database (all persistence remains serverless via Firebase + Cloudinary).
- On-device camera OCR on Web browsers (Web displays a mobile-only OCR notice while supporting manual price entry, live map, and station list).
- In-app turn-by-turn navigation engine (delegated to Google Maps via deep link).

## Open questions and approval

- **Proposal 1 (Feature Priority)**: Start with **FEAT-001 (Unified Live Station Data & Smart Routing Pipeline)** so user-submitted Firestore markers work end-to-end across the Map, List, and Smart Route calculator, followed by **FEAT-002 (Map Dashboard Consolidation & Photo Evidence UI)**.
- **Proposal 2 (Static + Live Station Merging)**: Keep the 4 Kalibo prototype stations in `mockStations.ts` as fallback/seed stations alongside live Firestore `markers` so the app always has rich comparison data during demos.
- **Len's Approval**: *Pending chat review and approval of Revision 1.*
