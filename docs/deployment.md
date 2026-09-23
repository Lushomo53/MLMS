# Deployment setup

These are templates and instructions; hosting accounts and resources have not been connected.

## 1. Neon PostgreSQL

Create a free project. Store its connection URL only in Render's `DATABASE_URL`; use TLS (`sslmode=require`). Never commit credentials. A database owner capable of applying Django migrations is needed during deployment.

## 2. Render Django service

Connect the Git repository using the root `render.yaml` blueprint. Select only the free service plan. The blueprint sets `backend` as its root directory and generates a Django secret key.

Provide:

| Variable | Value |
| --- | --- |
| `DJANGO_ENV` | `production` (already in blueprint) |
| `DATABASE_URL` | Neon PostgreSQL URL with TLS |
| `DJANGO_ALLOWED_HOSTS` | Exact Render API hostname, no scheme; comma-separated if multiple |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Exact Vercel frontend origin including `https://` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Exact API and frontend HTTPS origins, comma-separated |

Production startup rejects missing secrets, missing hosts, and missing/non-PostgreSQL database configuration. HTTPS, secure cookies, and HSTS are enabled. The forwarded-protocol header is trusted because Render terminates HTTPS; do not expose this configuration directly to untrusted proxy headers on another host.

The build command installs locked dependencies, applies migrations, and collects static assets. This includes Django admin assets served through WhiteNoise. Applying migrations at build time is an initial single-service/free-tier deployment choice: keep migrations backward-compatible and revisit this sequence before multiple concurrent deploys or destructive schema changes.

Readiness path: `/api/v1/health/`. It tests the database but does not verify the entire application schema. Run the actual application checks after deployment as well.

## 3. Vercel frontend

Import the repository, select `frontend` as the root directory, select Node.js 24, and use the checked-in Vite configuration. Set the public build variable:

```dotenv
VITE_API_BASE_URL=https://YOUR-API-HOST/api/v1
```

Replace the example with the actual Render origin. Rebuild after changing Vite variables. The initial setup uses direct HTTPS API requests with exact CORS origins. `frontend/vercel.json` rewrites client routes to the app while excluding `/api` so a missing API rewrite cannot silently return HTML as API data.

Before implementing organiser refresh cookies, configure and verify a same-origin Vercel `/api/:path*` rewrite to the actual backend, before the SPA catch-all; then use `VITE_API_BASE_URL=/api/v1`. This avoids relying on cross-site cookies. Token refresh, rotation, CSRF checks, logout invalidation, and the authenticated proxy flow are not part of the initial setup and must be tested before enabling organiser writes.

Production preview origins must be explicitly added when needed. Do not enable wildcard credentialed CORS for every Vercel deployment.

## Release checks

- Run frontend build and Django tests against PostgreSQL.
- Run `python manage.py check --deploy` with real production settings.
- Check HTTPS readiness, deep-link reloads, static admin assets, and public API access from the Vercel origin.
- Verify that a cold/unreachable backend displays a recoverable loading/error state rather than fabricated data.
- Verify no debug output, embedded secrets, preloaded credentials, or public write permissions.

Render free services sleep after 15 idle minutes. Open the app before presenting; do not rely on an instant first request. Neon is proposed instead of Render free PostgreSQL because Render's free database expires after 30 days. Recheck provider quotas and account eligibility when deploying.

References:

- https://render.com/docs/free
- https://render.com/docs/deploy-django
- https://neon.com/docs/guides/django
- https://vercel.com/docs/frameworks/frontend/vite
- https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
