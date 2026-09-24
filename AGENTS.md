# AGENTS.md — KisanConnect Project Context & Reference Guide

Welcome to **KisanConnect**! This repository is an eNAM-inspired digital agricultural marketplace (mandi) platform designed to connect farmers, FPOs, buyers/traders, commission agents, quality assessors, logistics providers, and APMC (Agricultural Produce Market Committee) administrators.

---

## 1. Project Overview & Architecture

* **Backend**: Python 3.12, FastAPI, Async SQLAlchemy 2.0, Pydantic v2, PostgreSQL 16, Celery + Redis, Alembic migrations.
* **Frontend**: React 19, Vite 8, Material UI (MUI v9), Emotion, Tailwind CSS v4, React Router v7, TypeScript, oxfmt.
* **Containerization**: Docker Compose (`db`, `redis`, `backend`, `celery_worker`, `celery_beat`, `frontend`).
* **Database Schema**: 34-table consolidated eNAM schema documented in [`schema.dbml`](file:///d:/Workspace/KisanConnect/schema.dbml).

---

## 2. Directory Structure & File Map

```
KisanConnect/
├── AGENTS.md                        # This project knowledge base
├── schema.dbml                      # Complete 34-table DBML database specification
├── docker-compose.yml               # Multi-container orchestration (Postgres, Redis, API, Celery, Frontend)
├── .env.example                     # Environment variables template
├── .agents/                         # Agent rules and workflows
│   ├── rules/
│   │   ├── git-workflow.md          # Git commit conventions rule
│   │   └── verification-workflow.md # Fast token-efficient verification rule
│   └── skills/
│       ├── git-commit/              # Commit automation skill (scripts/commit.py)
│       └── verify/                  # Code verification skill (scripts/verify.py)
├── backend/                         # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/                  # Thin FastAPI routers (1 file per domain)
│   │   ├── core/                    # Config, security, errors, pagination, CORS
│   │   ├── db/                      # Async SQLAlchemy session management
│   │   ├── models/                  # SQLAlchemy 2.0 ORM models (34 tables)
│   │   ├── schemas/                 # Pydantic request/response validation schemas
│   │   ├── services/                # Business logic layer (routers contain NO business logic)
│   │   └── tasks/                   # Celery background tasks (auction sweep, auto-declare, expiry)
│   ├── alembic/                     # Database migrations
│   ├── scripts/                     # Backend seeding (`seed.py`)
│   └── pyproject.toml               # Python dependencies and build config
├── frontend/                        # React 19 + Vite 8 + MUI v9 + Tailwind v4 Frontend
│   ├── src/
│   │   ├── api/                     # Axios/Fetch API client modules
│   │   ├── components/              # Shared UI components (TopBar, BalveerFAB, StatusPill, TrustMeter, etc.)
│   │   ├── contexts/                # React Contexts (AuthContext, LanguageContext)
│   │   ├── imports/                 # OpenAPI specs and design/prompt documentation
│   │   ├── screens/                 # Role-based screens (admin, agent, buyer, farmer, onboarding, provider)
│   │   ├── utils/                   # Helper utilities (formatters)
│   │   ├── App.jsx                  # Main routing, role shells, and app providers
│   │   ├── main.jsx                 # React 19 entry point
│   │   ├── index.css                # Global CSS & Tailwind CSS v4 setup
│   │   └── theme.js                 # MUI custom theme configuration
│   ├── package.json                 # Node dependencies (React 19, MUI v9, Tailwind v4, Vite 8)
│   ├── tsconfig.json                # TypeScript compiler configuration
│   └── vite.config.ts               # Vite configuration with Tailwind CSS v4 & React plugin
└── scripts/
    ├── commit.py                    # Structured conventional git commit helper
    └── verify.py                    # Automated test, lint, and build verification tool
```

---

## 3. Financial & Trading Domain Rules

When writing code or modifying business logic in KisanConnect, strictly adhere to these core principles:

1. **Money Representation**:
   * All currency amounts are stored as `Decimal` in Python/PostgreSQL and serialized as **Strings** (e.g., `"2200.00"`).
   * **NEVER** use floating-point numbers (`float`) for monetary values or price calculations.

2. **Race-Safe Bidding**:
   * Auction bidding is race-safe using row locking (`SELECT FOR UPDATE` on the auction row).
   * Simultaneous bids must be executed against locked auction rows to avoid race conditions.

3. **Trade Billing Model**:
   * **Buyer pays; Seller nets.**
   * Commission fees and Hamali (labor/handling) charges are deducted from the **seller's proceeds**, never added onto the buyer's bill.

4. **State Machine & Status Transitions**:
   * Illegal state transitions must raise an error returning HTTP `409 INVALID_TRANSITION`.
   * State transitions for lots, auctions, agreements, and payments are centralized in `backend/app/services/state.py`.

5. **Error Formatting**:
   * Standard error responses follow the JSON structure:
     ```json
     {
       "error": {
         "code": "ERROR_CODE",
         "message": "Human readable message",
         "details": {}
       }
     }
     ```

---

## 4. Key Workflows & Commands

### Code Verification
Always run verification using the project's custom script to validate Python syntax, ORM models, frontend linting, and Vite builds in a single token-efficient run:
```bash
python scripts/verify.py
```
*(Or invoke via the `.agents/skills/verify` skill).*

### Git Commit Helper
To commit changes following conventional commit syntax with automated validation:
```bash
python scripts/commit.py
```
*(Or invoke via the `.agents/skills/git-commit` skill).*

### Development Servers (Docker)
```bash
# Start all services
docker compose up --build

# Run seed data
docker compose run --rm api python -m scripts.seed
```

### Development Servers (Local / Manual)
* **Backend**: `cd backend && alembic upgrade head && python -m scripts.seed && uvicorn app.main:app --reload` (API Docs at `http://localhost:8000/docs`).
* **Frontend**: `cd frontend && npm run dev` (Runs on `http://localhost:5173`).

---

## 5. Summary of Endpoint Groups & Domains

* **Auth**: Registration/Login via mobile OTP, token refresh, lockout policies, password management.
* **Profile / Bank**: Profiles, addresses, land holdings, bank account details.
* **Lookups**: States, districts, APMCs, commodities, quality grades.
* **Lots & Auctions**: Lot creation, bulk auction listing, live race-safe bidding feed, winner declaration.
* **Trade Lifecycle**: Assaying, weighment, agreement generation, billing, gate exit permits, payments.
* **Services Marketplace**: Quality assessor labs, logistics provider bookings (Kisan Rath), eNWR warehouse storage.
* **APMC & Settlements**: Mandi fee rules, commission agent payouts, financial settlements.
