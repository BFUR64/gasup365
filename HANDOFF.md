# Current handoff

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-21T15:30:16+08:00
State: Awaiting approval
Feature: Baseline Setup (`PROD-OVERVIEW`, `PROD-ARCH`, `PROD-DATA`, `PROD-CONSTRAINTS`)

## Read first

1. [AGENTS.md](AGENTS.md) — Expo SDK 55 mandate and shared **Spec → Design → Create Test → Generate Code → Optimize/Bugfix** workflow policy.
2. [GEMINI.md](GEMINI.md) — Entry point rules.
3. [docs/SPEC_INDEX.md](docs/SPEC_INDEX.md) — Master specification index and lifecycle stages.
4. [docs/RECON_REPORT.md](docs/RECON_REPORT.md) — Full baseline reconnaissance report of backend, frontend, and unfinished workflows.
5. Product Baseline (Drafts awaiting approval):
   - [docs/product/OVERVIEW.md](docs/product/OVERVIEW.md)
   - [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md)
   - [docs/product/DATA_MODEL.md](docs/product/DATA_MODEL.md)
   - [docs/product/CONSTRAINTS.md](docs/product/CONSTRAINTS.md)

Reread these files and inspect actual Git status before acting; prior chat memory is not authoritative.

## Approval and allowed work

| Document | Approved revision or commit | Actual Len chat approval reference |
| --- | --- | --- |
| [docs/RECON_REPORT.md](docs/RECON_REPORT.md) | Revision 2 (Baseline Audit + verification addendum) | Rev 1 requested by Len ("save this findings in an md files first"); Rev 2 addendum written after Len asked Claude to verify the findings and fix the dependency issue |
| [docs/product/OVERVIEW.md](docs/product/OVERVIEW.md) | Revision 1 (Draft) | Pending |
| [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md) | Revision 1 (Draft) | Pending |
| [docs/product/DATA_MODEL.md](docs/product/DATA_MODEL.md) | Revision 1 (Draft) | Pending |
| [docs/product/CONSTRAINTS.md](docs/product/CONSTRAINTS.md) | Revision 2 (Draft) | Pending |

Approved outside the feature loop: Len asked in chat for the `@expo/vector-icons` dependency fix ("Go fix the dependency issue now"). Done; see Checks.

Allowed phases: None until approval is recorded.
Architecture and behavior changes return to Len; this handoff cannot override the linked specs.

## Progress and working tree

- **Branch**: `main` at `c0207da` (`Update README.md`).
- **Completed**:
  - Full reconnaissance of backend (Firebase Auth, Firestore `markers` & `users`, Cloudinary) and frontend (Expo Router tabs, screens, OCR/NLP services, route scoring).
  - Saved findings to [docs/RECON_REPORT.md](docs/RECON_REPORT.md).
  - Initialized document-driven workflow structure (`docs/SPEC_INDEX.md`, `docs/product/*`, `HANDOFF.md`, `AGENTS.md`).
  - Verified the recon findings against the code and ran every gate (results in [docs/RECON_REPORT.md](docs/RECON_REPORT.md) section 6).
  - Added `@expo/vector-icons` (`^15.0.2`, the SDK 55 version from `expo/bundledNativeModules.json`) as a direct dependency. It was previously only nested under `node_modules/expo/node_modules`. Uncommitted changes: `package.json` and `package-lock.json`. The lockfile diff only moves the existing 15.1.1 entry to the top level and leaves other entries untouched.
- **Unfinished Product Workflows Identified**:
  1. `FEAT-001`: Live Firestore markers (`useMapMarkers`) drop `prices` and are disconnected from `StationListScreen` and `scoreStationsForRoute`.
  2. `FEAT-002`: Cloudinary `imageUrl` is uploaded on scan but never displayed in `DashboardScreen` / `LiveMap` / `StationCard`; `DashboardScreen` and hidden `MapViewScreen` duplicate map responsibilities.
  3. `FEAT-003`: `ProfileScreen` uses hardcoded stats instead of reading/incrementing Firestore `users/{uid}`.
  4. `FEAT-004`: Legacy files (`index.js`, `src/App.tsx`, `src/screens/LiveMap.tsx`, `src/services/priceExtraction.ts`) and unused dependencies remain in tree.
- **Unrelated / Untracked Files to Preserve**: `.agents/`, `.claude/skills/`, `.editorconfig`, `GEMINI.md`.

Reconcile this record with Git before resuming, especially after an interrupted commit.

## Checks and evidence

| Check | Command | Environment | Result | Notes |
| --- | --- | --- | --- | --- |
| Unit Tests | `npm test` | Git Bash, Node 24.14.0 / npm 11.9.0 | Pass (2 suites, 8 tests) | Run 2026-10-21 by Claude, before and after the dependency fix. |
| Linter | `npm run lint` | Git Bash | Pass (0 problems) | Before the fix: 9 `import/no-unresolved` errors for `@expo/vector-icons`. After the fix, clear the stale `.expo/cache/eslint` cache once. |
| Typecheck | `npx tsc --noEmit` | Git Bash | Pass (0 errors) | Before the fix: 9 `TS2307: Cannot find module '@expo/vector-icons'` errors. |
| Android bundle | `npx expo export --platform android` | Git Bash | Pass | Passed both before and after the fix. Metro could already resolve the nested copy. |
| Web static export | `npx expo export --platform web` | Git Bash | Pass | All 7 static routes rendered, before and after the fix. |

## Blockers and attempts

| Problem | Fix-and-check attempts used (maximum 3) | Changes tried and observed result | Required decision or access |
| --- | --- | --- | --- |
| `node_modules` not installed in workspace | Resolved | `npm ci` installed 1084 packages, exit 0 | None |
| Lint and typecheck fail on `@expo/vector-icons` | Resolved (lint took 2 attempts) | Attempt 1: `npx expo install @expo/vector-icons` fixed tsc, but lint still failed because `expo lint` reused a stale cache from before the fix, and npm 11.9 also stripped unrelated `libc` fields from the lockfile. Attempt 2: rebuilt the lockfile from HEAD with only the vector-icons entry moved, `npm ci` accepted it, cleared `.expo/cache/eslint`, and all gates passed. | None |

Do not reset a count on a new session or silently reinterpret a failed check as passing.

## Next action

0. Len to decide whether to fix the unescaped marker popup HTML in the mobile WebView (`src/components/LiveMap.tsx:148`) and add Firestore rules before FEAT-001 (see [docs/RECON_REPORT.md](docs/RECON_REPORT.md) §6.3).
1. Obtain Len's review and approval of the baseline product docs (`docs/product/*`) and select the first feature to spec in detail (recommended: **FEAT-001: Unified Live Station Data & Smart Routing Pipeline**).
2. Draft `docs/features/FEAT-001-live-station-pipeline.md` (Stage 1: Spec) and `docs/plans/FEAT-001-implementation.md` (Stage 2: Design/Plan) for Len's approval before Stage 3 (Create Test), Stage 4 (Generate Code), and Stage 5 (Optimize/Bugfix).
