# Current handoff

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-22T20:01:25+08:00
State: UI redesign tested on a phone by Len and merged into local `main`; PR to `BFUR64/gasup365` requested. Firestore rules approved. FEAT-001 selected; its spec and plan are next.
Feature: FEAT-001 (Stage 1, Spec). The UI redesign "Pixel Pump Town" (DESIGN-002 canvas) was done outside the loop at Len's request. The baseline product docs still await approval.

## Read first

1. [AGENTS.md](AGENTS.md): the Expo SDK 55 mandate and the shared **Spec → Design → Create Test → Generate Code → Optimize/Bugfix** workflow policy.
2. [GEMINI.md](GEMINI.md): entry point rules for Gemini.
3. [docs/SPEC_INDEX.md](docs/SPEC_INDEX.md): the master specification index.
4. [docs/RECON_REPORT.md](docs/RECON_REPORT.md): the baseline audit. Section 7 says which findings the UI redesign resolved.
5. Product baseline (drafts awaiting approval):
   - [docs/product/OVERVIEW.md](docs/product/OVERVIEW.md)
   - [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md)
   - [docs/product/DATA_MODEL.md](docs/product/DATA_MODEL.md)
   - [docs/product/CONSTRAINTS.md](docs/product/CONSTRAINTS.md)
6. [docs/design/CLAUDE_DESIGN_HANDOFF.md](docs/design/CLAUDE_DESIGN_HANDOFF.md): the Claude Design handoff (DESIGN-002). It replaces `docs/design/CLAUDE_DESIGN_SPEC.md` (DESIGN-001). Draft; its §13 questions are unanswered.
7. [docs/evidence/UI-REDESIGN-verification.md](docs/evidence/UI-REDESIGN-verification.md): what the UI redesign built, where it differs from the canvas, the checks, and the open issues.

Reread these files and inspect the actual Git status before acting; prior chat memory is not authoritative.

## Approval and allowed work

| Document | Approved revision or commit | Actual Len chat approval reference |
| --- | --- | --- |
| [docs/RECON_REPORT.md](docs/RECON_REPORT.md) | Revisions 1–2 requested by Len; Revision 3 is a status addendum | Rev 1 requested by Len ("save this findings in an md files first"). Rev 2 addendum written after Len asked Claude to verify the findings and fix the dependency issue. Rev 3 written for the documentation refresh below. |
| [docs/product/OVERVIEW.md](docs/product/OVERVIEW.md) | Revision 2 (Draft) | Pending |
| [docs/product/ARCHITECTURE.md](docs/product/ARCHITECTURE.md) | Revision 2 (Draft) | Pending |
| [docs/product/DATA_MODEL.md](docs/product/DATA_MODEL.md) | Revision 2 (Draft) | Pending |
| [docs/product/CONSTRAINTS.md](docs/product/CONSTRAINTS.md) | Revision 3 (Draft) | Pending |
| [docs/design/CLAUDE_DESIGN_SPEC.md](docs/design/CLAUDE_DESIGN_SPEC.md) | Revision 1 (Superseded by DESIGN-002) | Requested by Len ("come up with a detailed spec file for claude design") |
| [docs/design/CLAUDE_DESIGN_HANDOFF.md](docs/design/CLAUDE_DESIGN_HANDOFF.md) | Revision 1 (Draft) | Requested by Len ("Create a detailed handoff md that i can drop off to claude design"). On 2026-10-22 Len gave Revision 1 to Claude Design as-is. The 9 open questions in §13 are still unanswered; the implementation used the proposed defaults for Q1, Q2, Q7 and Q8 (see the status note at the top of DESIGN-002). |
| Claude Design canvas "GasUp365 · Pixel Pump Town" (https://claude.ai/artifact/FjhkR3fFkF2zsvGkVSYLji) | Version 1792629665-66fc | 2026-10-22: Len asked "Can you implement this full ui redesign here: <canvas link>". Implemented in `e333f07` and `94497ea`; see [docs/evidence/UI-REDESIGN-verification.md](docs/evidence/UI-REDESIGN-verification.md). |
| Documentation refresh (this revision of every doc above) | Committed on `feat/ui-redesign` | 2026-10-22: Len asked "please update all of the documentation first before proceeding in working." |
| Commit docs, merge into local `main`, open a PR to BFUR64's repo, add Firestore security rules, start FEAT-001 | — | 2026-10-22: Len: "Yes commit the docs and I've already tested the app on a phone it works fine. Push to local/main and create a PR to the main repo (the one BFUR owns) yes add firestore security rules, and i approve feat-001". |

Approved outside the feature loop: Len asked in chat for the `@expo/vector-icons` dependency fix ("Go fix the dependency issue now"). Done and committed in `a769f0f`.

Allowed phases: None until approval is recorded.
Architecture and behavior changes return to Len; this handoff cannot override the linked specs.

## Progress and working tree

### Git (checked 2026-10-22)

| Ref | Commit | Notes |
| --- | --- | --- |
| `feat/ui-redesign` (current) | `94497ea` | 2 commits ahead of local `main`: `e333f07` (UI redesign) and `94497ea` (prices in Nunito). Not merged, not pushed. |
| `main` (local) | `1a49a23` | Same commit as `baseline/dd-workflow`. **3 commits ahead of `origin/main`** (`edd0d0d` agent toolkit, `a769f0f` baseline, `1a49a23` DESIGN-002). Not pushed. |
| `baseline/dd-workflow` | `1a49a23` | Already contained in local `main`; can be deleted once Len confirms. |
| `origin/main` | `c0207da` | "Update README.md". |

- There is no CI. The repo has no `.github/workflows/`, so the gates are run by hand.
- Untracked files to preserve: none at the moment. `.agents/`, `.claude/skills/`, `.editorconfig` and `GEMINI.md` were committed in `edd0d0d`.

### Done

- **Baseline (2026-10-21)**: full reconnaissance, saved to [docs/RECON_REPORT.md](docs/RECON_REPORT.md); the document-driven structure (`docs/SPEC_INDEX.md`, `docs/product/*`, `HANDOFF.md`, `AGENTS.md`); every gate run; `@expo/vector-icons` declared as a direct dependency (committed in `a769f0f`).
- **Design (2026-10-22)**: UI/UX evaluation and a council review of the layout (DESIGN-002 §2 and §4). DESIGN-002 written and given to Claude Design. Open finding: with the current sample data, Smart Route's best Diesel and Unleaded picks have a negative net saving after travel (DESIGN-002 §11.1, open question 9).
- **UI redesign (2026-10-22)**: every canvas artboard built on `feat/ui-redesign`: pixel theme tokens, custom pixel icons and sprites, Hotbar tab bar and wide rail, Auth/Boot title scene, World + HUD map with escaped pixel pins and a tap-to-expand sheet, leaderboard Stations, Snap → Review → Share scan flow with in-app dialogs and toasts, reward popup, Me character sheet, 1440 px two-pane. Prices use Nunito (Len's choice).
- **Documentation refresh (2026-10-22)**: every doc updated to match the code after the redesign.
- **Device check (2026-10-22)**: Len tested the redesign on a phone: "it works fine".
- **Firestore rules (2026-10-22)**: `firestore.rules`, `firebase.json`, `.firebaserc`, and 10 emulator tests (`npm run test:rules`). **Not deployed.** See [docs/evidence/FIRESTORE-RULES-verification.md](docs/evidence/FIRESTORE-RULES-verification.md).

### Feature backlog status (after the UI redesign)

| ID | What is still missing | Changed by the redesign |
| --- | --- | --- |
| `FEAT-001` Live station pipeline | Community markers are not scored by Smart Route and are not in the Stations list. `Station.id` is still `number`. Distances are static sample values. | `useMapMarkers` now passes `prices` through; community pins show the selected fuel's price; the sheet shows their prices and a Navigate button. |
| `FEAT-002` Map consolidation and photo evidence | Only the hidden `/map` route and its files remain (proposed to fold into FEAT-004). | The map tab now has the fuel hotbar, the station sheet, and the Cloudinary photo for community updates. |
| `FEAT-003` Profile and contributor points | `users/{uid}` is never read or updated; markers have no `userId`; coins are not saved. | Me shows "—" instead of the old hardcoded numbers; the reward popup shows placeholder coins (+10, +5 with a photo). |
| `FEAT-004` Cleanup | Legacy files and unused dependencies (list in RECON §7.3). | Nothing removed. `@expo/vector-icons` is now used only by legacy files. |
| `FEAT-005` Freshness and trust | Not started. | The sheet has no freshness bar, because sample stations have no real timestamps. |

## Checks and evidence

| Check | Command | Environment | Result | Notes |
| --- | --- | --- | --- | --- |
| Unit Tests | `npm test` | Git Bash, Node 24.14.0 / npm 11.9.0 | Pass (2 suites, 8 tests) | 2026-10-21, before and after the dependency fix. |
| Linter | `npm run lint` | Git Bash | Pass (0 problems) | Before the fix: 9 `import/no-unresolved` errors for `@expo/vector-icons`. After the fix, clear the stale `.expo/cache/eslint` cache once. |
| Typecheck | `npx tsc --noEmit` | Git Bash | Pass (0 errors) | Before the fix: 9 `TS2307: Cannot find module '@expo/vector-icons'` errors. |
| Android bundle | `npx expo export --platform android` | Git Bash | Pass | Passed both before and after the fix. |
| Web static export | `npx expo export --platform web` | Git Bash | Pass | All 7 static routes rendered, before and after the fix. |
| UI redesign gates | `npm test`, `npm run lint`, `npx tsc --noEmit`, web and Android exports | Git Bash, 2026-10-22 | Pass (6 suites, 27 tests; 0 lint problems; 0 type errors) | Plus headless Edge screenshots of the web export. Not run on a physical device. |
| Documentation refresh | None (docs only) | 2026-10-22 | Not run | No code changed, so the gates were not rerun. |
| Firestore rules | `npm run test:rules` | PowerShell and Git Bash, Java 24.0.2, 2026-10-22 | Pass (1 suite, 10 tests) | Emulator on port 8181 (8080 is taken by `httpd`). On Windows the emulator's Java process stays running afterwards; stop it before the next run. `npm test` (27), lint and tsc rerun: pass. |
| Physical device | Manual, by Len | Phone (model not recorded), 2026-10-22 | Pass | Len: "I've already tested the app on a phone it works fine". |

## Blockers and attempts

| Problem | Fix-and-check attempts used (maximum 3) | Changes tried and observed result | Required decision or access |
| --- | --- | --- | --- |
| `node_modules` not installed in workspace | Resolved | `npm ci` installed 1084 packages, exit 0 | None |
| `npm run test:rules` fails with "Could not start Firestore Emulator, port taken" | Resolved (2 attempts) | Attempt 1: port 8080 is held by `httpd`; moved the emulator to 8181. Attempt 2: the next run hit the same error because the previous run's emulator Java process was still listening on 8181 (a Windows `emulators:exec` issue). Stopping that process fixes it; documented in the verification log. | None |
| Lint and typecheck fail on `@expo/vector-icons` | Resolved (lint took 2 attempts) | Attempt 1: `npx expo install @expo/vector-icons` fixed tsc, but lint still failed because `expo lint` reused a stale cache, and npm 11.9 also stripped unrelated `libc` fields from the lockfile. Attempt 2: rebuilt the lockfile from HEAD with only the vector-icons entry moved, `npm ci` accepted it, cleared `.expo/cache/eslint`, and all gates passed. | None |

Do not reset a count on a new session or silently reinterpret a failed check as passing.

## Next action

1. **Len**: review the redesign on a phone (camera, OCR, WebView map, safe areas), then merge `feat/ui-redesign` into `main`. Two small open issues are in the verification log: rank and stepper numbers still use Pixelify, and the web export logs hydration error #418.
2. **Len**: decide whether to push local `main` (3 commits) to `origin`, and whether to delete `baseline/dd-workflow`.
3. **Len**: decide whether to add Firestore security rules before FEAT-001. The unescaped popup HTML (RECON §6.3 item 1) is gone, but any signed-in user can still write any `markers` document, and the repo has no `firestore.rules`.
4. **Len**: review and approve the baseline product docs (`docs/product/*`), answer the DESIGN-002 §13 questions (Q1, Q2, Q7 and Q8 only need a yes to the defaults already built), and pick the first feature to spec (recommended: **FEAT-001**).
5. **Claude**: once approved, draft `docs/features/FEAT-001-live-station-pipeline.md` (Stage 1) and `docs/plans/FEAT-001-implementation.md` (Stage 2) for Len's approval before Stages 3–5.
