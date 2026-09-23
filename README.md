# MUSU — Mulungushi University Student League

A hackathon football league application with a React frontend and Django API.
Delivery target: Friday, 25 September 2026. See [project scope](docs/project-scope.md).

## Current milestone: increment 1 — public league experience

The first reviewable slice includes the league overview, standings, fixtures/results, match details, team profiles, squads, player details and top scorers, backed by saved Django records. The local demo contains eight fictional teams, 88 players and 28 fixtures.

Read the [increment plan](docs/increments.md) and [first-slice test guide](docs/increment-1-review.md). Development pauses here for user evaluation before organiser workflows begin.

Verified: 16 Django tests, five browser scenarios, six public routes at four viewport widths, and the TypeScript/production frontend build. A mobile squad overflow found during testing was corrected. Screenshots are generated under frontend/artifacts/ and are not committed.

League records and Django league administration are read-only in this slice. Organiser authentication, data entry, publication and result correction interfaces follow in later increments. No hosting has been connected; local checks use SQLite, with PostgreSQL verification required before deployment. Colours and crests remain provisional and all sample records are labelled fictional.

## Stack and prerequisites

- Node.js 24 LTS and npm (see `.node-version`).
- Python 3.13, Django 5.2 LTS, Django REST Framework.
- React, TypeScript, Vite, Tailwind, Motion, TanStack Query, React Router, Radix primitives.
- PostgreSQL in deployment. Development can start with SQLite before connecting PostgreSQL.
- Optional Docker Compose for a local PostgreSQL database.

## Start locally on Windows

Run these commands from the repository root. Use two PowerShell terminals.

Backend terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_demo
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Frontend terminal:

```powershell
cd frontend
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

If the virtual environment, dependencies, or `.env` already exist, reuse them; do not overwrite customised environment files. On macOS/Linux use `.venv/bin/python` and `npm` instead of the Windows commands.

- Frontend: http://127.0.0.1:5173
- API readiness: http://127.0.0.1:8000/api/v1/health/
- Django administration: http://127.0.0.1:8000/admin/

The Vite server proxies `/api` to Django. The public pages read `/api/v1/league/`; API failures show a recoverable error rather than fabricated match data. No account is seeded. Create a local admin when needed with `.\.venv\Scripts\python.exe manage.py createsuperuser`.

### Use PostgreSQL locally

From the repository root, run `docker compose up -d db`. Set this in `backend/.env`:

```dotenv
DATABASE_URL=postgresql://musu:musu_local_only@localhost:5432/musu
```

Then run Django migrations again. Switching databases does not copy records from SQLite. SQLite is a convenience for initial setup; database-sensitive league behaviour must also be tested on PostgreSQL before deployment.

## Checks

```powershell
# From frontend/
npm.cmd run build

# From backend/
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test
```

`GET /api/v1/health/` returns `200 {"status":"ok","database":"ok"}` when a database query succeeds and `503 {"status":"unavailable","database":"unavailable"}` otherwise. It is public and uncached. New DRF endpoints default to staff-only access. Session authentication currently supports Django admin; the custom organiser token flow is a later milestone.

## Deployment

See [deployment instructions](docs/deployment.md). Proposed topology:

```text
Browser → React / Vercel → Django REST API / Render → PostgreSQL / Neon
```

Do not store production SQLite databases or uploaded files on Render's ephemeral disk. Never put secrets in `VITE_*` values, which are included in browser bundles.

## Repository layout

```text
frontend/         React application and Vercel configuration
backend/config/   Django settings, URL routing, WSGI/ASGI
backend/accounts/ Project-owned user model and admin
backend/core/     API readiness and infrastructure checks
backend/league/   League models, snapshot service, demo seed and tests
docs/             Scope and deployment notes
```

Dependency versions are recorded in `frontend/package-lock.json` and `backend/requirements.txt`. `backend/requirements.in` records intended direct dependency ranges. Keep both Python files aligned when deliberately upgrading dependencies; the Gunicorn pin carries a Linux-only marker so Windows development remains installable.

## First-increment browser checks

With the seeded Django API and Vite servers running, run these in frontend/:

```powershell
npm.cmd run test:e2e
npm.cmd run format:check
```

The tests use a separate headless Edge session on Windows. On Linux/macOS, install the test browser with `npx playwright install chromium` first. They verify navigation, fixture filters, detail panels, team/player browsing, API failure recovery, empty-season handling and responsive page widths. Test interception does not modify saved league records.

The demo seed command is idempotent and refuses to overwrite an existing real league. It does not create an organiser account. Standings and scorer totals are recalculated from published completed matches rather than stored as mutable counters.