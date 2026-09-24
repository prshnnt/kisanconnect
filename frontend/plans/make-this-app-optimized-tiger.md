# KisanConnect App — Implementation Plan

## Context

Build a full-featured, multi-role agricultural marketplace called **KisanConnect** in React + JSX (no TypeScript) using Material UI. The app serves 5 user roles: Farmer, Buyer, Commission Agent, Service Provider, and Admin. The design system uses a warm, trustworthy aesthetic with Turmeric/Indigo accents and dual Hindi/English content. The project is currently a blank Vite+React shell.

---

## Approach

### 1. Dependencies to Install

```
@mui/material @mui/icons-material @emotion/react @emotion/styled react-router-dom
```

No TypeScript packages needed for runtime. Keep existing devDeps (TS is fine for config files only).

### 2. File Changes

- Rename `src/App.tsx` → `src/App.jsx`
- Rename `src/main.tsx` → `src/main.jsx` (remove TS syntax `!`)
- All new components: `.jsx` extension
- `index.html` — update script src to `./src/main.jsx`
- `vite.config.ts` — stays as-is (Vite config, not app code)

### 3. Font Wiring (`src/index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
@import 'tailwindcss';
```

### 4. MUI Theme (`src/theme.js`)

Define the KisanConnect design tokens as an MUI theme:

```js
palette: {
  background: { default: '#FFFBF5', paper: '#FFFFFF' },
  primary: { main: '#F5A524' },     // Turmeric
  secondary: { main: '#3730A3' },   // Indigo
  success: { main: '#15803D' },     // Sell-now Green
  warning: { main: '#B45309' },     // Wait Amber
  info: { main: '#1D4ED8' },        // Store Blue
  error: { main: '#B91C1C' },       // Dispute Red
  text: { primary: '#1F2937', secondary: '#6B7280' }
}
typography: {
  fontFamily: '"Noto Sans", "Noto Sans Devanagari", sans-serif',
  fontSize: 18,   // Farmer app base; admin can use 14
}
components:
  MuiButton: { styleOverrides: { root: { height: 56, borderRadius: 12, minWidth: 48 } } }
  MuiCard:   { styleOverrides: { root: { borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } } }
```

---

## Project Structure

```
src/
  main.jsx              ← entry point (converted from .tsx)
  App.jsx               ← router root + ThemeProvider + LanguageContext
  theme.js              ← MUI theme definition
  index.css             ← Google Fonts @import + tailwindcss
  contexts/
    LanguageContext.jsx ← { lang, setLang } — Hindi/English toggle
    AuthContext.jsx     ← { user, role, token, login, logout }
  components/           ← shared UI atoms
    TopBar.jsx          ← language chip, help "?", bell
    BottomTabBar.jsx    ← 5 tabs; farmer labels in Hindi
    StatusPill.jsx      ← status chip with color + icon
    PriceChip.jsx       ← ₹/qtl with up/down arrow
    VerifiedBadge.jsx   ← shield icon + "Verified"
    TrustMeter.jsx      ← 5 segments + label
    BalveerFAB.jsx      ← floating Balveer button + chat panel (G1–G4)
    BigStepper.jsx      ← quantity stepper with quick-pick chips
    OfflineBanner.jsx   ← "Showing prices from 6:00 am"
    EmptyState.jsx      ← icon + message + action button
  screens/
    onboarding/
      X1Language.jsx    ← two big language tiles
      X2UserType.jsx    ← 4 role tiles + FPO switch + staff link
      X3Phone.jsx       ← OTP request
      X4OTP.jsx         ← 6-box OTP entry + timer
      X5AboutYou.jsx    ← name, password, role-specific fields
      X6HomeMandi.jsx   ← location or state/mandi picker
      X7Welcome.jsx     ← 3 first-step cards per role
      X8Login.jsx       ← phone + password + OTP option
    farmer/
      F1Today.jsx       ← greeting, best price, should-I-sell, lots, offers, money
      F2PriceRadar.jsx  ← crop picker, distance chips, mandi list
      F3PriceDetail.jsx ← 30-day chart, advice panel (SELL/WAIT/STORE)
      F4WhatSelling.jsx ← crop picture tiles + variety chips
      F5HowMuch.jsx     ← stepper + bags toggle
      F6Quality.jsx     ← grade tiles + photos + moisture
      F7Where.jsx       ← location + agent picker
      F8MinPrice.jsx    ← slider + "you will receive ₹X"
      F9HowToSell.jsx   ← offers vs bidding choice
      F10Review.jsx     ← summary + publish
      F11MyLots.jsx     ← lot cards with status
      F12Offers.jsx     ← offer cards + compare + accept/counter/decline
      F14Deals.jsx      ← In progress / Done / Problems tabs
      F15DealRoom.jsx   ← vertical timeline + step actions
      F16Money.jsx      ← to-receive total + payout list + receipt
      F17Problem.jsx    ← report type tiles + photo + voice note
      F19Services.jsx   ← Store/Move/Test/Weigh tiles
      F21FindBuyers.jsx ← demand matches for a lot
      F23Me.jsx         ← profile, bank accounts, language
    buyer/
      B1Home.jsx        ← volume-needed cards, new supply, payments, licence warning
      B2FindSupply.jsx  ← filters + result cards + map toggle
      B4PostDemand.jsx  ← demand creation form
      B5MakeOffer.jsx   ← offer form
      B8DealRoom.jsx    ← buyer-side timeline + pay now
      B9Trust.jsx       ← verified badge, licences, pays-on-time score
    agent/
      A1Today.jsx       ← lots arriving, auctions ending, commission, payouts
      A2Farmers.jsx     ← farmer list + add by phone
      A3Lots.jsx        ← lots I handle + filters
      A5Money.jsx       ← pending/paid + per-deal receipts
    provider/
      S1Jobs.jsx        ← request cards: accept/counter/decline
      S2JobProgress.jsx ← step bar + capture form by service type
      S3Services.jsx    ← register/edit service + active switch
      S4Calendar.jsx    ← week view of booked jobs
    admin/
      D1Overview.jsx    ← KPI cards + trend charts
      D2Approvals.jsx   ← tabs by role + document drawer
      D3LiveOps.jsx     ← three-lane kanban: auctions / gate exits / payouts
      D5Disputes.jsx    ← queue + SLA timers + case drawer
      D7Rules.jsx       ← fee rules table + live preview
```

---

## Routing (`src/App.jsx`)

```jsx
<Routes>
  {/* Onboarding */}
  <Route path="/" element={<X1Language />} />
  <Route path="/user-type" element={<X2UserType />} />
  <Route path="/phone" element={<X3Phone />} />
  <Route path="/otp" element={<X4OTP />} />
  <Route path="/about" element={<X5AboutYou />} />
  <Route path="/home-mandi" element={<X6HomeMandi />} />
  <Route path="/welcome" element={<X7Welcome />} />
  <Route path="/login" element={<X8Login />} />

  {/* Farmer */}
  <Route path="/farmer" element={<FarmerShell />}>
    <Route index element={<F1Today />} />
    <Route path="prices" element={<F2PriceRadar />} />
    <Route path="prices/:mandiId" element={<F3PriceDetail />} />
    <Route path="sell" element={<F4WhatSelling />} />
    ...
  </Route>

  {/* Buyer, Agent, Provider, Admin similarly nested */}
</Routes>
```

---

## Key Design Decisions

1. **Language toggle**: `LanguageContext` wraps the whole app; every label is a key from a `t(key)` helper with a flat Hindi/English object per screen.
2. **Mobile-first**: Max-width 390px container centered for mobile screens; admin uses full 1440px.
3. **Mock data**: All API calls use local mock JSON; no live network calls. Each screen has a `MOCK_*` constant at the top.
4. **BalveerFAB**: Rendered at the shell level for Farmer and Buyer, so it persists across screens.
5. **No TypeScript in .jsx files**: All prop types documented with JSDoc comments if needed; no TS annotations.
6. **Money formatting**: Utility `formatINR(n)` → "₹1,25,000" using Indian locale.
7. **Quantity**: Utility `formatQtl(n)` + bags toggle state.

---

## Implementation Order

1. **Setup**: Install deps, rename/convert entry files, wire fonts and MUI theme
2. **Shared components**: TopBar, BottomTabBar, StatusPill, PriceChip, BalveerFAB, EmptyState
3. **Onboarding screens** (X1–X8)
4. **Farmer shell + F1–F5** (Today, Price Radar, Sell flow start)
5. **Farmer F6–F13** (Quality, lot publishing, offers, bidding)
6. **Farmer F14–F23** (Deals, Money, Services, Profile)
7. **Buyer screens** (B1–B9)
8. **Agent screens** (A1–A6)
9. **Provider screens** (S1–S6)
10. **Admin screens** (D1–D8)

---

## Verification

- Open the preview in-browser; navigate the onboarding flow X1 → X8
- Switch to Farmer role and navigate F1 Today → F2 Price Radar → F3 Detail
- Verify the BalveerFAB opens and closes without covering the tab bar
- Switch language with the chip and verify labels change
- Open admin route `/admin` and verify the left nav + D1 overview loads
- Check that all `.jsx` files import from MUI (not `.tsx` or TS imports)
