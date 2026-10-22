# GasUp365: Design Spec for Claude Design

Created: 2026-10-21T16:00:00+08:00
Updated: 2026-10-21T16:00:00+08:00
Revision: 1
Status: Superseded by DESIGN-002 ([CLAUDE_DESIGN_HANDOFF.md](CLAUDE_DESIGN_HANDOFF.md)) on 2026-10-22
ID: DESIGN-001

> **Superseded.** Use [CLAUDE_DESIGN_HANDOFF.md](CLAUDE_DESIGN_HANDOFF.md). It contains everything below plus the UI/UX evaluation, the layout decision and the design conventions. This file is kept for history only.

> **What this document is**: a self-contained brief for designing every GasUp365 screen. It covers what the app does, why each feature exists, what data each screen shows, which states every screen needs, and the visual direction: **a modern pixel-art game look, inspired by sandbox pixel games like Growtopia and Terraria**.
>
> **Read with**: [../product/OVERVIEW.md](../product/OVERVIEW.md), [../product/DATA_MODEL.md](../product/DATA_MODEL.md), [../RECON_REPORT.md](../RECON_REPORT.md).

---

## 0. How to use this brief

### 0.1 Priority tags

Every screen and feature has a tag. Design in this order.

| Tag | Meaning |
| :--- | :--- |
| **[DEMO]** | Must exist and look finished for the guild exhibit demo. Built or being built now. |
| **[NEXT]** | Planned right after the demo flow works (FEAT-001 to FEAT-003). Design it fully. |
| **[FUTURE]** | Roadmap (Phase 2+). One good-looking screen or placeholder is enough. Don't design every state. |

### 0.2 Deliverables requested from Claude Design

1. **Design tokens**: color, type, spacing, border, shadow, and motion tokens (section 4), named so they map onto `src/theme/colors.ts`.
2. **Component sheet**: every component in section 5, in each of its states.
3. **Screens**: every screen in section 6, at **390 × 844 (mobile portrait)**, with every listed state.
4. **One web/laptop layout** (1440 × 900) of the Live Map with the list side panel. The exhibit may run on a laptop browser.
5. **Pixel asset list**: the sprites and icons needed, with grid size and frame counts (section 7).
6. **Demo storyboard**: the 6-frame exhibit walkthrough (section 9) as a connected prototype.

### 0.3 Hard rules

- **Original art only.** Growtopia and Terraria are *mood references*. Do not copy their sprites, characters, tiles, logos, fonts, UI frames, or names. Every asset must be original to GasUp365.
- **Clarity beats game flavor.** This is a money tool for drivers checking prices between trips. Prices, distances, and buttons must be readable at a glance, outdoors, in sunlight, on cheap Android phones.
- **Keep the existing logo** (`assets/images/Gasup.png`). It's already a pixel wordmark (orange-to-yellow gradient letters, dark brown outline, chunky bevel), and the whole visual system should grow out of it.
- **Every design must be buildable in Expo SDK 55 / React Native** (section 8).

---

## 1. Product in one page

**GasUp365** is a community-powered fuel price finder for Filipino drivers. The MVP covers **Kalibo, Aklan, Philippines**.

**The problem**: fuel prices in the Philippines change weekly. Jeepney, tricycle, bus, taxi, and TNVS/Grab drivers, delivery riders, and commuters lose real money, because the only ways to compare stations are word of mouth or burning fuel driving between them. Every peso per liter cuts into a driver's take-home pay.

**The core loop ("Snap → Share → Save")**:

1. **Snap**: a driver at a station photographs the price board.
2. **Extract**: on-device OCR plus a fuel-station text parser reads the station brand, address, GPS position, and prices for **Diesel**, **Unleaded**, and **Premium** (shown as "Special" on some boards).
3. **Share**: the driver reviews and corrects the result. The update and its photo evidence go live on everyone's map.
4. **Save**: other drivers see live prices on a map and a list, filter by fuel type, and get a **Smart Route** pick: the station that saves the most pesos *after* the fuel spent driving there. One tap opens Google Maps directions.

**The question the app answers**:
> *"Saan ako magpapagasolina na pinakamalapit at pinakamura ngayon?"*
> ("Where can I fuel up nearest and cheapest right now?")

**Taglines** (use in splash, auth, empty states):
- "Find better fuel stops, faster." (current)
- "Download, snap, save."
- "Sama-sama tayong magtipid!" ("Let's all save together!")

### 1.1 Users

| Persona | Context | What they need from the UI |
| :--- | :--- | :--- |
| **Mang Rudy, jeepney/tricycle driver** (primary) | Mid-route, one hand on the phone, bright sun, older Android phone, patchy data. | Cheapest diesel nearby in under 5 seconds. Huge numbers. One-tap navigate. |
| **Aira, delivery rider** (secondary) | Many short trips a day. Competitive. | Fast scanning of price boards. Rewards and ranks that make contributing fun. |
| **Private commuter** (tertiary) | Plans fill-ups ahead of time. | Compare stations, see how fresh a price is, trust the data. |
| **Exhibit visitor** (demo) | 60 seconds at the booth. | An instant "wow, it's a game", then an instant "oh, it actually saves money". |

### 1.2 Fuel types

The app knows three fuel types. They need **distinct, colorblind-safe identities**: color *plus* icon *plus* label, never color alone.

| Key | Label | Notes |
| :--- | :--- | :--- |
| `diesel` | Diesel | Default selection. The primary audience (jeepneys, trucks) runs on diesel. |
| `unleaded` | Unleaded | Boards may say "Regular", "Gasoline", "Gas", "91", "Extra". |
| `premium` | Premium | Boards may say "Special", "V-Power", "XCS", "Blaze", "95/97". Shown as **Special / Premium** on the scan form. |

---

## 2. Visual direction: "Pixel Pump Town"

### 2.1 The concept

GasUp365 looks like a **cozy, modern 2D pixel sandbox world**: the town of Kalibo rebuilt as a bright side-scrolling pixel landscape. Gas stations are **outposts or shops** in that world, the driver is a **pixel adventurer**, scanning a price board is **collecting loot**, and saving pesos earns **coins and XP**.

"Modern pixel game" means:
- **Crisp pixel art** at integer scales, chunky outlines, and limited but saturated palettes.
- **Modern UI around it**: generous spacing, clear hierarchy, smooth (not jittery) motion, real typography for body text, and responsive layouts. Not a retro emulator skin.
- **Game-like feedback**: reward popups, progress bars, badges, satisfying button presses, and little idle animations (a flickering pump light, drifting clouds).

### 2.2 Mood keywords

`chunky` · `sunny` · `cozy` · `tactile` · `collectible` · `readable` · `Filipino-town` · `optimistic`

### 2.3 What we take from the references (as mood only)

| Reference quality | How GasUp365 uses it |
| :--- | :--- |
| **Bright, block-built worlds with thick dark outlines** (Growtopia-like) | UI panels look like chunky blocks. 2-art-pixel dark brown outline, top highlight, bottom shade. Buttons physically "press down". |
| **Cheerful, social, collectible economy** (Growtopia-like) | Contributor points as **coins**, contributor ranks, badges as collectible items, a friendly "+10" pop when you share a price. |
| **Layered parallax skies and biome backdrops** (Terraria-like) | Auth and header backgrounds use 3–4 parallax layers: sky gradient, far hills, Kalibo rooftops/palms, foreground road. Time of day can tint the sky. |
| **Inventory/hotbar slots and item tooltips** (Terraria-like) | Fuel-type filter as a **hotbar** of 3 slots. Prices sit in item-slot frames. The station sheet reads like an item tooltip with stats. |
| **Health/mana style bars** | XP bar on Profile. Price-freshness bar on station cards. |

### 2.4 Local flavor (must include)

- **Kalibo, Aklan setting**: tropical palms, nipa-hut and concrete town rooftops, a church silhouette, rice-field greens, and a coastline hint in the far parallax layer.
- **Filipino vehicles as pixel sprites**: jeepney (hero vehicle), tricycle, motorcycle/delivery bike, and car. The user's avatar can choose one (Profile, [NEXT]).
- **Ati-Atihan festival accents** (Kalibo's famous festival) for celebration moments only, such as badge unlocks and level-ups: confetti in festival colors. Keep it subtle and respectful, with no costume caricature.
- **Peso coin** (₱) as the in-world currency icon for savings and points.
- Bilingual microcopy is welcome (English primary, short Filipino phrases for flavor). Never put critical instructions only in Filipino.

### 2.5 What to avoid

- Real gas-station brand logos inside pixel art (Petron, Shell, and so on). Show the brand **as text** on a generic pixel station sprite instead.
- Pixel fonts for long body text, form inputs, or small numbers below 14 px.
- Blurry, non-integer-scaled pixel art, or mixing pixel densities on one screen (one art-pixel size per layer).
- Dark-pattern gamification: no streak guilt, no loot boxes, no pay-to-win. Rewards only for useful contributions.
- Visual noise over the map. The map is the core tool and must stay readable.

---

## 3. Information architecture and navigation

### 3.1 App shell

```
App boot
 └─ Auth gate (Firebase session check)
     ├─ Signed out → Auth screen (Login / Sign up)
     └─ Signed in  → Bottom tab bar ("hotbar")
          ├─ [1] Home      (/)         Live Price Map + Smart Route   [DEMO]
          ├─ [2] List      (/list)     Searchable price list          [DEMO]
          ├─ [+] Scan      (/add)      Raised center button → Scan flow [DEMO]
          └─ [3] Profile   (/profile)  Contributor profile            [DEMO]
               ├─ Badges / Achievements    [NEXT]
               ├─ Saved Locations          [FUTURE]
               ├─ Price Alerts             [FUTURE]
               ├─ Notifications            [FUTURE]
               ├─ Settings                 [FUTURE]
               ├─ Help & Support           [FUTURE]
               └─ About GasUp365           [NEXT]
```

- The tab bar has **4 slots + a raised center Scan button** (currently orange, circular, 64 px, labelled "Add"). Restyle it as a **game hotbar**: each tab is an item slot, the active slot has a glowing frame, and the Scan button is a larger "action" slot with a pixel camera icon that rises above the bar.
- A hidden legacy route `/map` (an older map dashboard) is being **merged into Home**. Design only one map screen (Home) with all its features (section 6.3).
- Overlays: the station detail **bottom sheet**, the reward popup, toasts, and dialogs.

### 3.2 Global elements

| Element | Purpose |
| :--- | :--- |
| **Status chip: Offline** | Shown when there is no connection. The app keeps showing the last-known prices. [NEXT] |
| **Toast** | Short confirmation or error (for example "Price shared! +10 coins"). Needed because web has no native alert dialogs. |
| **Dialog** | Permission explanations, confirmations, errors that need action. |
| **Bottom sheet** | Station detail over the map. |

---

## 4. Design tokens (proposed starting point)

The current theme (`src/theme/colors.ts`) is orange-based. Keep orange as the brand primary and extend it into a pixel palette taken from the logo. Claude Design may refine the hex values, but must keep the **names** and meet the **contrast rules** (section 4.6).

### 4.1 Color: brand and UI

| Token | Current value | Proposed role in pixel theme |
| :--- | :--- | :--- |
| `primary` | `#F97316` | Brand orange: main buttons, active hotbar slot, Scan button |
| `primaryDark` | `#C2410C` | Button bottom shade, pressed state |
| `primarySoft` | `#FFF1E7` | Soft panel fills, chips |
| `background` | `#FFFDF9` | App background (cream, like parchment) |
| `card` | `#FFFFFF` | Panel/card fill |
| `text` | `#1F2933` | Primary text |
| `muted` | `#7C8794` | Secondary text |
| `border` | `#F0E5DA` | Soft dividers inside panels |
| `accent` | `#F8F2EC` | Inactive chip fill |
| `destructive` | `#DC2626` | Errors, sign out, report |
| `success` | `#15803D` | Savings, "fresh", success |

**New tokens to add** (names fixed, values proposed):

| Token | Proposed | Role |
| :--- | :--- | :--- |
| `outline` | `#3B1A08` | The 2-px "pixel outline" around panels, buttons, sprites (dark brown from the logo outline) |
| `highlight` | `#FFD54A` | Top bevel highlight, logo-yellow sparkle, coin color |
| `shade` | `#7A2E0B` | Bottom bevel/drop-shadow on orange elements |
| `sky` / `skyDeep` | `#8FD3FF` / `#4A90E2` | Parallax sky gradient |
| `grass` / `grassDark` | `#6CCB5F` / `#3E8E41` | Ground layer, positive accents |
| `night` | `#1B1F3B` | Dark mode / night sky base |
| `fuelDiesel` | `#F5B700` (amber) + drop icon | Diesel identity |
| `fuelUnleaded` | `#2FA84F` (green) + leaf/drop icon | Unleaded identity |
| `fuelPremium` | `#D7263D` (red) + star/flame icon | Premium identity |
| `fresh` / `aging` / `stale` | green / amber / grey | Price freshness (section 5.9) |

> Fuel colors are a **proposal**. They must pass contrast against `card` when used with dark text or an outline, and must always be paired with an icon and a label.

### 4.2 Typography

| Role | Font (Google Fonts, OFL) | Use | Min size |
| :--- | :--- | :--- | :--- |
| **Display / pixel** | **Pixelify Sans** (600–700) | Screen titles, big prices, coin counts, button labels, badges | 16 px (prices 28–40 px) |
| **Micro pixel** | **Silkscreen** (400) | Tiny uppercase tags: "SMART ROUTE", "LIVE", "NEW", tab labels | 10 px, uppercase only |
| **Body** | **Nunito** or **Nunito Sans** (600–800) | Addresses, descriptions, form inputs, helper text, errors | 13 px |

- **Numbers**: prices use Pixelify Sans with tabular spacing. Format as `₱62.50`, always 2 decimals, peso sign attached.
- No pixel fonts inside text inputs (accessibility and OCR-edit clarity).
- The logo stays an image, never re-typeset.

### 4.3 Pixel grid and spacing

- **Layout spacing**: 4-px base grid (4, 8, 12, 16, 24, 32). Screen side gutter: 16 px.
- **Art pixel size**: UI chrome (borders, bevels, notched corners) uses **1 art pixel = 2 px**. Sprites and icons are drawn on **16×16 or 32×32 grids** and displayed only at integer scales (×2, ×3, ×4).
- **Touch targets**: minimum 44 × 44 px, including small pixel icons.

### 4.4 The pixel panel (core visual primitive)

Every card, sheet, input, chip, and button is built from one primitive:

```
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄          • 2-px outline (token: outline)
█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█         • 1 art-px notched corners (cut corner, no rounded radius)
█░ fill (card)      ░█        • top/left inner highlight (lighter fill, 2 px)
█░                  ░█        • bottom/right inner shade (darker fill, 2 px)
█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█         • hard drop shadow: 4 px down, 0 blur (token: outline at ~35%)
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

Variants: **Panel** (cream/white), **Primary button** (orange), **Secondary button** (cream), **Danger button** (red), **Slot** (inset/sunken, for prices and hotbar), **Sheet** (panel with a pixel grab-handle).

### 4.5 Motion

| Token | Value | Use |
| :--- | :--- | :--- |
| `press` | 80 ms, element moves down 2–4 px and its shadow collapses | All buttons. The "block press" feel. |
| `pop` | 180 ms scale 0.8 → 1.05 → 1 | Reward popups, badges, "+10" coins |
| `sheet` | 240 ms ease-out | Bottom sheet up/down |
| `idle` | Sprite frame loops at 6–8 fps (stepped, not tweened) | Pump light blink, coin spin, clouds |
| `parallax` | Slow 20–60 s horizontal loops | Auth/header backgrounds |

Honor **Reduce Motion**: no parallax, no idle loops, popups fade in.

### 4.6 Accessibility rules

- Text contrast ≥ 4.5:1 (≥ 3:1 for text ≥ 24 px). Prices on any background ≥ 7:1.
- Fuel type and freshness are never shown by color alone. Always add an icon and/or text.
- Screen-reader labels on all icon-only buttons (for example "Navigate to Petron Kalibo with Google Maps").
- Supports system font scaling up to 130% without clipping prices.

### 4.7 Dark mode / "Night shift" [FUTURE]

Optional. Many drivers work at night. Night sky parallax, `night` background, lit-window rooftops, and a glowing pump-light accent. Design one Home screen in night mode as an exploration only.

---

## 5. Component library

Design each component in **default, pressed, disabled, loading, and error** states where they apply.

| # | Component | Description and states |
| :--- | :--- | :--- |
| 5.1 | **Pixel Button** | Primary / Secondary / Danger / Ghost. Optional leading pixel icon. Loading state replaces the label with a 3-frame pixel spinner (rotating gear or bouncing fuel drop). |
| 5.2 | **Hotbar Tab Bar** | 4 slots + a raised center Scan slot. Active slot: glowing outline and a small selection arrow. Labels in Silkscreen. Must sit above the system home indicator safe area. |
| 5.3 | **Fuel Hotbar (filter)** | 3 item slots: Diesel / Unleaded / Premium, each with its fuel icon and color. Selected slot is raised and outlined. Used on Home and List. |
| 5.4 | **Sort Toggle** | Segmented pixel control: **Smart** · **Nearest** · **Cheapest**. |
| 5.5 | **Search Field** | Pixel panel input, magnifier icon, body font, clear (×) button. |
| 5.6 | **Map Marker Pins** | Pixel signpost/pump sprites. Variants: (a) **seed/prototype station**, (b) **community update** (live, from scans), (c) **Smart Route best pick** (gold crown or star, gentle bounce), (d) **selected**, (e) **stale** (greyed) [NEXT], (f) **user location**: a pixel jeepney or a pulsing blue dot. Optional price label bubble above the pin showing the selected fuel price, for example `₱61.90`. |
| 5.7 | **Smart Route Banner** | Panel at the top of Home: tag "SMART ROUTE · DIESEL", station name, "Save ₱42 net after travel cost", small ₱ coin sprite. Tap opens that station's sheet. |
| 5.8 | **Metric Strip** | 3 stat slots: **Stations live**, **Lowest ⟨fuel⟩ price**, **Best net save**. Looks like a game HUD. |
| 5.9 | **Freshness Bar** | A 5-segment pixel bar plus text ("Updated 5 min ago"). Fresh (< 1 h) = full green, aging (1–24 h) = amber, stale (> 24 h) = grey with a "may be outdated" tag. Exact thresholds go in FEAT-005; design with these placeholders. |
| 5.10 | **Station Card** (list item) | Station name (pixel font), address (body), distance ("0.7 km away"), three **price slots** (Diesel / Unleaded / Premium), the selected fuel's slot highlighted, **savings panel** ("₱42.10 net pesos saved", "₱58.00 fuel savings − ₱15.90 travel cost"), freshness bar, source tag ("Community" or "Prototype"), **Navigate** button. Variants: best pick (ribbon "BEST NET SAVE"), missing price for a fuel (slot shows "—" with "No price yet"), has photo (thumbnail). |
| 5.11 | **Station Detail Sheet** | Bottom sheet from a map pin. Contains everything in the Station Card plus a **photo evidence** frame (Cloudinary image, tap for full screen), a "Reported by ⟨name⟩" line [NEXT], a savings breakdown tooltip, a big **Navigate (Google Maps)** button, a close (×) control, and trust actions **"Still accurate 👍" / "Report outdated"** [FUTURE]. |
| 5.12 | **Price Slot** | Inset item-slot frame: fuel icon, label, big price. States: normal, highlighted (selected fuel), missing ("—"), edited-by-user (small pencil mark, used in the Scan review). |
| 5.13 | **Form Field** | Label (Silkscreen), input (Nunito), helper/error text. States: empty, filled, **auto-filled by OCR** (sparkle icon + "Detected"), **needs review** (amber outline + "Please verify"), error (red). Numeric keyboard for prices. |
| 5.14 | **Camera Viewfinder Frame** | Pixel corner brackets over the live camera, a hint ("Fit the whole price board in the frame"), and a scanning animation (pixel scan line sweeping down). |
| 5.15 | **Reward Popup** | Center modal: coin burst sprite, "+10", "Price shared!", a progress bar toward the next rank, and a "Nice!" button. Variants: points only, **rank up**, **badge unlocked** (badge sprite plus festival confetti). |
| 5.16 | **Badge** | 32×32 pixel emblem in a frame. States: locked (silhouette + "???"), unlocked, new (sparkle). |
| 5.17 | **XP / Rank Bar** | Health-bar style progress with a current rank icon and the next rank name. |
| 5.18 | **Toast** | Small pixel panel sliding from the top: success (green check), error (red !), info (blue i). |
| 5.19 | **Dialog** | Pixel panel modal, title, body, 1–2 buttons. Used for permissions and confirmations. |
| 5.20 | **Empty / Error / Offline Illustration** | Small pixel scenes (section 7) with a title, one line of body, and an action button. |
| 5.21 | **Loading Skeleton** | Pixel "shimmer" blocks for the list and sheet. Map loading shows a pixel jeepney driving across a road with "Loading live map…". |
| 5.22 | **Avatar** | Pixel character bust (driver with cap) or vehicle sprite, framed. [DEMO]: one default avatar. [NEXT]: choose a vehicle. |

---

## 6. Screens

Each screen lists: **Purpose**, **Content and data**, **Actions**, **States** (all required unless marked), and **Pixel treatment**.

### 6.1 Splash / Boot [DEMO]

- **Purpose**: shown while the app checks whether the user is signed in (currently a plain spinner).
- **Content**: logo centered over the parallax sky, a pixel fuel drop or jeepney idle animation, and "Loading…" in Silkscreen.
- **Native splash** (before JS loads) is a static image on brand orange `#F97316`. Design a matching 1:1 icon image that hands over seamlessly to this screen.
- **States**: loading only (under 2 s typical).

### 6.2 Auth: Login / Sign up [DEMO]

- **Purpose**: email/password account (Firebase Auth). An account is required so contributions can be credited and abuse can be limited.
- **Content**:
  - Parallax Kalibo backdrop (sky, hills, rooftops, a road with a jeepney slowly driving by).
  - Logo plus tagline "Find better fuel stops, faster."
  - Form panel with a segmented toggle **Login | Sign up**.
  - Login title "Welcome back", subtitle "Sign in to continue."
  - Sign-up title "Create your account", subtitle "Track fuel prices in one place."
  - Fields: **Full name** (sign up only), **Email address**, **Password** (min 6 characters).
  - Primary button: **Login →** / **Create account →**.
  - Switch link: "New here? Sign up" / "Already have an account? Login".
- **Validation and errors** (current copy, keep it friendly):
  - Submit stays disabled until email is filled and password is ≥ 6 characters (+ name for sign up).
  - "Email or password is incorrect."
  - "Use at least 6 characters for your password."
  - Email already in use, invalid email, and network error messages.
- **States**: default, typing, submit disabled, submitting (button spinner), error message, keyboard open (form must stay visible), and **first-time sign-up success** (optional: a short "Welcome, ⟨name⟩! You're a Rookie Spotter" reward popup) [NEXT].
- **Pixel treatment**: the strongest "game title screen" moment in the app. The form panel should feel like a game menu window.

### 6.3 Home: Live Price Map [DEMO]

- **Purpose**: the main tool. See every known station around you with live prices, and see the single best station for your fuel type at a glance.
- **Content and data**:
  - **Full-screen map** (Leaflet + OpenStreetMap tiles), centered on Kalibo (11.7089, 122.364), zoom ≈ 13, with the user's GPS position.
  - **Header HUD** (floating panel at the top): logo (small), title "Live Price Map", and a **station count** badge.
  - **Fuel hotbar** (Diesel / Unleaded / Premium). Changes the prices shown on pins and the smart route pick. *(Being merged in from the old `/map` screen.)*
  - **Smart Route banner**: best station for the selected fuel ("Smart diesel route · Petron – Kalibo · Net savings ₱42 after estimated travel cost").
  - **Metric strip** (optional on Home if space allows; required on web): Stations live · Lowest price · Best net save.
  - **Markers**: two sources merged.
    1. **Seed stations** (4 prototype Kalibo stations: Petron – Kalibo, Shell – Kalibo Crossing, Caltex – Andagao, Phoenix – Estancia).
    2. **Community updates** from scans (live, real-time).
  - **Floating "Scan Price" button** (bottom right) as a shortcut to the scan flow.
  - Tapping a pin opens the **Station Detail Sheet** (5.11).
- **Actions**: pan/zoom the map; switch fuel; tap a pin to open the sheet, then **Navigate** (opens Google Maps driving directions); tap the smart route banner to open that station's sheet; tap Scan Price.
- **States**:
  - Loading map (pixel jeepney loader, "Loading live map…").
  - Loading live markers (count badge shows a spinner; seed stations show at once).
  - Location permission denied: a small notice "Location off: showing Kalibo center. Distances are estimates." with an "Enable" action.
  - Map failed to load: "Unable to load map" plus Retry.
  - Live data unavailable or permission-denied from the server: the app silently falls back to seed stations. Show a small "Showing saved stations" info chip.
  - Offline [NEXT]: "Offline: prices may be outdated" chip, last-known data stays visible.
  - No station has a price for the selected fuel: the banner reads "No ⟨fuel⟩ prices yet. Be the first to scan!" with a Scan action.
  - Pin selected (sheet open).
- **Pixel treatment**: the map stays a clean real map (tiles are not pixel art), framed by pixel UI. A warm, slightly saturated tint over the tiles is allowed. Pins, HUD, and sheet are fully pixel. The best-pick pin gets a gentle bobbing crown.

### 6.4 Station Detail Sheet [DEMO]

- **Purpose**: everything needed to decide "go here or not", plus proof the price is real.
- **Content**:
  - Station name, address, source tag (Community / Prototype), and distance.
  - Three price slots, with the selected fuel highlighted.
  - **Route score breakdown**: net pesos saved (big, green), "₱X fuel savings − ₱Y travel cost", and a small "How is this calculated?" info tooltip (section 10.1).
  - "Smart Route" badge if this is the best pick.
  - Freshness ("Updated 5 min ago" + bar).
  - **Photo evidence**: the price-board photo uploaded with the update (tap for full screen with pinch-zoom). If there's no photo, a pixel placeholder card "No photo, entered manually". [NEXT]
  - Contributor line: "Shared by ⟨displayName⟩" [NEXT].
  - **Navigate** primary button (Google Maps).
  - [FUTURE] trust actions: "Still accurate" (+1) / "Report outdated", with a count.
- **States**: collapsed peek (name + selected price + Navigate), expanded, photo loading, photo failed, missing prices ("—"), stale price warning.

### 6.5 List: Live Price List [DEMO]

- **Purpose**: compare every station side by side and sort by what matters right now.
- **Content**:
  - Header: title "Live Price List", subtitle "Sorted by price, distance, or net pesos saved", search field "Search gas stations…".
  - Fuel hotbar (Diesel / Unleaded / Premium).
  - Sort toggle: **Smart** (highest net savings, the default) · **Nearest** · **Cheapest**.
  - Scrolling list of **Station Cards** (5.10). The first card in Smart sort gets the **"BEST NET SAVE"** ribbon.
  - Includes community-scanned stations, not only seed stations. *(FEAT-001: currently only the 4 seed stations appear.)*
- **Actions**: search by station name; switch fuel; switch sort; tap **Navigate** on a card; tap a card to open the Station Detail Sheet (or show its location on Home).
- **States**: loading (skeleton cards); results; **no search results** ("No stations match '⟨query⟩'"); **no stations at all** (empty-state illustration + "Scan the first price board in your area" + Scan button); stations missing the selected fuel price (shown last, price slot "—", excluded from Smart ranking); offline [NEXT].
- **Pixel treatment**: cards stack like inventory rows. The best card has a glowing gold frame and ribbon.

### 6.6 Scan Flow: Add Station Update [DEMO]

The flow behind the center **Scan** hotbar button and the Home "Scan Price" button. Present it as one screen with stages (the current implementation is one scrolling screen). A stepper is welcome: **① Snap → ② Review → ③ Share**.

**Header**: "Add Station Update". Subtitle: "Scan a fuel board, review OCR + NLP results, then save to the live map."

#### 6.6.1 Stage ①: Snap

- **Camera permission not granted**: pixel camera illustration, "Enable camera", "Take a photo and extract fuel prices with on-device OCR." Button **Enable camera**.
- **Permission denied permanently**: explain how to enable it in Settings and offer **manual entry** instead.
- **Camera live**: viewfinder (5.14) at 4:3, hint text, and a big **Scan** button (pixel lightning/zap icon).
- **Scanning**: scan-line animation, then "Reading the price board…". Steps: capture photo, then get GPS, then OCR, then parse.
- **Web build**: camera OCR doesn't run on web. Show a "Mobile OCR only" panel (pixel phone illustration, "Camera OCR is not available on web. Please use the mobile app.") and go **straight to manual entry**.

#### 6.6.2 Stage ②: Review

- **OCR summary banner**: "Found unleaded, special, diesel. Ready to save." or "Found diesel. 3 item(s) need review." or "No fuel prices found".
- **Review notice**: "Please fill or verify: station name, address, GPS location, unleaded price…" (lists only the missing items).
- **Form fields** (each shows *Detected* (auto-filled) vs *Needs review* (missing)):
  - **Station Name** (placeholder "e.g. Petron Kalibo"). The parser recognizes ~14 Philippine brands (Petron, Shell, Caltex, Phoenix, Total, SeaOil, Uno, Flying V, PTT, Cleanfuel, Jetti, Unioil, RePhil, Petro Gazz).
  - **Location / address** (placeholder "Roxas Avenue, Kalibo, Aklan").
  - **GPS**: a small "📍 Location captured" chip, or "Location needed" with an Enable action. [NEXT: a tiny map preview of the pin]
  - **Diesel**, **Unleaded**, **Special / Premium** prices (₱, numeric, placeholders 62.50 / 65.20 / 75.80). At least **one** price is required.
  - **Raw OCR Text** (collapsible "Show what the camera read"), monospace or pixel-micro, selectable.
- **Photo thumbnail** of the captured board, with a **Retake** button.
- **Primary action**: **Save Live Map Marker** (rename in the design to **"Share Price"** or similar game-flavored but clear copy).

#### 6.6.3 Stage ③: Share (submit)

- **Progress**: "Uploading photo…", then "Saving to live map…". Pixel progress bar.
- **Success**: **Reward popup** (5.15): "+10 coins · Price shared! Drivers near Kalibo can now see this." Then return to Home with the new pin dropping in (a pixel "drop + dust puff" animation).
- **Errors** (must be in-app toasts or dialogs; native alerts don't show on web):
  - "Location needed: allow location access so GasUp365 can place this marker on the map."
  - "Fuel price needed: scan the price board or enter at least one fuel price before saving."
  - "Unable to scan text: you can still enter the values manually."
  - "Camera not ready: please wait for the camera preview, then try again."
  - Photo upload failed ("Cloudinary upload failed…"): offer **Retry** or **Save without photo**.
  - Generic save failure: "Unable to save. Please try again."

- **Points/coins economy (proposed, finalized in FEAT-003)**: +10 coins per shared update, +5 bonus with a photo, +5 for the first update at a new station. Show these values as placeholders.

### 6.7 Profile: Contributor Card [DEMO]

- **Purpose**: show the user's identity and impact, and make contributing feel rewarding. This is the main gamification surface.
- **Content**:
  - **Hero header**: parallax mini-scene, pixel avatar (5.22), **display name** (from the account, fallback "GasUp365 Driver"), and **rank title** (currently "Community Member"; proposed ranks below).
  - **XP / Rank bar** toward the next rank. [NEXT]
  - **Stats slots** (3): **Updates** (prices shared), **Coins/Points**, **Trust rating** (currently hardcoded 24 / 156 / 4.8; real data in FEAT-003).
  - **Community Impact panel**: "Your contributions have helped **1,234 drivers** save money this month!" (placeholder number; design it as a stat).
  - **Badges shelf** (horizontal scroll, locked/unlocked) [NEXT].
  - **Menu** (pixel list rows with icons): Saved Locations (badge "3"), Notifications, Price Alerts, Settings, Help & Support, About GasUp365, **Sign out** (danger).
  - Footer: "GasUp365 v1.0.0 · Empowering Filipino drivers, one update at a time".
- **Proposed ranks** (Len to approve in FEAT-003): Rookie Spotter (0) → Pump Scout (5 updates) → Price Ranger (20) → Fuel Guardian (50) → Kalibo Legend (100).
- **Proposed badges**: First Scan, Photo Pro (10 photo updates), Early Bird (update before 7 AM), Night Owl (after 9 PM), Diesel Hunter / Unleaded Hunter / Premium Hunter, Station Explorer (5 different stations), Ati-Atihan Hero (festival-week contributor, seasonal).
- **States**: loading stats (skeleton), new user (zeros + "Share your first price to earn your first badge!"), signing out (confirm dialog [NEXT]).

### 6.8 Badges / Achievements [NEXT]

Grid of all badges (locked as silhouettes), with tap-for-detail: how to earn it, date earned, and a rarity frame color.

### 6.9 About GasUp365 [NEXT]

Mission (the problem in section 1), how Smart Route works (section 10.1), team/guild credit, version, a data note ("Prices are community-reported; always confirm at the pump"), and credits (OpenStreetMap contributors, open-source licenses).

### 6.10 Price Alerts [FUTURE]

Purpose: notify when a fuel type in the user's area drops below a budget. UI: choose fuel, set a ₱ threshold with a stepper/slider, choose radius (1 / 5 / 10 km), on/off toggle per alert, empty state.

### 6.11 Saved Locations [FUTURE]

Favorite stations or areas (home, terminal, route). A list of saved spots with their current best price.

### 6.12 Notifications [FUTURE]

Inbox: price-drop alerts, "your update helped 12 drivers", badge unlocks, "a price you shared was confirmed".

### 6.13 Settings [FUTURE]

Default fuel type, vehicle type and fuel efficiency (km/L, default 12; used by Smart Route), fill amount (liters, default 20), search radius, units, theme (Day / Night / System), reduce motion, language (English / Filipino), and account (change name, sign out).

### 6.14 National / Regional Price Dashboard [FUTURE]

Average current prices per fuel (regular, premium, diesel), area average vs national, a simple trend sparkline (pixel bar chart), and the cheapest stations in the area.

### 6.15 Help & Support [FUTURE]

FAQ (How do I scan? Why is my price "stale"? How are coins earned?), a report-a-problem form, and contact.

---

## 7. Pixel asset list

| Asset | Grid | Frames | Notes |
| :--- | :--- | :--- | :--- |
| Parallax layers: sky, far hills/sea, Kalibo town (rooftops, palms, church), road | 320 px wide, tileable | static | Day set required. Night set [FUTURE]. |
| Jeepney sprite (hero) | 32×16 | 4 (drive) | Loader, auth scene, avatar option |
| Tricycle, motorcycle, car | 32×16 | 2–4 | Avatar options, decoration |
| Generic gas station building | 48×32 | 2 (sign light blink) | Brand as text, never logos |
| Fuel pump | 16×16 | 2 | Pins, empty states |
| Map pins: station, community, best-pick (crown), selected, stale, user | 16×24 | 1–2 | Bottom-center anchor |
| Fuel icons: diesel, unleaded, premium | 16×16 | static | Distinct shapes, not only colors |
| UI icons (replace Feather): map, list, camera, user, search, navigate, close, clock, filter, zap/scan, award, star, bell, settings, help, info, log-out, map-pin, trending-down, check, warning, edit, photo, wifi-off | 16×16 | static | One consistent outline style |
| Peso coin | 16×16 | 6 (spin) | Points, savings |
| Coin burst / sparkle / dust puff | 32×32 | 6 | Reward and pin-drop effects |
| Festival confetti (Ati-Atihan colors) | 8×8 particles | 4 | Rank-up and badge unlock only |
| Badges (×10) | 32×32 | static + locked variant | Section 6.7 |
| Avatar busts | 32×32 | 2 (blink) | Default driver + variants |
| Empty-state scenes: no stations, no results, offline (cloud with plug), error (broken pump), web-only OCR (phone) | 96×64 | static or 2 | |
| App icon / splash | 1024 px export from a 32×32 master | static | Must match the existing logo palette |

**Export**: PNG at @1x/@2x/@3x (integer scaled, no smoothing), plus sprite sheets for animations. Simple icons may also be exported as rect-based SVG.

---

## 8. Build constraints (so designs can ship in Expo SDK 55 / React Native)

| Topic | Constraint |
| :--- | :--- |
| Platforms | Android (primary audience), iOS, and Web (exhibit laptop). Camera OCR is **mobile only**. |
| Screen base | 390 × 844. Must also work at 360 × 640 (small Android) without clipping prices or buttons. |
| Map | Leaflet in a WebView (mobile) and in the DOM (web), with OpenStreetMap tiles. **Tiles can't be restyled into pixel art.** Pixel styling applies to pins (image icons), popups, and the UI around the map. A CSS tint/saturation filter on tiles is possible. Required attribution: "© OpenStreetMap contributors". |
| Pixel crispness | Ship assets pre-scaled at integer sizes. Web can use `image-rendering: pixelated`. Avoid relying on runtime upscaling. |
| Panels and borders | Build with nested Views, solid borders, and hard `boxShadow` (0 blur), or 9-slice PNG frames. No CSS `border-image`. Notched corners: max 1 art-pixel notch. |
| Fonts | Google Fonts loaded through `expo-font`. Max 3 families (section 4.2). |
| Motion | `react-native-reanimated` is available. Sprite animations via sprite sheets. Keep animations off the map layer for performance. |
| Navigation | Bottom tabs (Expo Router). Bottom sheet over the map. Google Maps opens externally for directions. |
| Alerts | Native alert dialogs don't render on web, so **all feedback must use in-app toast/dialog components**. |
| Images | Station photos are remote (Cloudinary URLs). Design loading and failed states. |
| Performance | Target older Android phones: avoid full-screen blur, large animated backgrounds behind scrolling lists, and huge sprite sheets. |

---

## 9. Exhibit demo storyboard [DEMO]

Prototype this as a clickable flow. It is the 60-second booth walkthrough.

1. **Title screen**: the Auth screen with the parallax Kalibo scene and a jeepney driving by. Visitor taps **Login**.
2. **Live map**: Home with pixel pins over Kalibo and the Smart Route banner: "Petron – Kalibo · Save ₱42 net after travel cost". The Diesel slot is active in the fuel hotbar.
3. **Station sheet**: tap the crown pin, the sheet slides up: prices, net savings breakdown, freshness "Live now", **Navigate** button.
4. **Scan**: tap the center Scan slot, viewfinder, scan-line animation, fields pop in marked "Detected".
5. **Share + reward**: tap **Share Price**, coin burst "+10 coins · Price shared!", XP bar fills, and the **Pump Scout** rank-up appears with confetti.
6. **Back to the map**: the new pin drops onto the map with a dust puff. The List tab shows it ranked by net savings.

---

## 10. Reference: logic the UI must explain

### 10.1 Smart Route (how "net pesos saved" works)

For the selected fuel type:

- **Area average price** = average price of that fuel across listed stations.
- **Fuel savings** = max(0, (area average − station price) × **20 L** fill).
- **Travel cost** = (distance × 2 for the round trip ÷ **12 km/L**) × station price.
- **Net pesos saved** = fuel savings − travel cost. It can be negative: a "cheap" station that's too far away isn't worth it.
- **Best pick** = highest net saved (ties go to the nearer station).

UI copy for the info tooltip: *"We compare each station's price with the area average for a 20-liter fill, then subtract the fuel you'd burn driving there and back (12 km/L). The highest number is your Smart Route."*

Design tip: show a negative net saving honestly (for example "−₱5: too far to be worth it") in muted red, never hidden.

### 10.2 Data shown per station

| Field | Example | Notes |
| :--- | :--- | :--- |
| Name | Petron – Kalibo | From OCR or typed |
| Address | Roxas Avenue, Kalibo, Aklan | From OCR or typed |
| Distance | 0.7 km | From the user's GPS (estimated if location is off) |
| Prices | Diesel ₱61.90 · Unleaded ₱64.80 · Premium ₱73.60 | Any can be missing on community updates |
| Last updated | "Live now", "3 min ago" | Freshness bar |
| Source | Prototype (seed) / Community (scan) | Tag |
| Photo | Price-board image | Community updates with a photo |
| Trust score | 0–100 | [FUTURE] trust UI |

---

## 11. Feature inventory (status vs. design need)

| Feature | Purpose | Status in code (2026-10-21) | Tag |
| :--- | :--- | :--- | :--- |
| Email login / sign up | Identify contributors | Built | [DEMO] |
| Auth-gated tab shell | Protect the app, simple navigation | Built (Home, List, Add, Profile + hidden /map) | [DEMO] |
| Live map with GPS dot | See stations around you | Built (Leaflet, mobile + web) | [DEMO] |
| Community markers in real time | Fresh crowd-sourced data | Built, but prices aren't carried to the map/list yet (FEAT-001) | [DEMO] |
| Smart Route best pick | Answer "where should I fuel up?" | Built (diesel only on Home; per fuel on List) | [DEMO] |
| Fuel filter on map | Compare by fuel type | Only on the hidden /map; merge into Home (FEAT-002) | [DEMO] |
| Station detail with Navigate | Decide and go | Partial (List cards; Home pins are basic) | [DEMO] |
| Searchable, sortable price list | Side-by-side comparison | Built (seed stations only so far) | [DEMO] |
| Camera scan + OCR + parser | Effortless contribution | Built (mobile) | [DEMO] |
| Manual review/correct | Accuracy | Built | [DEMO] |
| Photo evidence upload | Trust and proof | Upload built, not displayed yet (FEAT-002) | [DEMO] |
| Profile with stats | Motivation, identity | UI built with placeholder numbers (FEAT-003) | [DEMO] |
| Points, ranks, badges | Gamified contribution | Points field exists, not wired (FEAT-003) | [NEXT] |
| Freshness indicators, stale dimming | Data trust | Planned (FEAT-005) | [NEXT] |
| Offline mode (last-synced prices) | Poor data connections | Planned | [NEXT] |
| Upvote "still accurate" / report outdated | Community trust | Planned | [FUTURE] |
| Price drop alerts | Save without checking | Planned | [FUTURE] |
| Saved locations | Faster repeat use | Menu item only | [FUTURE] |
| Radius filter (1/5/10 km) | Focus nearby | Planned | [FUTURE] |
| National/regional price dashboard | Context, policy value | Planned | [FUTURE] |
| Night mode | Night-shift drivers | Idea | [FUTURE] |

---

## 12. Open questions for Len

1. **Coins vs points naming**: should the currency be shown as "coins" (game feel) or "points" (current data field `points`)? *Proposed: show "coins" in the UI, keep `points` in data.*
2. **Rank names and thresholds** (section 6.7): approve or rename.
3. **Fuel colors** (section 4.1): do Kalibo drivers associate specific colors with diesel/unleaded/premium? If yes, match them.
4. **Avatar choice at sign-up** (vehicle picker): demo scope or [NEXT]?
5. **Language**: English-first with Filipino flavor (proposed), or a full Filipino toggle?

## Approval

- **Len's approval**: *Pending chat review of Revision 1.*
