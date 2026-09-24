# KisanConnect Frontend (React 19 + Vite 8 + MUI v9 + Tailwind CSS v4)

This directory contains the user interface for **KisanConnect**, an eNAM-inspired digital agricultural marketplace (mandi) platform.

---

## 1. Tech Stack Overview

- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tooling & Server**: Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Routing**: React Router v7 (`react-router-dom`)
- **UI Component Library**: Material UI v9 (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)
- **Utility Styling**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`)
- **Language**: JavaScript / JSX + TypeScript support
- **Formatting**: `oxfmt`

---

## 2. Directory Structure

```
frontend/
├── src/
│   ├── api/                     # Axios/Fetch API integration functions
│   ├── components/              # Shared UI components
│   │   ├── BalveerFAB.jsx       # Voice / AI assistant FAB launcher
│   │   ├── BigStepper.jsx       # Multi-step flow progress stepper
│   │   ├── EmptyState.jsx       # Empty state display component
│   │   ├── OfflineBanner.jsx    # Connectivity alert banner
│   │   ├── PriceChip.jsx        # Price tag display component
│   │   ├── StatusPill.jsx       # Lot & trade status badges
│   │   ├── TopBar.jsx           # App top bar navigation header
│   │   ├── TrustMeter.jsx       # Buyer/Trader trust score meter
│   │   └── VerifiedBadge.jsx    # User verification status badge
│   ├── contexts/                # Global React contexts
│   │   ├── AuthContext.jsx      # Authentication & token session context
│   │   └── LanguageContext.jsx  # Multilingual support context
│   ├── imports/                 # OpenAPI specification & prompt reference files
│   ├── screens/                 # Role-specific application views
│   │   ├── admin/               # APMC Market Admin dashboards & controls
│   │   ├── agent/               # Commission Agent workflow screens
│   │   ├── buyer/               # Buyer / Trader market screens & deal rooms
│   │   ├── farmer/              # Farmer screens (today, radar, selling, my lots, deals, money, services)
│   │   ├── onboarding/          # Auth, OTP, language selection, and setup flow
│   │   └── provider/            # Service Provider (Quality/Assayer, Logistics, Warehouse) screens
│   ├── utils/                   # Shared utility & helper functions (e.g. format.js)
│   ├── App.jsx                  # Main application component with route definitions & theme/context providers
│   ├── main.jsx                 # React DOM mount entrypoint
│   ├── index.css                # Global CSS & Tailwind CSS v4 entry point (`@import 'tailwindcss';`)
│   └── theme.js                 # Custom Material UI theme configuration
├── index.html                   # HTML entry shell
├── package.json                 # Node dependencies and scripts
├── tsconfig.json                # TypeScript compiler config
└── vite.config.ts               # Vite configuration (React, Tailwind CSS v4)
```

---

## 3. Scripts & Workflows

```bash
# Start local development server (runs at http://localhost:5173)
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview

# Format code using oxfmt
npm run format
```

---

## 4. Key Design & Development Rules

1. **Styling Integration**: MUI v9 Theme Provider (`src/theme.js`) combined with Tailwind CSS v4 utility classes.
2. **Role-Based Views**: Screens are organized under `src/screens/<role>/` (e.g., `farmer`, `buyer`, `agent`, `admin`, `provider`, `onboarding`).
3. **State & Context**: Shared user auth state and locale choices are managed via `AuthContext` and `LanguageContext`.
