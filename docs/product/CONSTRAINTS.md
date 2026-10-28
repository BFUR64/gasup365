# Shared constraints: GasUp365

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-22T20:01:25+08:00
Revision: 3
Status: Draft

## Platform and environment

- **Expo SDK 55 Compliance**: Must strictly adhere to Expo SDK `~55.0.24` (`https://docs.expo.dev/versions/v55.0.0/`), React Native `0.83.6`, React `19.2.0`, and Expo Router `~55.0.14`.
- **Cross-Platform Targets**:
  - **Android & iOS**: Full support for camera preview (`expo-camera`), on-device OCR (`expo-text-recognition`), foreground GPS (`expo-location`), and `WebView` Leaflet maps (`react-native-webview`).
  - **Web**: Static/SPA output (`expo start --web`). Must never import native-only modules (`expo-text-recognition`) at top level on Web; Web uses DOM `leaflet` for maps and shows a graceful notice on the Scan screen while allowing manual price entry.
  - **Network**: the mobile map WebView loads Leaflet 1.9.4 from unpkg and tiles from OpenStreetMap, so the map needs internet on first load.
- **Theme**: Light only (`app.json` `userInterfaceStyle: "light"`) until Len decides on a Night theme (DESIGN-002 §13 Q7).
- **TypeScript Strictness**: `tsconfig.json` enforces `"strict": true`. All new and modified code must pass `npx tsc --noEmit` with zero errors.
- **Dependencies**: Packages imported directly by `src/` must be listed in `package.json`. Add them with `npx expo install`, then check the `package-lock.json` diff: with npm 11.9 it strips unrelated `libc` fields, so keep only the new entries and confirm with `npm ci`.

## UI conventions (DESIGN-002)

- Use the tokens in `src/theme/` and the shared controls in `src/components/ui/`; do not hardcode colours, fonts or shadows in screens.
- Prices always use the Nunito price styles (`type.priceHero`, `type.priceLg`, `type.priceMd`). Pixelify Sans misreads digits and has no `₱` glyph.
- Show "—" or a clear empty state for data that is not tracked yet; never show invented numbers (DESIGN-002 §5.10).
- Use `Dialog` and `Toast` (`src/components/ui/Dialog.tsx`) for messages, not `Alert.alert`, which does nothing on web.
- Escape any data value placed in map HTML with `escapeHtml` (`src/services/pinHtml.ts`).

## Quality and boundaries

### The 5-Stage Development Workflow (`Spec → Design → Create Test → Generate Code → Optimize/Bugfix`)

Every feature or bugfix in GasUp365 must progress through these five explicit gates:

| Stage | Artifact / Location | Gate Criterion |
| :--- | :--- | :--- |
| **1. Spec** | `docs/features/FEAT-NNN-name.md` | Defines user flows, edge cases (loading, empty, offline, error, permission-denied), and `REQ-NNN` table with observable pass/fail criteria. |
| **2. Design** | `docs/plans/FEAT-NNN-implementation.md` + `HANDOFF.md` | Maps phases and file changes to `FEAT-NNN/REQ-NNN`. **Requires Len's explicit chat approval** before Stage 3/4 execution. |
| **3. Create Test** | `src/**/__tests__/*.test.ts` | Unit/integration tests written in Jest (`ts-jest`) covering each `REQ-NNN` scenario (including malformed OCR, missing prices, or edge-case coordinates). |
| **4. Generate Code** | `src/**` | Clean, minimal implementation satisfying the tests without speculative abstractions or unused dependencies. |
| **5. Optimize / Bugfix** | `docs/evidence/FEAT-NNN-verification.md` | Simplify code, fix regressions, pass all automated checks (`npm test`, `npm run lint`, `npx tsc --noEmit`), record evidence, and commit the phase checkpoint. |

## Evidence required

- **Automated Checks (Agent-Executed)**:
  - `npm test` (Jest unit and service integration tests)
  - `npm run lint` (`expo lint` / ESLint flat config)
  - `npx tsc --noEmit` (TypeScript strict verification)
- **Emulator / Web Runtime Checks**:
  - `npx expo export --platform web` and `npx expo export --platform android` must pass.
  - UI changes: screenshots of the web export at 390 × 844 and 1440 × 900.
- **Firestore rules**: `npm run test:rules` (needs Java; runs the emulator on port 8181) whenever `firestore.rules` or a Firestore write changes.
- **CI**: none. The repo has no `.github/workflows/`, so every gate is run by hand and recorded in the verification log.
- **Physical Device Checks (Len-Executed)**:
  - Live `expo-camera` capture and on-device `expo-text-recognition` OCR on a physical Android/iOS device remain `Pending` in `docs/evidence/FEAT-NNN-verification.md` until verified by Len.

## Open questions and approval

- **Environment (resolved in Rev 2)**: Run `npm ci` to install dependencies. As of 2026-10-22 on `feat/ui-redesign`, `npm test` (6 suites, 27 tests), `npm run lint` and `npx tsc --noEmit` all pass. See [../RECON_REPORT.md](../RECON_REPORT.md) §6.1 and [../evidence/UI-REDESIGN-verification.md](../evidence/UI-REDESIGN-verification.md).
- **Question (new in Rev 3)**: Add a GitHub Actions workflow that runs `npm ci`, `npm test`, `npm run lint` and `npx tsc --noEmit` on every pull request? **Proposed**: yes, as part of FEAT-004.
- **Len's Approval**: *Pending chat review and approval of Revision 3.*
