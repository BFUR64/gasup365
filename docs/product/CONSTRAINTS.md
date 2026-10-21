# Shared constraints: GasUp365

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-21T15:30:16+08:00
Revision: 2
Status: Draft

## Platform and environment

- **Expo SDK 55 Compliance**: Must strictly adhere to Expo SDK `~55.0.24` (`https://docs.expo.dev/versions/v55.0.0/`), React Native `0.83.6`, React `19.2.0`, and Expo Router `~55.0.14`.
- **Cross-Platform Targets**:
  - **Android & iOS**: Full support for camera preview (`expo-camera`), on-device OCR (`expo-text-recognition`), foreground GPS (`expo-location`), and `WebView` Leaflet maps (`react-native-webview`).
  - **Web**: Static/SPA output (`expo start --web`). Must never import native-only modules (`expo-text-recognition`) at top level on Web; Web uses DOM `leaflet` for maps and shows a graceful notice on the Camera OCR panel while allowing manual form submission.
- **TypeScript Strictness**: `tsconfig.json` enforces `"strict": true`. All new and modified code must pass `npx tsc --noEmit` with zero errors.

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
  - Web bundler compilation and UI verification where applicable.
- **Physical Device Checks (Len-Executed)**:
  - Live `expo-camera` capture and on-device `expo-text-recognition` OCR on a physical Android/iOS device remain `Pending` in `docs/evidence/FEAT-NNN-verification.md` until verified by Len.

## Open questions and approval

- **Environment (resolved in Rev 2)**: Run `npm ci` to install dependencies. As of 2026-10-21, `npm test`, `npm run lint` and `npx tsc --noEmit` all pass. Packages imported directly by `src/` must be listed in `package.json` (add them with `npx expo install`) rather than relying on Expo's transitive dependencies. See [../RECON_REPORT.md](../RECON_REPORT.md) §6.1.
- **Len's Approval**: *Pending chat review and approval of Revision 1.*
