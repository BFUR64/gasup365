# UI redesign ("Pixel Pump Town") verification

Created: 2026-10-22
Updated: 2026-10-22T20:01:25+08:00
Source design: Claude Design canvas "GasUp365 · Pixel Pump Town" (https://claude.ai/artifact/FjhkR3fFkF2zsvGkVSYLji), built from DESIGN-002.
Approval: Len asked in chat on 2026-10-22: "Can you implement this full ui redesign here: <canvas link>".
Branch: `feat/ui-redesign` (`e333f07` redesign, `94497ea` prices in Nunito). Merged into local `main` on 2026-10-22 at Len's request.

## What was built

| Canvas artboard | Code |
| --- | --- |
| Foundations / Tokens + components | `src/theme/colors.ts`, `src/theme/tokens.ts`, `src/theme/pixel.ts`, `src/ui/icons.ts`, `src/ui/pixelArt.ts`, `src/components/ui/*` |
| Component / Hotbar | `src/components/Hotbar.tsx` (custom tab bar; becomes the left rail at ≥ 1024 px) |
| Auth / Log in | `src/screens/AuthScreen.tsx`, `src/components/PixelScene.tsx` (also the Boot screen in `src/app/_layout.tsx`) |
| Home / World view | `src/screens/DashboardScreen.tsx`, `src/components/LiveMap.tsx`, `src/services/pinHtml.ts` |
| Home / Sheet expanded | `src/components/StationSheet.tsx` |
| Stations / Results | `src/screens/StationListScreen.tsx`, `src/components/StationListPanel.tsx`, `src/components/StationRow.tsx` |
| Scan / 1 Snap, 2 Review | `src/screens/CameraCaptureScreen.tsx`, `src/services/scanReview.ts` |
| Scan / 3 Share / Rank up | `src/components/RewardPopup.tsx` (coins-only variant) |
| Me / Character sheet | `src/screens/ProfileScreen.tsx` |
| Web / Home two-pane | `src/screens/DashboardScreen.tsx` wide branch |

Fonts: `@expo-google-fonts/pixelify-sans`, `@expo-google-fonts/silkscreen` and `@expo-google-fonts/nunito` (0.4.2), loaded with `useFonts`. The lockfile was rebuilt from the previous one with only these three entries added, because `npx expo install` with npm 11.9 again stripped unrelated `libc` fields.

## Deliberate differences from the canvas

- **Stats on Me show "—"**, the rank is "Rookie spotter" and badges are locked. Real numbers need FEAT-003 (DESIGN-002 §5.10 honesty rule).
- **Reward popup is the coins-only variant** (+10, +5 with a photo). No XP bar or rank-up, because nothing is tracked yet (FEAT-003). Coins are not saved.
- **Rewards hotbar slot** has the SOON tag and opens Me (DESIGN-002 §4.2 fallback).
- **No freshness bar or "Shared by"** in the sheet: sample stations have no real timestamps, and community updates do not store the sharer yet.
- **Community updates on the map** now show their price for the selected fuel, because `useMapMarkers` passes through the `prices` field it already stored. They are not scored by Smart Route and not in the Stations list (still FEAT-001).
- **App locked to the light theme** (`app.json` `userInterfaceStyle: "light"`, DESIGN-002 §13 Q7 proposal).
- **Prices use Nunito 800, not Pixelify Sans** (`type.priceHero`, `type.priceLg`, new `type.priceMd`, the Review price inputs and the map pin bubbles). Pixelify's stylised 2/3/5 made `₱61.50` read as `₱61.S0`, and it has no `₱` glyph. Len chose this on 2026-10-22. Titles, buttons and station names stay in Pixelify Sans.
- The location chip says "Kalibo" (the full "Kalibo, Aklan" was cut off at 390 px).
- The map follows the user's location only within about 30 km of Kalibo, so the sample stations stay in view elsewhere.

## Security

- Pin titles (which include the Firestore station name) go to Leaflet's `title` option, which sets a DOM attribute, not HTML.
- Map popups are gone. Pins are Leaflet `divIcon` markup built in `pinHtml.ts`; the only data value in it (the price label) is HTML-escaped (`pinHtml.test.ts`). This closes the unescaped popup issue in RECON_REPORT §6.3 for the mobile WebView.

## Checks (2026-10-22, Git Bash, Node 24.14.0)

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `npm test` | Pass: 6 suites, 27 tests (4 new suites for presentation, pins, scan review, station view models) |
| Lint | `npm run lint` | Pass: 0 problems |
| Typecheck | `npx tsc --noEmit` | Pass: 0 errors |
| Web export | `npx expo export --platform web` | Pass, 7 static routes |
| Android bundle | `npx expo export --platform android` | Pass |
| Visual check | Headless Edge screenshots of the web export at 390 × 844 and 1440 × 900 (Auth, Sign up, Map, sheet peek and expanded, Stations, row expanded, Scan web state, Review, Me, sign-out dialog, two-pane) | Rendered as designed. Screens behind sign-in were checked with a temporary build that skipped auth; that change was reverted and is not committed. |

Physical device: Len tested the app on a phone on 2026-10-22 and reported "it works fine". The device model, OS and the individual checks (camera, OCR, WebView map, safe areas, `boxShadow`) were not recorded.

## Open issues for Len

1. **Pixelify Sans digits, resolved for prices** (switched to Nunito, see above). Rank numbers in the Stations list and the Scan stepper numbers still use Pixelify, so a "2" there can look like an "8"; switch those too if it bothers you.
2. The static web export logs React hydration error #418, because the server renders the Boot screen and the client renders the signed-in or signed-out state. The page recovers. It existed before (auth gate in the root layout).
3. ~~Not yet checked on a physical device.~~ Done: Len tested on a phone on 2026-10-22 ("it works fine").

## Other baseline findings this resolved

The redesign also fixed RECON §6.3 item 2 (scan-on-save dropped the prices) and item 3 (silent `Alert.alert` on web), and the Workflow 1–3 gaps for the map tab. The full status table is in [../RECON_REPORT.md](../RECON_REPORT.md) §7.
