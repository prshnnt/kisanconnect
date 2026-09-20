# KisanConnect Backend

FastAPI + async SQLAlchemy 2 + PostgreSQL + Celery. Backend only (no frontend).
Built on the consolidated 34-table schema (`DB_DESIGN.md` in the DB pack).

## Run it
```bash
cp .env.example .env            # then set JWT_SECRET (see the comment inside)
docker compose up --build       # db + migrate job + api + worker + beat
docker compose run --rm api python -m scripts.seed   # optional: reference data + demo users
```
API docs: http://localhost:8000/docs  ·  health: `/health`, `/ready`

Without Docker:
```bash
make install && alembic upgrade head && python -m scripts.seed && make run
```

## Test
```bash
make test     # 29 tests. Spins up its own throwaway PostgreSQL, so nothing to install or configure
make lint
```

## Layout
```
app/
  core/        config (fails closed in production), security, errors, pagination
  db/          async session (one transaction per request)
  models/      the 34-table schema
  schemas/     Pydantic request/response models, one file per domain
  services/    ALL business rules (routers contain none)
  api/v1/      thin routers, one file per page group
  tasks/       Celery jobs: auction sweep, auto-declare, nightly expiry
alembic/       single initial migration, verified: upgrade, check (no drift), downgrade
scripts/seed.py
```

## Endpoint groups (90 paths / 103 operations, see /docs)
| Tag | Covers |
|---|---|
| A. Auth | register/login with OTP, refresh (reuse detection), lockout, password change, account deletion |
| B. Profile / Bank | profile, addresses, mobile/email verification, bank accounts (masked, one primary) |
| C. Preferences | seller/buyer preferences, trade licences, service-provider registration, uploads |
| D. Lookups | states, districts, APMCs, commodities, enums |
| E. Lots / Supply / Demand | lot create (primary/secondary, advance/outside-APMC), lists, Excel export |
| F. Auctions | bulk create, race-safe bidding, pending/winning views, declare, websocket feed |
| G/H/K | weighment, trade confirmation, agreement, billing, payments, gate exit |
| I/J | assaying / weighment / logistics / warehouse marketplace: catalogs, bookings, negotiation |
| L. Find Mandis | captcha + radius search (public) |

## Rules worth knowing
- **Bidding is race-safe:** the auction row is locked per bid. A test fires 50 simultaneous bids, and removing the lock makes that test fail.
- **Money** is `Decimal`, serialised as strings (`"2200.00"`). Never float.
- **Illegal status changes** return `409 INVALID_TRANSITION` (all edges in `services/state.py`).
- **Errors** always look like `{"error": {"code", "message", "details"}}`.
- **Production safety:** with `ENV=production` the app refuses to start if `JWT_SECRET` is weak, `DEBUG_OTP` is on, or CORS is `*`.

## Known limits (deliberately not faked)
1. **SMS/email, bank penny-drop, S3 uploads are stubs.** OTPs are stored hashed but nothing sends them (use `DEBUG_OTP=true` in dev). `/uploads/presign` returns a placeholder URL.
2. **Captcha and websocket rooms are in-memory**, correct for one process only. Move both to Redis before running more than one API worker.
3. **Fee percentages are request inputs** to `generate-bill`, because mandi fee rules per APMC were not specified.
4. **Payments are recorded, not processed.** No gateway.
5. **No rate limiting** beyond OTP throttling and login lockout. Put a limiter (nginx / API gateway) in front for bid and public endpoints.
6. `/mandis/nearby` scans all APMCs with coordinates. Fine for ~thousands, add PostGIS beyond that.
7. Old-database data migration is not included. Use `MIGRATION_MAP.md` from the DB pack as the spec.
