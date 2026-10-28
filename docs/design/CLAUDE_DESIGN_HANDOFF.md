# GasUp365: Claude Design Handoff

Created: 2026-10-22T08:18:26+08:00
Updated: 2026-10-22T20:01:25+08:00
Revision: 1
Status: Draft (awaiting Len's approval). Delivered to Claude Design and implemented on `feat/ui-redesign`.
ID: DESIGN-002
Replaces: DESIGN-001 ([CLAUDE_DESIGN_SPEC.md](CLAUDE_DESIGN_SPEC.md), Revision 1). This handoff includes everything in that spec, plus the 2026-10-22 UI/UX evaluation and the layout decision.

> **For Claude Design.** This is the only document you need. It describes:
> - every function GasUp365 has today and every function that is planned
> - why each function exists
> - what each screen must show, in every state
> - the **design conventions** to follow (section 5)
> - the **layout style** to use (section 4)
>
> The visual direction is **a modern pixel-art game look inspired by sandbox pixel games such as Growtopia and Terraria**. Those games are mood references only. All art must be original.

> **Status note (2026-10-22, not a content revision).** Claude Design produced the canvas "GasUp365 · Pixel Pump Town" from this document, and it is implemented on `feat/ui-redesign` (`e333f07`, `94497ea`). Differences from the canvas are in [../evidence/UI-REDESIGN-verification.md](../evidence/UI-REDESIGN-verification.md). The §13 questions are still unanswered. The build used the proposed defaults for Q1 (a Rewards slot marked SOON that opens Me), Q2 ("coins" in the UI, `points` in data), Q7 (Day theme only) and Q8 (Map as the default tab). Q3–Q6 and Q9 are open, and the sample prices are unchanged. Len has since decided one thing this document does not say: prices use Nunito, not Pixelify Sans.

---

## Contents

0. [Read me first](#0-read-me-first)
1. [The product](#1-the-product)
2. [Current state of the UI (what to fix, what to keep)](#2-current-state-of-the-ui)
3. [Complete function inventory](#3-complete-function-inventory)
4. [Layout style (decided)](#4-layout-style-decided)
5. [Design conventions](#5-design-conventions)
6. [Component library](#6-component-library)
7. [Screen specifications](#7-screen-specifications)
8. [Pixel asset list](#8-pixel-asset-list)
9. [Build constraints (Expo SDK 55 / React Native)](#9-build-constraints)
10. [Exhibit demo storyboard](#10-exhibit-demo-storyboard)
11. [Logic and data the UI must explain](#11-logic-and-data-the-ui-must-explain)
12. [Pre-delivery checklist](#12-pre-delivery-checklist)
13. [Open questions for Len](#13-open-questions-for-len)

---

## 0. Read me first

### 0.1 What to deliver

| # | Deliverable | Details |
| :--- | :--- | :--- |
| 1 | **Design tokens** | Color, type, spacing, border, elevation, icon, z-layer and motion tokens (section 5). Keep the **token names**. Hex values may be refined if they still pass the contrast table (5.3.3). |
| 2 | **Component sheet** | Every component in section 6, in every listed state. |
| 3 | **Mobile screens** | Every screen in section 7, at **390 × 844**, with every listed state. Also check **360 × 640** (small Android) for Home, Stations and Scan. |
| 4 | **Web layout** | **1440 × 900** layout for Home (map + Stations side by side) and Scan (manual entry). The exhibit may run on a laptop browser. |
| 5 | **Pixel asset list** | Sprites, icons and illustrations with grid size and frame count (section 8). |
| 6 | **Demo prototype** | The 6-frame exhibit walkthrough (section 10) as a connected, clickable prototype. |

Frame naming: `Screen / State`, for example `Home / Sheet peek`, `Scan / 2 Review / Needs review`, `Stations / Empty search`.

### 0.2 Priority tags

| Tag | Meaning | Design depth |
| :--- | :--- | :--- |
| **[DEMO]** | Must look finished for the guild exhibit. Built now or being built. | Every state, full polish. |
| **[NEXT]** | Planned right after the demo flow works (FEAT-001 to FEAT-003). | Full design, main states. |
| **[FUTURE]** | Roadmap (Phase 2+). | One good-looking screen or placeholder. |

### 0.3 Hard rules

1. **Original art only.** Do not copy sprites, characters, tiles, logos, fonts, UI frames or names from Growtopia, Terraria or any other game.
2. **Pixel frame, readable content.** Game styling goes on the *chrome* (bars, panels, buttons, badges, rewards, backgrounds). The *content* drivers act on (prices, distances, addresses, form fields, error messages) stays in a clean readable font with strong contrast. This is a money tool used outdoors in sunlight on cheap Android phones.
3. **Keep the existing logo** (`assets/images/Gasup.png`). It is a pixel wordmark with orange-to-yellow letters, a dark brown outline and a chunky bevel. The whole visual system grows out of it. Never re-typeset it.
4. **Honest UI.** Never show made-up numbers as if they were real. Sample data is labelled "Sample". Unbuilt features are disabled and marked "Coming soon". Read section 5.10 before designing Profile.
5. **Buildable in Expo SDK 55 / React Native** (section 9). No effects that need a web-only CSS feature, full-screen blur, or a new heavy library.
6. **Accessibility is not optional.** Text contrast must be at least 4.5:1, tap targets at least 48 × 48 px, and color is never the only signal (section 5.9).

---

## 1. The product

### 1.1 One paragraph

**GasUp365** is a community-powered fuel price finder for Filipino drivers. The MVP covers **Kalibo, Aklan, Philippines**. Fuel prices change weekly, and drivers (jeepney, tricycle, bus, taxi, TNVS/Grab, delivery riders, commuters) lose real money because the only ways to compare stations are word of mouth or burning fuel driving around. GasUp365 lets any driver photograph a station's price board. The app reads the prices, and once the driver confirms them, everyone's map updates. A **Smart Route** pick then shows which station saves the most pesos *after* the fuel spent driving there.

The question the app answers:
> *"Saan ako magpapagasolina na pinakamalapit at pinakamura ngayon?"*
> ("Where can I fuel up nearest and cheapest right now?")

### 1.2 The core loop: Snap → Share → Save

1. **Snap.** A driver at a station photographs the price board.
2. **Read.** On-device text recognition and a fuel-board parser pull out the station brand, address, GPS position, and prices for **Diesel**, **Unleaded** and **Premium**.
3. **Share.** The driver checks and corrects the result. The update and its photo go live on everyone's map.
4. **Save.** Other drivers compare prices on a map and a list, filter by fuel type, get the Smart Route pick, and open Google Maps directions with one tap.

### 1.3 Taglines (use on splash, auth and empty states)

- "Find better fuel stops, faster." (current)
- "Download, snap, save."
- "Sama-sama tayong magtipid!" ("Let's all save together!")

### 1.4 Users

| Persona | Context | What the UI must do for them |
| :--- | :--- | :--- |
| **Mang Rudy**, jeepney/tricycle driver (primary) | Mid-route, one hand on the phone, bright sun, older Android, patchy data | Cheapest diesel nearby in under 5 seconds. Huge numbers. One-tap Navigate. |
| **Aira**, delivery rider (secondary) | Many short trips a day, competitive | Fast scanning. Rewards and ranks that make contributing fun. |
| **Private commuter** (tertiary) | Plans fill-ups ahead | Compare stations, see how fresh a price is, trust the data. |
| **Exhibit visitor** (demo) | 60 seconds at the booth | An instant "wow, it's a game", then an instant "oh, it actually saves money". |

### 1.5 Fuel types

The app knows three fuel types. Each needs a **distinct identity made of color, icon and label together**, never color alone.

| Key | Label | Also appears on boards as | Notes |
| :--- | :--- | :--- | :--- |
| `diesel` | Diesel | Turbo Diesel, Diesel Max, Power Diesel, Auto Diesel | **Default selection.** The primary audience (jeepneys, trucks) runs on diesel. |
| `unleaded` | Unleaded | Regular, Gasoline, Gas, 91, Extra | |
| `premium` | Premium | Special, V-Power, XCS, Velocity, Gold, Blaze, 95, 97 | The scan form labels it **"Special / Premium"** because many boards say "Special". |

---

## 2. Current state of the UI

This section summarises the UI/UX evaluation of the code on branch `baseline/dd-workflow` (2026-10-22). It tells you what exists, so you don't repeat its problems.

### 2.1 What it looks like today

A clean but generic orange-on-cream app: rounded 8 px white cards with soft blurred shadows, system font, Feather line icons, default blue Leaflet map pins and solid orange headers. **The only game-like element is the pixel logo**, which makes it look pasted onto a business app.

| Screen | Today |
| :--- | :--- |
| Login / Sign up | White card on peach. Logo, "Welcome back", Login/Sign up toggle, placeholder-only inputs, orange button, plus a second "New here? Sign up" link. |
| Home (map) | Full-screen map. A floating white header (logo, "Live Price Map", an unlabelled count bubble), a "Smart diesel route" strip, a marker card when a pin is tapped, and a "Scan Price" button at bottom right. |
| List | Orange header with search, two rows of identical-looking chips (fuel type and sort), station cards with lots of 10 px text. |
| Add (scan) | Orange header, camera preview, "OCR + NLP" card, form, raw OCR text dump, "Save Live Map Marker" button. One long scroll. |
| Profile | Orange header with avatar, three stat cards (24 / 156 / 4.8, all hardcoded), six menu rows that do nothing, a "1,234 drivers" impact card (hardcoded), sign out. |
| Hidden `/map` | An older map dashboard with a metric strip and fuel chips. Being merged into Home. |

### 2.2 Problems the new design must fix

| # | Problem | Evidence | Fix in this handoff |
| :--- | :--- | :--- | :--- |
| P1 | **Contrast fails.** White text on orange `#F97316` is 2.80:1 (needs 4.5). Gray `#7C8794` text is 3.3–3.65:1. The border `#F0E5DA` is 1.24:1 against white, so card edges vanish. | Measured | New color roles and a verified contrast table (5.3) |
| P2 | **Tap targets too small.** Sort chips about 28 px, Navigate about 26 px, card close 24 px, Scan 38 px. | Style values | 48 × 48 px minimum (5.9) |
| P3 | **Text too small.** At least 9 text styles are 10 px. | Style values | 12 px minimum, scale in 5.4 |
| P4 | **No accessibility labels** on icon-only buttons. | Only 2 labels in the app | Label rule (5.9) |
| P5 | **Safe areas ignored.** Headers use a fixed 48 px top padding; overlays use magic numbers (`top: 226`, `bottom: 112`). | Code | Screen frame + HUD zones (4.3) |
| P6 | **Two scan buttons on Home** (floating button + center tab). | Code | One Scan entry point: the hotbar (4.2) |
| P7 | **Fake or dead UI.** Hardcoded profile stats, dead menu rows, "Live" on sample data. | Code | Honesty rules (5.10) |
| P8 | **Developer wording.** "OCR + NLP", "Raw OCR Text", "Save Live Map Marker", "marker". | Copy | Voice and copy rules (5.8) |
| P9 | **Inconsistent details.** `₱` vs `P`, "Add" tab vs "Scan Price" button, font weights 500–900 with no scale, mixed touch components. | Code | Tokens + copy rules |
| P10 | **Style doesn't match the brand.** The logo promises a game; the UI is a bank app. | Visual | Pixel Pump Town direction (5.1) |
| P11 | **Scan flow has no structure.** One long scroll, no steps, and Save has to be pressed twice. | Code | 3-step stepper (7.6) |
| P12 | **Native alerts are invisible on web.** Every scan error uses a native alert, which the exhibit laptop won't show. | Code | All feedback in-app: toast or dialog (6.18, 6.19) |

### 2.3 What to keep

- The **logo**, the **brand orange**, and the warm cream background.
- The **map-first** home and the **Smart Route** idea (the app's "aha").
- The **segmented Login | Sign up** toggle and the friendly auth error messages.
- **Station card content**: three prices, net savings breakdown, last updated, Navigate.
- **Scan → review → save** with a human correcting the machine.

---

## 3. Complete function inventory

Every user-facing and system function. **Status** is the state of the code on 2026-10-22. **Design need** says what you must draw.

Status legend: **Built** works today · **Partial** works with gaps · **Placeholder** UI with fake data or no action · **Planned** not built · **Bug** known defect the design should not depend on.

### 3.1 Boot, account and session

| ID | Function | Purpose | Status | Design need | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-01 | **Native splash.** Static image on orange `#F97316` before the JavaScript loads. | Instant brand on launch. | Built | 1:1 splash icon that hands over to the Boot screen | [DEMO] |
| F-02 | **Session check.** On launch the app asks Firebase whether a user is signed in and shows a loader meanwhile. | Route to Auth or the app. | Built (plain spinner) | Boot screen (7.1) | [DEMO] |
| F-03 | **Log in** with email and password. | Identify contributors so updates can be credited and abuse limited. | Built | Auth (7.2) | [DEMO] |
| F-04 | **Sign up** with full name, email and password (6+ characters). Creates the profile record: display name, email, created date, points 0, updates 0, role "Community Member". | Create a contributor account. | Built | Auth (7.2) | [DEMO] |
| F-05 | **Switch between Log in and Sign up** (segmented toggle). Clears the error. | One screen, two modes. | Built (also a duplicate link) | Toggle only; drop the duplicate link | [DEMO] |
| F-06 | **Form validation.** Submit is disabled until email is filled and password is at least 6 characters (plus name for sign up). | Prevent pointless requests. | Built | Disabled state + helper text | [DEMO] |
| F-07 | **Friendly auth errors.** "That email is already registered." · "Enter a valid email address." · "Email or password is incorrect." · "Use at least 6 characters for your password." · fallback "Unable to continue. Please try again." | Clear recovery. | Built | Inline error under the form | [DEMO] |
| F-08 | **Stay signed in** across app restarts. | Don't make drivers log in every time. | **Bug** on Android/iOS (session isn't saved yet) | Design assumes it works | [NEXT] |
| F-09 | **Sign out** from Profile. | Switch accounts, privacy. | Built (no confirmation) | Confirmation dialog | [DEMO] |

### 3.2 Navigation shell

| ID | Function | Purpose | Status | Design need | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-10 | **Bottom tab bar**: Home, List, raised center Add (camera), Profile. | Main navigation. | Built | Restyle as the **Hotbar** (6.2) with the new tab set in 4.2 | [DEMO] |
| F-11 | **Hidden legacy dashboard route** (`/map`). | None for users; being merged into Home. | Built (hidden) | Don't design. Its features move to Home. | n/a |
| F-12 | **Portrait only.** | Phone use. | Built | Portrait frames only (web is separate) | [DEMO] |

### 3.3 Map (Home)

| ID | Function | Purpose | Status | Design need | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-13 | **Live map** (Leaflet with OpenStreetMap tiles), centred on Kalibo (11.7089, 122.364), zoom 13. | See stations around you. | Built | Map screen with HUD (7.3) | [DEMO] |
| F-14 | **Your location.** Asks for location permission and shows a blue dot. If denied, the map centres on Kalibo and shows "Location permission denied". | Distances and "near me". | Built | Pixel user marker; friendlier denied notice with Enable action | [DEMO] |
| F-15 | **Map loading and error overlays.** "Loading live map..." and "Unable to load map". | Feedback. | Built | Pixel loader + error state with Retry | [DEMO] |
| F-16 | **Sample station pins.** 4 built-in Kalibo stations (Petron – Kalibo, Shell – Kalibo Crossing, Caltex – Andagao, Phoenix – Estancia) with prices. | Demo data before community data exists. | Built | Pin variant "sample" | [DEMO] |
| F-17 | **Community pins in real time.** Every shared update appears instantly for everyone. | Fresh crowd-sourced prices. | **Partial**: pins appear but their prices and photo aren't passed to the map/list yet (FEAT-001/002) | Pin variant "community"; design with prices shown | [DEMO] |
| F-18 | **Pin count.** Number of stations on the map. | Shows the data is alive. | Built (unlabelled) | Labelled HUD counter "8 stations" | [DEMO] |
| F-19 | **Tap a pin** to see its details. Sample pins: tapping the card opens Google Maps. Community pins: tapping the card closes it. | Decide and go. | Partial (basic card + HTML popup) | **Station sheet** (6.11, 7.4) replaces both | [DEMO] |
| F-20 | **Smart Route banner.** Best station by net pesos saved. | Answer "where should I go?" at a glance. | Built (**diesel only**) | Banner that follows the selected fuel | [DEMO] |
| F-21 | **Fuel filter on the map** (Diesel / Unleaded / Premium). Changes pin prices and the Smart Route pick. | Compare by your fuel. | Only on the hidden `/map` | Fuel hotbar in the map HUD | [DEMO] |
| F-22 | **Metric strip**: stations live, lowest price for the fuel, best net save. | Game-HUD summary. | Only on the hidden `/map` | Optional on mobile (tap-to-expand HUD); required on web | [DEMO] |
| F-23 | **Live data error.** "Unable to load live markers." If the server refuses access, the map silently shows sample stations only. | Resilience. | Built | Small info chip "Showing sample stations" | [DEMO] |
| F-24 | **Floating "Scan Price" button** on Home. | Shortcut to scanning. | Built | **Remove.** The hotbar Scan slot replaces it (P6). | n/a |
| F-25 | **Location selector** "Kalibo, Aklan, Philippines" and a filter button (hidden `/map`). | Area choice. | Placeholder (no action) | Location chip in the HUD; area switching is [FUTURE] | [FUTURE] |

### 3.4 Smart Route and directions

| ID | Function | Purpose | Status | Design need | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-26 | **Route scoring.** For the selected fuel, compares each station with the area average for a 20 L fill, subtracts round-trip travel fuel at 12 km/L, and picks the highest net saving (ties go to the nearer station). Full formula in 11.1. | The app's core value. | Built | Savings breakdown + "How is this calculated?" tooltip | [DEMO] |
| F-27 | **Navigate.** Opens Google Maps driving directions to the station. | One tap from decision to driving. | Built | Primary button on the sheet and cards | [DEMO] |

### 3.5 Station list

| ID | Function | Purpose | Status | Design need | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-28 | **Search by station name** (case-insensitive, matches part of the name). | Find a specific station. | Built | Search field + clear button + no-results state | [DEMO] |
| F-29 | **Fuel filter** (Diesel / Unleaded / Premium). | Compare by your fuel. | Built | Fuel hotbar (same component as Home) | [DEMO] |
| F-30 | **Sort**: Smart (highest net saving, default), Nearest, Cheapest. | Rank by what matters now. | Built | Labelled sort toggle, visually different from the fuel filter | [DEMO] |
| F-31 | **Station card**: name, address, distance, Smart Route badge, three prices, savings breakdown, last updated, Navigate. | Side-by-side comparison. | Built | Leaderboard row (6.10) | [DEMO] |
| F-32 | **"Best net save" ribbon** on the top card in Smart sort. | Highlight the winner. | Built | Gold rank-1 treatment | [DEMO] |
| F-33 | **Community stations in the list.** | Real data, not just samples. | **Not yet** (only the 4 samples; FEAT-001) | Design assumes both sources, with source tags | [DEMO] |
| F-34 | **Tap a card** to open its details or show it on the map. | Drill down. | Planned | Opens the Station sheet | [DEMO] |

### 3.6 Scan and share a price

| ID | Function | Purpose | Status | Design need | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-35 | **Camera permission.** Inline "Enable camera" panel. System prompt text: "Allow GasUp365 to scan fuel price boards." | Required for scanning. | Built | Permission states incl. permanently denied → Settings + manual entry | [DEMO] |
| F-36 | **Camera preview**: back camera, 4:3, photo mode. | Frame the board. | Built | Viewfinder with pixel corner brackets + hint | [DEMO] |
| F-37 | **Capture photo** (with location data embedded in the photo when available). | Evidence + text source. | Built | Shutter button, capture flash | [DEMO] |
| F-38 | **Get GPS position.** System prompt text: "Allow GasUp365 to place station updates on the map." | Place the update on the map. | Built | "Location captured" chip / "Location needed" state | [DEMO] |
| F-39 | **Read the text on the photo** (on-device, mobile only). | No typing needed. | Built (mobile) | "Reading the price board…" progress | [DEMO] |
| F-40 | **Understand the board.** Detects the station brand (15 Philippine brands: Petron, Shell, Pilipinas Shell, Caltex, Phoenix, Total, SeaOil, Uno, Flying V, PTT, Cleanfuel, Jetti, Unioil, RePhil, Petro Gazz), an address line (street, avenue, barangay, poblacion, etc.), and up to 3 fuel prices using the synonyms in 1.5. Ignores numbers that don't look like prices. Uses the photo's location, or falls back to the phone's GPS. | Accurate auto-fill. | Built | "Detected" vs "Needs review" field states | [DEMO] |
| F-41 | **Auto-fill the form** from what was detected. | Speed. | Built | Detected fields marked with a sparkle + "Detected" | [DEMO] |
| F-42 | **Scan summary.** "Found unleaded, special, diesel. Ready to save." / "Found diesel. 3 item(s) need review." / "No fuel prices found" / "Ready to scan a station board or receipt." | Tell the user what happened. | Built | Summary banner in Review step (reword per 5.8) | [DEMO] |
| F-43 | **Review checklist.** Lists only the missing items: station name, address, GPS location, unleaded, special/premium, diesel. | Accuracy. | Built | Checklist with per-field "Needs review" | [DEMO] |
| F-44 | **Manual entry and correction**: station name, address, Diesel, Unleaded, Special/Premium (numeric keyboard). | Fix mistakes; web users type everything. | Built | Form fields (6.13) | [DEMO] |
| F-45 | **Show what the camera read** (raw text, selectable). | Transparency, debugging. | Built (always visible) | Collapsed "Show what the camera read" disclosure | [DEMO] |
| F-46 | **Save checks.** Location is required; at least one price is required. | Data quality. | Built | Inline errors on the relevant fields | [DEMO] |
| F-47 | **Auto-scan on save.** If nothing was scanned and no price typed, Save triggers a scan first. | Shortcut. | **Bug** (user must press Save twice) | Don't design around it. Save is only enabled after the Review step has at least one price. | n/a |
| F-48 | **Upload the photo** to cloud image storage. If there is no photo, a placeholder image is stored. Errors: "Cloudinary upload failed…" | Photo evidence. | Built | Upload progress; error with **Retry** and **Share without photo** | [DEMO] |
| F-49 | **Publish the update**: position, station name, description, prices, photo link, what the scan found/missed, timestamp. Then reset the form and go back. | Goes live for everyone. | Built | Step 3 progress → Reward popup → back to map | [DEMO] |
| F-50 | **Web fallback.** Text recognition doesn't run on web: "Camera OCR is not available on web. Please use the mobile app." Scan button disabled, typing allowed. | Exhibit laptop still works. | Built | "Mobile scan only" panel + manual entry layout | [DEMO] |
| F-51 | **Error messages.** "Camera not ready" · "Capture failed" · "Unable to scan text: you can still enter the values manually." · "Location needed" · "Fuel price needed" · "Unable to save" · "Camera error". | Recovery. | Built (native alerts, **invisible on web**) | In-app toast/dialog for each (5.8.4) | [DEMO] |

### 3.7 Profile and gamification

| ID | Function | Purpose | Status | Design need | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F-52 | **Identity**: display name (fallback "GasUp365 Driver"), role "Community Member". | Personal touch. | Built | Character-sheet header with avatar + rank | [DEMO] |
| F-53 | **Stats**: Updates, Points, Rating. | Motivation. | **Placeholder** (24 / 156 / 4.8 hardcoded) | Real-data design + new-user zeros state (FEAT-003) | [DEMO] |
| F-54 | **Community impact**: "Your contributions have helped 1,234 drivers save money this month!" | Purpose. | **Placeholder** | Design as a stat; hide until real | [NEXT] |
| F-55 | **Menu**: Saved Locations (badge 3), Notifications, Price Alerts, Settings, Help & Support, About GasUp365. | Access secondary features. | **Placeholder** (no actions) | "Coming soon" disabled rows until built | [FUTURE] |
| F-56 | **Footer**: "GasUp365 v1.0.0 · Empowering Filipino drivers, one update at a time". | Version/mission. | Built | Keep | [DEMO] |
| F-57 | **Coins, ranks, XP, badges.** Points field exists on the account but isn't updated yet. | Make contributing fun. | Planned (FEAT-003) | Reward popup, XP bar, badge shelf, Rewards tab | [NEXT] |

### 3.8 Planned features (roadmap)

| ID | Function | Purpose | Tag |
| :--- | :--- | :--- | :--- |
| F-58 | **Price freshness** bars and dimming of stale prices | Trust | [NEXT] |
| F-59 | **Offline mode** with last-synced prices and an Offline chip | Patchy data | [NEXT] |
| F-60 | **Photo evidence shown** on the station sheet (full-screen, pinch zoom) | Trust and proof | [NEXT] (design for [DEMO]) |
| F-61 | **"Shared by ⟨name⟩"** on updates | Credit | [NEXT] |
| F-62 | **Trust votes**: "Still accurate" / "Report outdated" | Community verification | [FUTURE] |
| F-63 | **Price drop alerts** (fuel, ₱ threshold, radius) | Save without checking | [FUTURE] |
| F-64 | **Saved locations** (home, terminal, route) | Faster repeat use | [FUTURE] |
| F-65 | **Radius filter** (1 / 5 / 10 km) | Focus nearby | [FUTURE] |
| F-66 | **Regional price dashboard** (averages, trend, cheapest) | Context | [FUTURE] |
| F-67 | **Settings**: default fuel, vehicle and km/L (default 12), fill litres (default 20), radius, theme, reduce motion, language, account | Personal Smart Route | [FUTURE] |
| F-68 | **Night shift theme** | Night drivers | [FUTURE] |
| F-69 | **About, Help & Support, Notifications inbox** | Support | [NEXT] About, [FUTURE] others |

---

## 4. Layout style (decided)

> **Numbers in the wireframes are layout placeholders.** With the current sample data, the real Smart Route results are different and mostly negative (see 11.1). Design both the positive and the "no saving" banner states.

### 4.1 Decision: "World + HUD"

The layout was chosen in a council review (simplicity, reliability, security and architecture perspectives) on 2026-10-22. It is **map-first, with game-style HUD overlays, a tap-to-expand station sheet, leaderboard-row lists, a stepper scan, and a character-sheet profile**, connected by a **hotbar** tab bar.

| Surface | Layout pattern | Why |
| :--- | :--- | :--- |
| **Home** | **World view.** The map is the full-screen "world". Small HUD panels sit at the edges. A station **sheet** rises from the bottom. | The map is the app's core tool. The HUD makes it feel like a game without covering the map. |
| **Station details** | **Tap-to-expand sheet** with two heights: *Peek* and *Expanded*. Not a drag-to-resize sheet. | Dragging a sheet fights with panning the map. Two fixed heights are simpler and reliable. Replacing the map's HTML popups with a native sheet also removes a known security issue. |
| **Stations (list)** | **Leaderboard rows**: one station per row, rank number on the left, big price on the right. Not a grid. | Rows make prices easy to compare. Grids look good but make comparison slower. |
| **Scan** | **3-step stepper**: ① Snap → ② Review → ③ Share, one step per view. | Breaks a long scroll into a clear quest. |
| **Profile** | **Character sheet**: avatar, rank, XP bar, stat slots, badge shelf, then a menu. | The main gamification surface. |
| **Navigation** | **Hotbar**: 5 slots with a raised center Scan slot. | Game metaphor, ≤ 5 items, one obvious primary action. |

**Rejected alternatives**
- *Feed or dashboard home*: hides the map, which is the main value.
- *Full game interface everywhere* (inventory grid list, pixel fonts on everything): looks great, but hurts readability and price comparison.
- *Bento-grid home*: a marketing pattern, not a tool pattern.

**When to revisit**
- If exhibit Wi-Fi is unreliable, make **Stations** the default tab. The map depends on online map tiles.
- If the demo runs on a tablet or in landscape, use the two-pane web layout (4.6).

### 4.2 Navigation: the Hotbar

```
┌──────────────────────────────────────────────────────┐
│ [🗺 Map] [≣ Stations]  ⟦ 📷 SCAN ⟧  [★ Rewards] [☺ Me] │   ← 5 item slots
└──────────────────────────────────────────────────────┘
                         ↑ raised 16 px, larger "action slot"
```

| Slot | Label | Route | Content | Tag |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Map** | `/` | Home world view | [DEMO] |
| 2 | **Stations** | `/list` | Leaderboard list | [DEMO] |
| 3 (center, raised) | **Scan** | `/add` | Scan stepper | [DEMO] |
| 4 | **Rewards** | new | Rank, XP, badges, (future) leaderboard of contributors | [NEXT] (proposal, see 13) |
| 5 | **Me** | `/profile` | Character sheet + menu | [DEMO] |

- The center Scan slot is the **only** scan entry point in the app (fixes P6).
- A raised center slot needs an odd number of slots, which is why Rewards exists. If Rewards isn't built in time for the demo, keep the slot and show a "SOON" preview (rank ladder + locked badges) rather than an off-centre 4-slot bar. Len decides (13).
- Labels are always visible under icons (no icon-only tabs).
- The active slot gets a highlight frame and a small pixel arrow above it.
- The bar sits **above the system gesture/home area** (safe area).
- Rename everywhere: "Add" → **Scan**, "List" / "Live Price List" → **Stations**, "Profile" → **Me**, "Live Price Map" → **Map**.

### 4.3 Screen frame and HUD zones (mobile 390 × 844)

Every screen uses one shared **ScreenFrame**: safe-area insets top and bottom, the cream background, and a pixel **title bar** (except Home, whose header is a floating HUD).

**Home HUD zones**

```
┌─────────────────────────────────────┐ ← status bar / notch (safe area, never draw content here)
│ ┌──────┐ ┌──────────────┐ ┌───────┐ │ Zone A  HUD row 1 (top inset + 8)
│ │LOGO  │ │📍 Kalibo  ▾  │ │🪙 156 │ │   logo chip · location chip · coin counter
│ └──────┘ └──────────────┘ └───────┘ │
│ ┌────────────────────┐   ┌────────┐ │ Zone B  HUD row 2
│ │[⛽D][⛽U][⛽P]       │   │ 8 STNS │ │   fuel hotbar · station counter
│ └────────────────────┘   └────────┘ │
│ ┌─────────────────────────────────┐ │ Zone C  Smart Route banner (tap → sheet)
│ │★ SMART ROUTE · DIESEL           │ │
│ │Caltex – Andagao   Save ₱18 net ›│ │
│ └─────────────────────────────────┘ │
│                                 ┌─┐ │ Zone D  map controls (right edge)
│          (map world)            │+│ │   zoom in / out / recenter, 48 px each
│        📍    👑📍               │-│ │
│              📍      🔵         │◎│ │
│                                 └─┘ │
│ ┌─────────────────────────────────┐ │ Zone E  Station sheet (Peek) — only when a pin is selected
│ │ Caltex – Andagao        ₱61.50  │ │
│ │ 1.8 km · Save ₱18 net   [GO ➤]  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Map][Stations] ⟦SCAN⟧ [Rewards][Me]│ Zone F  Hotbar
└─────────────────────────────────────┘ ← home indicator (safe area)
```

Rules:
- Zones A–C together take **at most 30% of the screen height**. At least **55% of the map stays visible** when nothing is selected.
- Zone C can collapse to a single line after the first map interaction (optional).
- HUD panels never cover the OpenStreetMap attribution (bottom-left, above the sheet).
- Zone E only appears when a pin is selected. Tapping the empty map or × closes it.
- All positions come from safe-area insets plus spacing tokens, never fixed pixel offsets (fixes P5).

### 4.4 Z-order (layers)

| Layer | z-token | Contents |
| :--- | :--- | :--- |
| 0 | `z.world` | Map, parallax backgrounds |
| 1 | `z.pins` | Map pins (inside the map) |
| 2 | `z.hud` | HUD panels, banners, map controls |
| 3 | `z.sheet` | Station sheet |
| 4 | `z.nav` | Hotbar |
| 5 | `z.toast` | Toasts |
| 6 | `z.modal` | Dialogs, Reward popup, full-screen photo (with scrim) |

### 4.5 Scroll and fixed elements

- Lists and forms scroll **between** the title bar and the hotbar, with bottom padding equal to the hotbar height plus 16 px so the last item is never hidden.
- The Scan step's primary button is a **sticky footer bar** above the hotbar.
- The keyboard must never cover the focused field or the primary button.

### 4.6 Responsive behaviour

| Width | Layout |
| :--- | :--- |
| **360–430 px** (phones) | Mobile layout above. At 360 px, the HUD row 1 location chip shrinks to an icon; prices never truncate. |
| **431–1023 px** (large phones, small tablets, narrow browser) | Mobile layout, centred, max content width 480 px, cream margins with a subtle pixel tile pattern. |
| **≥ 1024 px** (exhibit laptop, 1440 × 900 reference) | **Two-pane**: a vertical hotbar rail on the left (88 px), the **Stations list panel** (400 px), and the **map** filling the rest. The station sheet becomes a **right-side detail panel** (380 px) over the map. HUD metric strip shown at the top of the map. Scan shows the "Mobile scan only" panel with manual entry in a centred 560 px column. |

```
1440 × 900
┌────┬──────────────────┬───────────────────────────────────────────────┐
│ ⛽ │ STATIONS          │ [Stations live 8][Lowest diesel ₱61.50][Best ₱18] │
│Map │ [search……………]   │                                    ┌──────────┐│
│ ≣  │ [D][U][P]  Smart▾ │          (map world)               │ Station  ││
│ 📷 │ 1 Caltex   ₱61.50│                                    │ detail   ││
│ ★  │ 2 Petron   ₱61.90│        📍   👑📍                   │ panel    ││
│ ☺  │ 3 Phoenix  ₱62.10│                                    │ 380 px   ││
│    │ 4 Shell    ₱62.40│                                    └──────────┘│
└────┴──────────────────┴───────────────────────────────────────────────┘
```

---

## 5. Design conventions

### 5.1 Visual direction: "Pixel Pump Town"

GasUp365 looks like a **cozy, modern 2D pixel sandbox world**: Kalibo rebuilt as a bright side-scrolling pixel town. Gas stations are **outposts**. The driver is a **pixel adventurer**. Scanning a board is **collecting loot**. Saving pesos earns **coins and XP**.

"Modern pixel game" means:
- **Crisp pixel art** at whole-number scales, chunky dark outlines, a limited but saturated palette taken from the logo.
- **Modern UI around it**: generous spacing, clear hierarchy, readable body type, smooth motion, responsive layout. Not a retro emulator skin.
- **Game feedback**: buttons that press down like blocks, reward pops, progress bars, badges, tiny idle animations (a blinking pump light, drifting clouds).

Mood keywords: `chunky` · `sunny` · `cozy` · `tactile` · `collectible` · `readable` · `Filipino-town` · `optimistic`

**What we borrow from the references (mood only)**

| Reference quality | GasUp365 use |
| :--- | :--- |
| Bright block-built worlds with thick dark outlines (Growtopia-like) | Panels and buttons are chunky blocks: dark brown outline, top highlight, bottom shade, press-down motion. |
| Cheerful, social, collectible economy (Growtopia-like) | Coins for sharing prices, ranks, collectible badges, a "+10" pop. |
| Layered parallax skies and biome backdrops (Terraria-like) | Auth, Boot and Profile headers use 3–4 parallax layers: sky, far hills/sea, Kalibo rooftops and palms, road. |
| Inventory slots, hotbar, item tooltips (Terraria-like) | Fuel filter as a 3-slot hotbar; prices in item-slot frames; station sheet reads like an item tooltip. |
| Health/mana bars | XP bar on Profile; freshness bar on stations. |

**Local flavour (must include)**
- Kalibo setting: palms, nipa huts and concrete rooftops, a church silhouette, rice-field greens, a coastline in the far layer.
- Filipino vehicles as sprites: **jeepney** (hero), tricycle, delivery motorbike, car.
- **Ati-Atihan** festival confetti for celebration moments only (rank-ups, badges). Subtle and respectful: no costume caricatures.
- The **peso coin** (₱) as the in-world currency icon.
- English first, short Filipino phrases for flavour. Never put critical instructions only in Filipino.

**Avoid**
- Real gas-station brand logos in pixel art. Write the brand name as text on a generic station sprite.
- Pixel fonts for body text, inputs, addresses or small numbers.
- Blurry or non-integer-scaled pixel art; mixing pixel sizes within one layer.
- Dark-pattern gamification: no streak guilt, loot boxes or pay-to-win. Rewards only for useful contributions.
- Clutter over the map.
- Soft blurred drop shadows, gradients on UI panels, rounded pill shapes, glassmorphism. They break the pixel look.

### 5.2 The pixel panel (core primitive)

Every card, sheet, input, chip, slot and button is built from one primitive, **PixelPanel**.

```
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄          outline: 2 px, token color.outline
█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█         top/left inner highlight: 2 px, lighter fill
█░  fill            ░█         fill: surface token
█░                  ░█
█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█         bottom/right inner shade: 2 px, darker fill
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
   ████████████████████        hard shadow: 0 blur, offset y +4 px, color.outline at 35%
```

- **Corners**: square, optionally with a 2 px notch (one art pixel cut from each corner). **No rounded corners above 2 px.**
- **Variants**:

| Variant | Fill | Use |
| :--- | :--- | :--- |
| `panel` | `surface` | Cards, sheets, HUD panels |
| `slot` | `surfaceSunken` (inset: shade on top/left, highlight on bottom/right, no shadow) | Price slots, inputs, hotbar slots |
| `primary` | `action` | Main buttons, active slots |
| `secondary` | `surface` | Secondary buttons |
| `danger` | `danger` | Sign out, destructive actions |
| `reward` | `highlight` | Coin/reward moments, best pick ribbon |
| `sheet` | `surface` + pixel grab handle on top | Station sheet |

### 5.3 Color

#### 5.3.1 Palette (primitive tokens)

| Token | Hex | Notes |
| :--- | :--- | :--- |
| `orange500` | `#F97316` | Brand orange (current `primary`) |
| `orange700` | `#C2410C` | Current `primaryDark` |
| `orange50` | `#FFF1E7` | Current `primarySoft` |
| `cream` | `#FFFDF9` | Current `background` |
| `white` | `#FFFFFF` | Current `card` |
| `beige` | `#F8F2EC` | Current `accent` |
| `ink` | `#1F2933` | Current `text` |
| `slate600` | `#5F6B78` | **New** muted text (replaces `#7C8794`, which failed contrast) |
| `brown900` | `#3B1A08` | Logo outline brown |
| `brown700` | `#7A2E0B` | Shade |
| `tan500` | `#A8876A` | Visible UI border (3.31:1) |
| `sand300` | `#D9C6B3` | Decorative divider only |
| `yellow400` | `#FFD54A` | Logo highlight / coin |
| `amber500` | `#F5B700` | Diesel |
| `green500` | `#2FA84F` | Unleaded |
| `green700` | `#1E7F3A` | Unleaded dark |
| `red600` | `#D7263D` | Premium |
| `red800` | `#B01E33` | Premium dark |
| `green800` | `#15803D` | Success / savings (current `success`) |
| `red700` | `#DC2626` | Error (current `destructive`) |
| `amber700` | `#B45309` | Warning / aging |
| `gray500` | `#6B7280` | Stale |
| `sky300` | `#8FD3FF` / `sky600` `#4A90E2` | Parallax sky |
| `grass400` | `#6CCB5F` / `grass700` `#3E8E41` | Ground |
| `night900` | `#1B1F3B` | Night theme / scrim base |

#### 5.3.2 Semantic tokens (what components use)

Components use **only** semantic tokens, never raw hex.

| Semantic token | Value | Use |
| :--- | :--- | :--- |
| `bg` | `cream` | App background |
| `surface` | `white` | Panels, cards, sheet |
| `surfaceSunken` | `beige` | Slots, inputs, inactive chips |
| `surfaceTint` | `orange50` | Highlighted panels (savings, notices) |
| `text` | `ink` | Primary text |
| `textMuted` | `slate600` | Secondary text |
| `outline` | `brown900` | Pixel outline, strong borders |
| `border` | `tan500` | Input borders, separators that matter |
| `divider` | `sand300` | Decorative dividers only (never the only boundary) |
| `action` | `orange500` | Primary button / active slot fill |
| `onAction` | `brown900` | Text and icons on `action` (**dark brown, not white**) |
| `actionStrong` | `orange700` | Pressed state, links on light backgrounds |
| `onActionStrong` | `white` | Text on `actionStrong` |
| `highlight` | `yellow400` | Bevel highlight, coins, best pick |
| `shade` | `brown700` | Bevel shade on orange |
| `success` | `green800` | Savings, "fresh", success |
| `danger` | `red700` | Errors, destructive |
| `warning` | `amber700` | Needs review, aging |
| `stale` | `gray500` | Stale prices |
| `fuelDiesel` / `onFuelDiesel` | `amber500` / `brown900` | Diesel slot |
| `fuelUnleaded` / `onFuelUnleaded` | `green500` / `brown900` | Unleaded slot |
| `fuelPremium` / `onFuelPremium` | `red600` / `white` | Premium slot |
| `scrim` | `night900` at 55% | Behind modals |

> **Key change.** Primary buttons are **orange with dark brown text and outline**, exactly like the logo. White text on orange fails contrast (2.80:1); dark brown on orange passes (5.60:1) and looks more like the brand.

#### 5.3.3 Verified contrast (WCAG 2.x)

| Pair | Ratio | Result |
| :--- | :--- | :--- |
| `text` on `bg` | 14.52 | ✅ |
| `text` on `surfaceTint` | 13.34 | ✅ |
| `textMuted` (`#5F6B78`) on `bg` | 5.35 | ✅ |
| `textMuted` on `surfaceTint` | 4.92 | ✅ |
| `textMuted` on `surfaceSunken` | 4.90 | ✅ |
| `onAction` (brown) on `action` (orange) | 5.60 | ✅ |
| `onActionStrong` (white) on `actionStrong` | 5.18 | ✅ |
| `outline` on `surface` | 15.70 | ✅ |
| `border` (`#A8876A`) on `surface` | 3.31 | ✅ non-text (≥ 3:1) |
| `divider` (`#D9C6B3`) on `surface` | 1.66 | ⚠️ decorative only |
| `outline` on `highlight` | 11.12 | ✅ |
| `onFuelDiesel` on `fuelDiesel` | 8.72 | ✅ |
| `onFuelUnleaded` (brown) on `fuelUnleaded` | 5.11 | ✅ (white on it is 3.07 ❌) |
| `onFuelPremium` (white) on `fuelPremium` | 4.96 | ✅ |
| `success` on `surface` | 5.02 | ✅ |
| `danger` on `surface` | 4.83 | ✅ |
| `warning` on `surface` | 5.02 | ✅ |
| white on `stale` | 4.83 | ✅ |
| white on `night900` | 16.08 | ✅ |
| ❌ Do not use: white on `orange500` | 2.80 | ❌ |
| ❌ Do not use: `#7C8794` on anything light | 3.3–3.65 | ❌ |

Prices (the most important numbers) should reach **7:1**: use `text` or `outline` colour for price digits.

### 5.4 Typography

Three families, all Google Fonts (OFL), loaded with `expo-font`.

| Family | Role | Rules |
| :--- | :--- | :--- |
| **Pixelify Sans** (500–700) | Display: screen titles, prices, coin counts, station names in headers, button labels | Never for paragraphs or inputs. Minimum 16 px. |
| **Silkscreen** (400) | Micro tags: "SMART ROUTE", "SAMPLE", "LIVE", "NEW", hotbar labels | **UPPERCASE only**, minimum **12 px**, max ~3 words. |
| **Nunito** (600–800) | Body: addresses, descriptions, helper/error text, inputs, menu rows, long copy | Minimum **14 px** for body, **12 px** for captions only. |

> The design-intelligence tool suggested *Press Start 2P + VT323*. **Rejected**: Press Start 2P is very wide and becomes unreadable on small phones, and VT323 is too thin for outdoor reading. Pixelify Sans + Silkscreen give the pixel look with far better legibility.

**Type scale** (size / line height)

| Token | Family | Size / LH | Use |
| :--- | :--- | :--- | :--- |
| `price.hero` | Pixelify Sans 700 | 40 / 44 | Sheet expanded price, reward "+10" |
| `price.lg` | Pixelify Sans 700 | 28 / 32 | Station row price, sheet peek price |
| `display.lg` | Pixelify Sans 700 | 28 / 32 | Screen titles (Auth, Profile name) |
| `display.md` | Pixelify Sans 600 | 22 / 28 | Section titles, title bar |
| `display.sm` | Pixelify Sans 600 | 18 / 24 | Station names, card titles, button labels |
| `body.lg` | Nunito 700 | 16 / 24 | Important body, input text |
| `body.md` | Nunito 600 | 14 / 20 | Default body, addresses, menu rows |
| `caption` | Nunito 700 | 12 / 16 | Meta (distance, "Updated 5 min ago"), helper text |
| `tag` | Silkscreen 400 | 12 / 16, +0.5 tracking | Tags, hotbar labels |

- **Numbers**: tabular figures for prices and counts so columns line up.
- The app must survive **system text size at 130%** without clipping prices or buttons (text wraps; containers grow).

### 5.5 Spacing, sizing and the pixel grid

- **Spacing scale (4 px base)**: `s1` 4 · `s2` 8 · `s3` 12 · `s4` 16 · `s5` 20 · `s6` 24 · `s8` 32 · `s10` 40 · `s12` 48.
- **Screen gutter**: 16 px. Gap between cards: 12 px. Gap between sections: 24 px.
- **Art pixel**: UI chrome uses **1 art pixel = 2 px**. Borders, bevels, notches and pixel icons all snap to 2 px.
- **Scene sprites** (backgrounds, vehicles, reward bursts) may use 3 or 4 px per art pixel, but **one size per layer**.
- **Minimum hit area**: **48 × 48 px** (covers iOS 44 pt and Android 48 dp). Small visuals get invisible padding.
- **Component heights**: button 52 px (large) / 44 px visual + padding (small); input 52 px; hotbar 72 px + safe area; HUD chip 40 px visual in a 48 px hit area; list row min 96 px.

### 5.6 Borders, elevation and shape

| Token | Value | Use |
| :--- | :--- | :--- |
| `border.pixel` | 2 px `outline` | Every PixelPanel |
| `border.focus` | 4 px `highlight` outside the outline | Focused input, keyboard focus (web) |
| `border.selected` | 4 px `outline` + `highlight` inner line | Selected slot/tab |
| `elev.0` | none | Slots, inline content |
| `elev.1` | hard shadow y+4, `outline` 35% | Cards, panels |
| `elev.2` | hard shadow y+4 + outline | Floating HUD, map controls |
| `elev.3` | hard shadow y−4 (upward) | Sheet, hotbar |
| `elev.4` | `scrim` behind + elev.1 | Dialogs, Reward popup |
| `radius` | 0 (or 2 px notch) | Everything |

No blurred shadows anywhere.

### 5.7 Iconography and imagery

- **Replace Feather line icons** with a **custom pixel icon set** drawn on a **12 × 12 grid shown at 24 px** (×2). Large icons: **16 × 16 grid at 32 px**. Same outline weight, same palette, filled style only.
- Every meaningful icon has a text label next to it or an accessibility label.
- No emoji as icons in the product (emoji in this document are placeholders only).
- **Map pins**: 16 × 24 art grid at ×2 (32 × 48 px), anchored at bottom centre.
- **Photos** (price boards) are shown inside a `slot` frame with a 2 px outline. Never stretch; use cover crop in thumbnails and fit in full screen.
- Export pixel art as PNG at @1x/@2x/@3x with **no smoothing**; simple icons may also be rect-based SVG.

### 5.8 Voice, copy and formatting

#### 5.8.1 Voice
Friendly, short, practical. Talk like a helpful co-driver. A light game tone for rewards; plain language for anything about money, errors or permissions.

#### 5.8.2 Wording rules
| Never show users | Say instead |
| :--- | :--- |
| OCR, NLP, parser | "scan", "read the board" |
| Marker | "price update", "station" |
| Cloudinary, Firestore, Firebase | "photo", "the map", (nothing) |
| "Save Live Map Marker" | **"Share price"** |
| "Add Station Update" | **"Scan a price board"** |
| "Raw OCR Text" | **"Show what the camera read"** |
| "Live Price List" | **"Stations"** |
| "Smart diesel route" | **"SMART ROUTE · DIESEL"** (tag) |
| "item(s) need review" | "3 things to check" |

#### 5.8.3 Formatting
| Thing | Format | Example |
| :--- | :--- | :--- |
| Price per litre | `₱` + 2 decimals, no space | `₱61.50` |
| Savings in banners/rows | `Save ₱` + whole pesos | `Save ₱18` |
| Savings breakdown | 2 decimals | `₱26.40 fuel savings − ₱8.21 travel` |
| Negative net | Muted red, honest | `−₱5 · too far to be worth it` |
| Distance | 1 decimal + km | `1.8 km` |
| Time | `Live now` (< 1 min), `5 min ago`, `2 h ago`, `Yesterday`, then `Oct 21` | |
| Missing price | `—` + "No price yet" | |
| Counts | Number + noun | `8 stations` |
| Case | Sentence case for titles, buttons, labels. UPPERCASE only in Silkscreen tags. | "Share price", "SMART ROUTE" |

#### 5.8.4 Feedback copy (replace native alerts)
| Situation | Component | Copy |
| :--- | :--- | :--- |
| Camera not ready | Toast (info) | "Camera is starting. Try again in a second." |
| Capture failed | Toast (error) + Retry | "Couldn't take the photo. Try again." |
| Scan couldn't read text | Inline banner | "Couldn't read this board. You can type the prices instead." |
| Location missing | Inline field error + Enable | "We need your location to place this station on the map." |
| No price entered | Inline field error | "Add at least one fuel price." |
| Photo upload failed | Dialog | "Photo didn't upload." Buttons: **Retry** · **Share without photo** |
| Save failed | Dialog | "Couldn't share the price. Check your connection and try again." |
| Camera error | Inline panel | "Camera isn't available. Type the prices instead." |
| Web (no scanning) | Panel | "Scanning works in the mobile app. On this computer, type the prices." |
| Shared! | Reward popup | "+10 coins · Price shared! Drivers near Kalibo can see it now." |

### 5.9 Accessibility conventions

1. Text contrast ≥ 4.5:1 (≥ 3:1 for text ≥ 24 px bold); non-text UI ≥ 3:1; prices ≥ 7:1.
2. Hit areas ≥ 48 × 48 px with ≥ 8 px between targets.
3. Fuel type, freshness, source and selection are **never color-only**: always icon + text.
4. Every icon-only control has a spoken label, e.g. "Navigate to Caltex – Andagao with Google Maps", "Zoom in", "Close station details".
5. Inputs have **visible labels** (not placeholder-only). Errors appear **next to the field**.
6. Disabled controls look disabled (reduced emphasis + pattern) **and** explain why in helper text, e.g. "Add a price to continue".
7. Screen reader order matches visual order: HUD → banner → map → sheet → hotbar.
8. **Reduce Motion**: no parallax, no idle loops, no bounces; popups fade.
9. Supports 130% system text size.
10. Web: visible keyboard focus (`border.focus`) on every control; Tab order follows layout.

### 5.10 Honesty conventions (important for the exhibit)

- Built-in sample stations are tagged **SAMPLE** (Silkscreen tag, `surfaceSunken`). Only community updates under 1 hour old may say **LIVE**.
- Stats that aren't wired yet show **"—"** or the new-user state, never invented numbers.
- Menu items for unbuilt features are **disabled** with a "SOON" tag, not silently dead.
- Smart Route always shows **how** it got its number (tooltip, 11.1).

### 5.11 Motion

| Token | Spec | Use |
| :--- | :--- | :--- |
| `motion.press` | 80 ms; element moves down 4 px, shadow collapses to 0 | Every button and slot: the "block press" |
| `motion.toggle` | 120 ms, stepped | Chips, slots, tab switch |
| `motion.sheet.in` / `.out` | 240 ms ease-out / 180 ms ease-in, slide from bottom | Station sheet |
| `motion.pop` | 180 ms scale 0.8 → 1.05 → 1 | Reward popup, badges, "+10" |
| `motion.toast` | 200 ms in from top / 150 ms out | Toasts |
| `motion.idle` | Sprite loops at 6–8 fps, stepped (not tweened) | Pump light, coin spin, best-pick crown bob |
| `motion.parallax` | 20–60 s slow horizontal loops | Auth, Boot, Profile backgrounds |

Rules: exits are faster than entrances; **at most 1–2 animated elements per view**; nothing animates on the map layer except the best-pick crown and the new-pin drop; Reduce Motion replaces all of the above with fades or nothing.

### 5.12 Interaction conventions

- **Pressed feedback** within 80–150 ms on every tappable thing (motion.press).
- **Loading**: under 300 ms show nothing; 300 ms–2 s show an inline pixel spinner in the control; longer waits show a labelled progress ("Uploading photo…").
- **Toast** for passive info and confirmations; **Dialog** for decisions or errors that need an action; **inline** for form validation. Never native alerts.
- **Destructive actions** (sign out, discard a scan with edits) ask for confirmation.
- **Back** behaviour is predictable: leaving Scan mid-way with edits asks "Discard this scan?".
- The **sheet** closes with ×, tapping the map, or the system back gesture. Swipe-down to close is a nice-to-have.

### 5.13 Theming

Light ("Day") is the only required theme. `app.json` currently follows the system theme, so either ship Day only (lock the app to light) or provide the **Night shift** palette [FUTURE] with `night900` background, `#A9B1D6` muted text (7.62:1), and orange `action` (5.74:1 on night). Design one Home screen in Night as an exploration.

### 5.14 Naming conventions (so designs map to code)

- Tokens use the names in this section (`color.action`, `space.s4`, `type.price.lg`, `motion.press`, `z.sheet`). The existing `src/theme/colors.ts` names stay as aliases: `primary` → `action`, `primaryDark` → `actionStrong`, `primarySoft` → `surfaceTint`, `background` → `bg`, `card` → `surface`, `muted` → `textMuted`, `accent` → `surfaceSunken`, `destructive` → `danger`.
- Components use the PascalCase names in section 6 (`PixelPanel`, `PixelButton`, `Hotbar`, `FuelHotbar`, `StationSheet`, …).
- Frames: `Screen / State` (0.1).

---

## 6. Component library

Design each in **default, pressed, disabled, loading, error, focused (web)** where they apply.

| # | Component | Anatomy and states |
| :--- | :--- | :--- |
| 6.1 | **PixelButton** | Variants: Primary (orange, brown text), Secondary (white), Danger (red, white text), Ghost (text only, still 48 px hit area), Reward (yellow). Optional leading pixel icon. Sizes: Large 52 px, Small 44 px visual. Loading: label replaced by a 3-frame pixel spinner (bouncing fuel drop). |
| 6.2 | **Hotbar** (tab bar) | 5 slots, center Scan raised 16 px and 1.25× size. Each slot: 24 px pixel icon + Silkscreen label. Active: selected border + pixel arrow above. Badge dot for new rewards [NEXT]. Above safe area. |
| 6.3 | **FuelHotbar** (fuel filter) | 3 item slots: fuel icon + label, in fuel colour. Selected slot is raised with `border.selected`; unselected are sunken. Used on Map and Stations. Spoken as "Fuel type: Diesel, selected". |
| 6.4 | **SortToggle** | Segmented control with a visible label "SORT": **Smart** · **Nearest** · **Cheapest**. Visually distinct from FuelHotbar (text segments, no fuel colours). |
| 6.5 | **SearchField** | Slot-style input, pixel magnifier, Nunito text, clear (×) button when filled, placeholder "Search stations". |
| 6.6 | **MapPin** | Pixel signpost/pump sprite with a price label bubble (`₱61.50`) for the selected fuel. Variants: **sample**, **community**, **best pick** (gold crown, gentle bob), **selected** (larger + outline), **stale** (greyed, dashed) [NEXT], **no price for this fuel** (pin without bubble, faded), **user location** (pixel jeepney or pulsing dot). |
| 6.7 | **HudChip** | Small floating panel: logo chip, location chip ("📍 Kalibo"), coin counter ("🪙 156"), station counter ("8 STATIONS"), status chips (Offline, Showing sample stations, Location off + Enable). |
| 6.8 | **SmartRouteBanner** | Tag "SMART ROUTE · DIESEL", station name, "Save ₱18 net", chevron. Tap opens that station's sheet. States: **positive saving** ("Save ₱18 net"); **no station beats the trip cost** (best net ≤ ₱0: "Best value nearby · 0.7 km", never "Save ₱0"); no prices for this fuel ("No diesel prices yet. Be the first to scan!" + Scan); loading. |
| 6.9 | **MetricStrip** | 3 HUD stat slots: Stations live · Lowest ⟨fuel⟩ · Best net save. Web: always visible. Mobile: optional, tap-to-expand from the station counter. |
| 6.10 | **StationRow** (leaderboard row) | Left: rank number (1, 2, 3… with gold/silver/bronze frames for top 3 in Smart sort). Middle: station name (display.sm), address (body.md), distance + freshness (caption), source tag (SAMPLE / COMMUNITY), photo thumbnail if any. Right: **big price for the selected fuel** (price.lg) and "Save ₱18" (or negative). Expand chevron reveals all three prices + breakdown + Navigate. Variants: best pick ("BEST NET SAVE" ribbon), missing price ("—" "No price yet", sorted last), stale. |
| 6.11 | **StationSheet** | **Peek** (~140 px): name, selected price, distance, "Save ₱18 net", **Go** button, ×. **Expanded** (~72% height, scrolls): everything in StationRow plus the three PriceSlots, savings breakdown with "How is this calculated?" tooltip, FreshnessBar, **photo evidence** frame (tap → full screen, pinch zoom; placeholder "No photo – typed by hand"), "Shared by ⟨name⟩" [NEXT], big **Navigate with Google Maps** button, trust actions [FUTURE]. Tap the peek to expand; × or map tap to close. States: photo loading, photo failed, missing prices, stale warning. |
| 6.12 | **PriceSlot** | Sunken item-slot: fuel icon, label, price. States: normal, highlighted (selected fuel), missing ("—"), detected-by-scan (sparkle), edited-by-user (pencil), needs review (amber border). |
| 6.13 | **FormField** | Visible label (Silkscreen tag style or Nunito 700 12 px), slot input (Nunito 16 px), helper/error text below. States: empty, focused, filled, **Detected** (sparkle + "Detected"), **Needs review** (amber border + "Please check"), error (red border + message), disabled. Price fields: `₱` prefix, numeric keyboard, 2-decimal format. |
| 6.14 | **Stepper** | ① Snap · ② Review · ③ Share as three pixel nodes connected by a path; current node bright, done nodes checked. |
| 6.15 | **ViewfinderFrame** | Pixel corner brackets over the 4:3 camera, hint "Fit the whole price board in the frame", pixel scan-line sweep while reading. |
| 6.16 | **RewardPopup** | Coin-burst sprite, "+10", "Price shared!", one line of impact, XP bar filling, **Nice!** button. Variants: coins only, **rank up** (new rank name + confetti), **badge unlocked** (badge sprite + confetti). |
| 6.17 | **Badge** / **XPBar** | Badge: 32 × 32 emblem in a frame; locked (silhouette + "???"), unlocked, new (sparkle). XPBar: health-bar style segments, current rank icon, "12 / 20 to Price Ranger". |
| 6.18 | **Toast** | Small pixel panel from the top under the safe area: success (check), error (!), info (i). Auto-hide 3 s; errors stay until dismissed. |
| 6.19 | **Dialog** | Pixel panel modal over `scrim`: title, body, 1–2 buttons (primary on the right). Used for permissions, confirmations, upload failure. |
| 6.20 | **EmptyState** | Small pixel scene (8.x) + title + one line + one action. Variants: no stations, no search results, offline, error, web-only scanning, new user. |
| 6.21 | **Skeleton** / **Loader** | Blocky skeleton rows (stepped shimmer) for lists and sheet. Map loader: pixel jeepney driving across a road + "Loading map…". |
| 6.22 | **Avatar** | Pixel driver bust or vehicle sprite in a frame. [DEMO] one default; [NEXT] choose a vehicle. |
| 6.23 | **FreshnessBar** | 5-segment bar + text. Fresh (< 1 h) full green, aging (1–24 h) amber, stale (> 24 h) grey + "May be outdated". Thresholds are placeholders until FEAT-005. |
| 6.24 | **TitleBar** | Pixel bar at the top of non-map screens: title (display.md), optional subtitle, optional right action. Parallax mini-strip behind it is allowed on Stations/Me only if it doesn't reduce contrast. |
| 6.25 | **MenuRow** | 56 px row: pixel icon, label, optional count badge, chevron. States: default, pressed, disabled with SOON tag, danger (Sign out). |
| 6.26 | **InfoTooltip** | "How is this calculated?" bubble with the plain-language Smart Route explanation (11.1). |

---

## 7. Screen specifications

Each screen lists **Purpose**, **Layout**, **Content**, **Actions**, **States** and **Pixel treatment**. All states are required unless tagged.

### 7.1 Boot (session check) [DEMO]

- **Purpose**: shown while the app checks whether the user is signed in (F-02).
- **Layout**: full-screen parallax Kalibo scene, logo centred at 40% height, jeepney idle animation on the road, "LOADING…" tag below.
- **States**: loading only (usually < 2 s). Reduce Motion: static scene.
- **Native splash** (F-01): static orange `#F97316` with a 1:1 pixel pump/logo mark. Design it so it hands over smoothly to this screen.

### 7.2 Auth: Log in / Sign up [DEMO]

- **Purpose**: create or open an account so contributions are credited (F-03 to F-07).
- **Layout**: "game title screen". Parallax backdrop fills the screen; a **menu window** (PixelPanel) is centred at the lower half; logo + tagline above it. Keyboard open: the window scrolls so the focused field and the button stay visible.

```
┌───────────────────────────┐
│   ☁      ☁    (sky)       │
│      ▓▓ GasUp365 ▓▓       │  logo
│ Find better fuel stops,   │
│        faster.            │
│ ⌂⌂ 🌴 ⛪ ⌂ 🌴 ⌂⌂ (town)   │
│ ═══🚌═════════ (road)     │
│ ┌───────────────────────┐ │
│ │ [ LOG IN | SIGN UP ]  │ │  segmented toggle
│ │ Welcome back          │ │
│ │ EMAIL                 │ │
│ │ [__________________]  │ │
│ │ PASSWORD              │ │
│ │ [______________ 👁]   │ │
│ │ [   Log in  ➜      ]  │ │
│ └───────────────────────┘ │
└───────────────────────────┘
```

- **Content**: toggle **Log in | Sign up**; titles "Welcome back" / "Create your account"; subtitles "Sign in to continue." / "Track fuel prices in one place."; fields **Full name** (sign up only), **Email**, **Password** with show/hide; helper "At least 6 characters"; primary button **Log in ➜** / **Create account ➜**. Remove the duplicate "New here? Sign up" link.
- **States**: default · typing · submit disabled (with helper explaining why) · submitting (spinner in button) · each error from F-07 (inline under the button) · network error · keyboard open · [NEXT] first sign-up welcome popup "Welcome, ⟨name⟩! You're a Rookie Spotter."
- **Pixel treatment**: the strongest game moment in the app.

### 7.3 Map (Home) [DEMO]

- **Purpose**: see stations around you with prices, and the best one for your fuel, at a glance (F-13 to F-23, F-26, F-27).
- **Layout**: World + HUD (4.3).
- **Content**: HUD row 1 (logo chip, location chip "Kalibo", coin counter [NEXT; hide until wired]), row 2 (FuelHotbar, station counter), SmartRouteBanner, map controls, pins (sample + community, price bubbles for the selected fuel, crown on best pick, user marker), StationSheet when a pin is selected, OpenStreetMap attribution.
- **Actions**: pan/zoom; switch fuel (updates pins, banner, metric strip); tap banner → best station's sheet; tap pin → sheet peek; tap peek → expand; Go/Navigate → Google Maps; recenter on me; hotbar Scan.
- **States**:
  - Map loading (jeepney loader).
  - Live updates loading (station counter shows a spinner; sample pins appear immediately).
  - Location denied: chip "Location off · showing Kalibo centre" + **Enable** (distances are estimates).
  - Map failed: EmptyState "Couldn't load the map" + **Retry** + **See stations list**.
  - Live data unavailable: chip "Showing sample stations".
  - No prices for the selected fuel: banner "No ⟨fuel⟩ prices yet. Be the first to scan!" + Scan.
  - No station beats the trip cost (best net ≤ ₱0, which is what the sample data produces today): banner "Best value nearby · Petron – Kalibo · 0.7 km".
  - Pin selected: sheet peek; sheet expanded.
  - New pin just shared: drop + dust-puff animation on the new pin.
  - Offline [NEXT]: chip "Offline · prices may be old"; last data stays.
- **Pixel treatment**: map tiles stay a real map (can't be pixel art); a slight warm tint is allowed. Pins, HUD, banner and sheet are fully pixel.

### 7.4 Station sheet [DEMO]

- **Purpose**: everything needed to decide "go here or not", plus proof the price is real.
- **Layout**: Peek and Expanded (6.11), above the hotbar.

```
Peek                                   Expanded
┌───────────────────────────────┐     ┌───────────────────────────────┐
│ ▬▬ (grab)                  ✕  │     │ ▬▬                          ✕ │
│ Caltex – Andagao     ₱61.50   │     │ Caltex – Andagao  [COMMUNITY] │
│ 1.8 km · Save ₱18 net [GO ➤]  │     │ Andagao, Kalibo, Aklan · 1.8km│
└───────────────────────────────┘     │ ★ SMART ROUTE                 │
                                      │ ┌──────┐┌──────┐┌──────┐      │
                                      │ │⛽ D  ││⛽ U  ││⛽ P  │      │
                                      │ │61.50 ││64.30 ││73.90 │      │
                                      │ └──────┘└──────┘└──────┘      │
                                      │ Save ₱18 net            (i)   │
                                      │ ₱26.40 fuel − ₱8.21 travel    │
                                      │ ▮▮▮▮▮ Updated 6 min ago       │
                                      │ ┌───────────────────────────┐ │
                                      │ │   [photo of price board]  │ │
                                      │ └───────────────────────────┘ │
                                      │ Shared by Aira      [NEXT]    │
                                      │ [  Navigate with Google Maps ]│
                                      └───────────────────────────────┘
```

- **States**: peek · expanded · photo loading · photo failed · no photo ("Typed by hand") · missing prices ("—") · stale warning · negative net ("−₱5 · too far to be worth it") · [FUTURE] trust actions.

### 7.5 Stations (list) [DEMO]

- **Purpose**: compare every station side by side, sorted by what matters now (F-28 to F-34).
- **Layout**: TitleBar "Stations" + subtitle "Ranked by net pesos saved" (changes with sort) → SearchField → FuelHotbar → SortToggle → leaderboard rows.

```
┌───────────────────────────────┐
│ Stations                      │
│ Ranked by net pesos saved     │
│ [🔍 Search stations        ✕] │
│ [⛽Diesel][⛽Unleaded][⛽Prem]  │
│ SORT [Smart|Nearest|Cheapest] │
│ ┌───────────────────────────┐ │
│ │🥇1 Caltex – Andagao ₱61.50│ │  BEST NET SAVE ribbon
│ │   1.8 km · 6 min  Save ₱18│ │
│ ├───────────────────────────┤ │
│ │ 2 Petron – Kalibo   ₱61.90│ │
│ │   0.7 km · Live   Save ₱11│ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

- **Actions**: search; switch fuel; switch sort; tap a row → StationSheet (or show on map); tap Go/Navigate.
- **States**: loading (skeleton rows) · results · no search results ("No stations match '⟨query⟩'" + Clear search) · no stations at all (EmptyState "No prices here yet" + "Scan the first price board" + Scan) · stations missing the selected fuel (listed last, "—", excluded from Smart ranking) · offline [NEXT].
- **Pixel treatment**: rows stack like a leaderboard; top 3 in Smart sort get gold/silver/bronze rank frames.

### 7.6 Scan: Snap → Review → Share [DEMO]

- **Purpose**: turn a price-board photo into a shared update in under 30 seconds (F-35 to F-51).
- **Layout**: TitleBar "Scan a price board" + **Stepper** → one step per view → **sticky footer** with the step's primary button.

#### 7.6.1 Step ① Snap
- **Camera permission not asked**: pixel camera illustration, "Use your camera to read the price board", **Enable camera**, secondary **Type prices instead**.
- **Permission denied permanently**: "Camera is off for GasUp365. Turn it on in Settings, or type the prices." **Open Settings** · **Type prices instead**.
- **Camera live**: ViewfinderFrame at 4:3, hint, big round-square **Scan** shutter (pixel lightning icon), **Type prices instead** link.
- **Reading**: frozen photo + scan-line + "Reading the price board…" with sub-steps (photo ✓ → location ✓ → reading…).
- **Web**: "Scanning works in the mobile app. On this computer, type the prices." → goes straight to Review with empty fields.

#### 7.6.2 Step ② Review
- **Summary banner**: "Found 3 prices · Ready to share" / "Found diesel · 3 things to check" / "Couldn't read this board. Type the prices instead."
- **Photo thumbnail** + **Retake**.
- **Fields**: Station name (placeholder "e.g. Petron Kalibo"), Address (placeholder "Roxas Avenue, Kalibo, Aklan"), Location chip ("📍 Location captured" / "Location needed · Enable"), Diesel, Unleaded, Special / Premium (₱ prefix; placeholders 62.50 / 65.20 / 75.80). Show the three prices as **one row of PriceSlot inputs** on ≥ 390 px, stacked on 360 px.
- Each field shows **Detected** or **Needs review**.
- **"Show what the camera read"** disclosure (collapsed; selectable monospace text inside).
- **Footer button**: **Share price ➜**, disabled until at least one price and a location exist (helper says which is missing).

#### 7.6.3 Step ③ Share
- **Progress**: "Uploading photo…" → "Sharing to the map…" with a pixel progress bar.
- **Success**: RewardPopup "+10 coins · Price shared!" → **Nice!** → Map with the new pin dropping in.
- **Errors**: photo upload failed dialog (**Retry** · **Share without photo**) · save failed dialog · location/price errors return to Review with inline errors.
- **Leaving with edits**: dialog "Discard this scan?" **Keep editing** · **Discard**.
- **Coin values** (placeholders until FEAT-003): +10 per shared update, +5 with a photo, +5 first update at a new station.

### 7.7 Me (Profile) [DEMO]

- **Purpose**: identity and impact; make contributing feel rewarding (F-52 to F-56).
- **Layout**: Character sheet.

```
┌───────────────────────────────┐
│ (parallax mini-scene)         │
│      ┌────┐                   │
│      │ 🧢 │  Aira Santos      │
│      └────┘  PUMP SCOUT       │
│ XP ▮▮▮▮▮▮▯▯▯▯ 12/20 → Price Ranger │
│ ┌───────┐┌───────┐┌───────┐   │
│ │📷 12  ││🪙 156 ││⭐ 4.8 │   │  stat slots
│ │UPDATES││COINS  ││TRUST  │   │
│ └───────┘└───────┘└───────┘   │
│ BADGES  [🏅][🏅][？][？] ›      │  [NEXT]
│ ┌───────────────────────────┐ │
│ │ 📍 Saved locations   SOON │ │
│ │ 🔔 Notifications     SOON │ │
│ │ 📉 Price alerts      SOON │ │
│ │ ⚙ Settings           SOON │ │
│ │ ? Help & support     SOON │ │
│ │ i About GasUp365       ›  │ │
│ │ ⇥ Sign out                │ │  danger
│ └───────────────────────────┘ │
│ GasUp365 v1.0.0               │
│ Empowering Filipino drivers,  │
│ one update at a time          │
└───────────────────────────────┘
```

- **Content**: avatar, display name (fallback "GasUp365 Driver"), rank title, XP bar [NEXT], stat slots (Updates, Coins, Trust), Community impact stat [NEXT], badge shelf [NEXT], menu, footer.
- **States**: loading (skeleton slots) · new user (zeros, "Share your first price to earn your first badge!" + Scan) · real data · sign-out confirmation dialog.
- **Proposed ranks** (Len approves in FEAT-003): Rookie Spotter (0) → Pump Scout (5 updates) → Price Ranger (20) → Fuel Guardian (50) → Kalibo Legend (100).
- **Proposed badges**: First Scan, Photo Pro (10 photo updates), Early Bird (before 7 AM), Night Owl (after 9 PM), Diesel Hunter / Unleaded Hunter / Premium Hunter, Station Explorer (5 different stations), Ati-Atihan Hero (festival week, seasonal).

### 7.8 Rewards [NEXT] (proposal)

Rank ladder with the current rank highlighted, XP bar, badge grid (locked silhouettes, tap for how to earn, date earned, rarity frame), and [FUTURE] a weekly "Top spotters in Kalibo" leaderboard. Demo fallback: preview with locked badges and a "SOON" tag.

### 7.9 About GasUp365 [NEXT]

Mission (section 1), how Smart Route works (11.1), team/guild credit, version, data note ("Prices are shared by the community. Always confirm at the pump."), credits ("© OpenStreetMap contributors", open-source licences).

### 7.10 Future screens [FUTURE] (one screen each)

| Screen | Content |
| :--- | :--- |
| Price alerts | Choose fuel, ₱ threshold (stepper), radius 1/5/10 km, on/off per alert, empty state. |
| Saved locations | Saved spots (home, terminal, route) with current best price. |
| Notifications | Inbox: price drops, "your update helped 12 drivers", badge unlocks, confirmations. |
| Settings | Default fuel, vehicle + km/L (default 12), fill litres (default 20), radius, theme, reduce motion, language, account. |
| Regional dashboard | Average price per fuel, area vs national, pixel bar-chart trend, cheapest stations. |
| Help & support | FAQ (How do I scan? Why is a price stale? How are coins earned?), report a problem, contact. |

---

## 8. Pixel asset list

| # | Asset | Art grid | Display | Frames | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 8.1 | Parallax layers: sky, far hills/sea, Kalibo town (rooftops, palms, church), road | 320 px wide, tileable | ×3 | static | Day set required; Night [FUTURE] |
| 8.2 | Jeepney (hero) | 32 × 16 | ×2–×3 | 4 (drive) | Loader, auth, avatar option |
| 8.3 | Tricycle, motorbike, car | 32 × 16 | ×2–×3 | 2–4 | Avatars, decoration |
| 8.4 | Generic gas station | 48 × 32 | ×2 | 2 (sign blink) | Brand as text, never logos |
| 8.5 | Fuel pump | 16 × 16 | ×2 | 2 | Pins, empty states |
| 8.6 | Map pins: sample, community, best (crown), selected, stale, no-price, user | 16 × 24 | ×2 | 1–2 | Bottom-centre anchor |
| 8.7 | Fuel icons: diesel (drop), unleaded (leaf-drop), premium (star-drop) | 12 × 12 | ×2 | static | Distinct shapes, not just colours |
| 8.8 | UI icons: map, stations/list, camera, star/rewards, user, search, navigate, close, clock, zap, award, bell, settings, help, info, log-out, map-pin, trending-down, check, warning, edit, photo, wifi-off, eye, chevron, plus, minus, recenter | 12 × 12 | ×2 (24 px) | static | One consistent filled style |
| 8.9 | Peso coin | 12 × 12 | ×2 | 6 (spin) | Coins, savings |
| 8.10 | Coin burst, sparkle, dust puff | 32 × 32 | ×2 | 6 | Reward and pin-drop |
| 8.11 | Ati-Atihan confetti | 4 × 4 particles | ×2 | 4 | Rank-up and badges only |
| 8.12 | Badges (×10) + locked variant | 32 × 32 | ×2 | static | Section 7.7 |
| 8.13 | Avatar busts | 32 × 32 | ×2–×3 | 2 (blink) | Default + variants |
| 8.14 | Empty-state scenes: no stations, no results, offline (cloud + plug), error (broken pump), web scanning (phone), new user | 96 × 64 | ×2 | static or 2 | |
| 8.15 | Rank frames: gold, silver, bronze | 16 × 16 | ×2 | static | Leaderboard top 3 |
| 8.16 | App icon / splash mark | 32 × 32 master | export 1024 | static | Logo palette |

Export: PNG @1x/@2x/@3x, integer scaled, no smoothing; sprite sheets for animations; simple icons may also be rect-based SVG.

---

## 9. Build constraints

| Topic | Constraint |
| :--- | :--- |
| Platforms | Android (primary), iOS, Web (exhibit laptop). Scanning is **mobile only**. |
| Screen sizes | Base 390 × 844; must work at 360 × 640; web 1440 × 900. Portrait only on phones. |
| Map | Leaflet with OpenStreetMap tiles (in a WebView on phones, in the page on web). **Tiles can't become pixel art**; a tint/saturation filter is possible. Pins are image icons. Attribution "© OpenStreetMap contributors" must stay visible. Map needs internet. |
| Panels and borders | Nested views with solid borders and hard (0-blur) shadows, or 9-slice PNG frames. No CSS `border-image`, no blurred shadows. |
| Fonts | Max 3 Google Fonts via `expo-font` (5.4). |
| Motion | `react-native-reanimated` and `react-native-gesture-handler` are available. Sprite animation via sprite sheets. Keep animation off the map layer. |
| Sheet | Tap-to-expand with two heights; no drag-to-resize required. |
| Safe areas | `react-native-safe-area-context` is available; all fixed UI uses insets. |
| Feedback | Native alert dialogs don't show on web: **everything is in-app** (toast, dialog, inline). |
| Images | Station photos are remote URLs; design loading and failed states. |
| Performance | Older Androids: no full-screen blur, no large animated backgrounds behind scrolling lists, keep sprite sheets small. |
| Dependencies | Don't require new UI libraries. Web-only kits (shadcn/ui, Tailwind) don't apply to this React Native app. |

---

## 10. Exhibit demo storyboard

Prototype this as a clickable flow (the 60-second booth walkthrough).

1. **Title screen**: Auth with the parallax Kalibo scene and a jeepney driving by. Tap **Log in**.
2. **World view**: Map with pixel pins over Kalibo, Diesel slot active, Smart Route banner on the best station (positive-saving state if Len adjusts the sample prices, otherwise "Best value nearby · Petron – Kalibo", see 13 question 9). The best pin wears a bobbing crown.
3. **Station sheet**: tap the crown pin → peek → tap to expand: three prices, savings breakdown, freshness, photo, **Navigate with Google Maps**.
4. **Scan**: tap the center **Scan** slot → viewfinder → scan-line → Review with fields popping in marked "Detected".
5. **Share + reward**: tap **Share price** → coin burst "+10 coins · Price shared!" → XP bar fills → **Pump Scout** rank-up with confetti.
6. **Back to the world**: the new pin drops onto the map with a dust puff; the **Stations** tab shows it in the leaderboard.

Booth fallback frame: Stations tab as the start screen if the map can't load.

---

## 11. Logic and data the UI must explain

### 11.1 Smart Route ("net pesos saved")

For the selected fuel:

- **Area average** = average price of that fuel across listed stations.
- **Fuel savings** = max(0, (area average − station price) × **20 L**).
- **Travel cost** = (distance × 2 for the round trip ÷ **12 km/L**) × station price.
- **Net pesos saved** = fuel savings − travel cost. **Can be negative**: a cheap station that's too far isn't worth it.
- **Best pick** = highest net saving; ties go to the nearer station.

Tooltip copy: *"We compare each station's price with the area average for a 20-litre fill, then subtract the fuel you'd burn driving there and back (at 12 km per litre). The highest number is your Smart Route."*

**Real results with the current sample data** (computed from the code's formula, 2026-10-22):

| Fuel | Area average | Best pick | Fuel savings | Travel cost | Net |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Diesel | ₱61.975 | Petron – Kalibo (0.7 km) | ₱1.50 | ₱7.22 | **−₱5.72** |
| Unleaded | ₱64.925 | Petron – Kalibo | ₱2.50 | ₱7.56 | **−₱5.06** |
| Premium | ₱74.20 | Petron – Kalibo | ₱12.00 | ₱8.59 | **+₱3.41** |

Example of one row: Caltex – Andagao, Diesel ₱61.50, 1.8 km → fuel savings (61.975 − 61.50) × 20 = ₱9.50; travel (3.6 ÷ 12) × 61.50 = ₱18.45; net −₱8.95.

The sample stations are only ₱0.90 apart, so the trip usually costs more than the price difference. Today the Home banner hides this by showing "Net savings P0". The design must:
- never show "Save ₱0"; use the "Best value nearby" banner state (6.8) when the best net is ≤ ₱0;
- show negative nets honestly in rows and the sheet ("−₱5.72 · trip costs more than you save").

Whether to adjust the sample prices so the demo shows a positive saving is a data decision for Len (13, question 9).

### 11.2 Station data fields

| Field | Example | Notes |
| :--- | :--- | :--- |
| Name | Petron – Kalibo | From the scan or typed |
| Address | Roxas Avenue, Kalibo, Aklan | From the scan or typed |
| Distance | 0.7 km | From your GPS (estimated if location is off) |
| Prices | Diesel ₱61.90 · Unleaded ₱64.80 · Premium ₱73.60 | Any can be missing on community updates |
| Last updated | Live now / 3 min ago | FreshnessBar |
| Source | Sample / Community | Tag |
| Photo | Price-board image | Community updates with a photo |
| Shared by | Display name | [NEXT] |
| Trust score | 0–100 | [FUTURE] |

### 11.3 Sample stations (demo data)

| Station | Address | Distance | Diesel | Unleaded | Premium |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Petron – Kalibo | Roxas Avenue, Kalibo, Aklan | 0.7 km | ₱61.90 | ₱64.80 | ₱73.60 |
| Shell – Kalibo Crossing | Kalibo Crossing, Kalibo, Aklan | 1.1 km | ₱62.40 | ₱65.10 | ₱74.20 |
| Caltex – Andagao | Andagao, Kalibo, Aklan | 1.8 km | ₱61.50 | ₱64.30 | ₱73.90 |
| Phoenix – Estancia | Estancia, Kalibo, Aklan | 2.4 km | ₱62.10 | ₱65.50 | ₱75.10 |

---

## 12. Pre-delivery checklist

Before handing designs back, confirm:

**Layout**
- [ ] Every screen uses the ScreenFrame; nothing sits under the notch, status bar or home indicator.
- [ ] Home keeps ≥ 55% of the map visible with nothing selected.
- [ ] Only one Scan entry point (the hotbar).
- [ ] 360 × 640 checked for Map, Stations, Scan; 1440 × 900 two-pane delivered.
- [ ] Lists and forms are not hidden behind the hotbar or sticky footer.

**Visual**
- [ ] Every surface is a PixelPanel variant; no rounded corners > 2 px, no blurred shadows, no gradients on panels.
- [ ] Pixel art at integer scales, one art-pixel size per layer.
- [ ] One icon family (custom pixel set), no emoji icons, no Feather leftovers.
- [ ] Logo used as supplied, never re-typeset.
- [ ] No real gas-station logos in art.

**Type and colour**
- [ ] Only semantic colour tokens; every text pair is in the contrast table at ≥ 4.5:1.
- [ ] Primary buttons use brown text on orange (never white on orange).
- [ ] No text under 12 px; body ≥ 14 px; pixel fonts never in paragraphs or inputs.
- [ ] Prices formatted `₱61.50`; savings `Save ₱18`; negatives shown honestly.

**Interaction and accessibility**
- [ ] Every tappable thing ≥ 48 × 48 px with pressed state.
- [ ] Every icon-only control has a spoken label.
- [ ] Fuel type, freshness, source and selection never rely on colour alone.
- [ ] All errors are in-app (toast, dialog or inline) with the copy from 5.8.4.
- [ ] Reduce Motion variants specified.
- [ ] Every state listed in section 7 is drawn.

**Honesty**
- [ ] Sample data tagged SAMPLE; no invented stats; unbuilt menu items show SOON.
- [ ] No developer words (OCR, NLP, marker, Cloudinary, Firestore) in the UI.

---

## 13. Open questions for Len

1. **Rewards tab** (4.2): approve a 5th hotbar slot "Rewards" (preview for the demo, full in FEAT-003)? *Proposed: yes.*
2. **Coins vs points**: show "coins" in the UI and keep `points` in data? *Proposed: yes.*
3. **Rank names and thresholds** (7.7): approve or rename.
4. **Fuel colours** (5.3): do Kalibo drivers associate colours with diesel/unleaded/premium? If yes, match them.
5. **Avatar choice at sign-up** (vehicle picker): demo or [NEXT]?
6. **Language**: English first with Filipino flavour (proposed), or a full Filipino toggle?
7. **Theme**: lock the app to Day for the demo (proposed), or design Night now?
8. **Default tab at the booth**: Map (proposed) or Stations (safer if Wi-Fi is bad)?
9. **Demo sample prices**: with today's sample data, Smart Route's best diesel pick *loses* ₱5.72 after travel (11.1). Spread the sample prices further apart so the demo shows a real saving, or keep them and rely on the "Best value nearby" state?

## Approval

- **Len's approval**: *Pending chat review of Revision 1.*
