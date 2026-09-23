# MUSU League — Hackathon Project Scope

Status: agreed direction with implementation defaults below. Updated 22 September 2026.
Target: working, deployed prototype by Friday, 25 September 2026.

## Purpose and success

Build a football league management application for the Mulungushi University Student League (MUSU). Students follow the competition through a polished public interface; organisers set up the season, maintain teams and players, publish fixtures, and record results.

Visual quality is a primary deliverable. The product must feel specific to university football and work well on phones and a laptop used for judging. The main demonstration follows guided league setup through fixture publication, then result entry and updated public standings.

## Confirmed decisions

- React and TypeScript frontend, hosted on Vercel.
- Django backend with Django ORM and a PostgreSQL database, using free hosting tiers.
- Shared online records: organiser changes must be visible from another device.
- Black and charcoal surfaces with accents derived from the university crest. Exact brand shades remain provisional until the crest is verified.
- University identity and real league records will be supplied when available. Clearly labelled fictional demo records are permitted in the meantime.
- One league and one active season for the hackathon.

## Prototype features

### Fan experience

- League home: featured fixture or latest result, upcoming fixtures, standings preview, and leading scorers.
- Full standings: played, won, drawn, lost, goals for/against, goal difference, points, and recent form.
- Fixtures and results grouped by matchweek, with match detail showing teams, date, venue, score, and recorded scorers.
- Team directory and profiles with squad, form, fixtures, and results.
- Player profiles with name, team, shirt number, position, and recorded goal/assist totals; top-scorer and assist rankings (assists arrive in increment 3).
- Public visitors browse without an account. Published records only appear in public views.

### Organiser experience

- Pre-created organiser account and login; no public registration in this version.
- Guided setup: league/season details, teams, players, then single round-robin fixture generation.
- Review generated matchweeks; set or edit kickoff dates, times, and venues before publication.
- Maintain team and player records through custom React forms. Django admin provides supporting record maintenance.
- Enter and correct a completed match result, scorer events and optional assists. Standings and scoring totals reflect corrections without double counting.
- Clear validation, save feedback, and recoverable API errors throughout the flow.

### Implementation defaults

- Seed eight fictional teams with eleven players each, a mix of completed and upcoming fixtures, and clearly visible demo-data labelling. This is representative content, not a claim about the actual MUSU competition.
- Use three points for a win, one for a draw, and zero for a loss. Rank by points, goal difference, then goals scored. Exact ties share sporting rank with name ordering only for stable display. Confirm actual MUSU rules when supplied.
- Generate each team pairing once, including a bye for an odd team count. Do not overwrite published fixtures or results through regeneration.
- Display kickoff times in Africa/Lusaka; store timestamps consistently in UTC.
- Goal events belong to a player on one of the participating teams. Support unattributed and own goals so scorer statistics do not require fabricated attribution; attributed totals cannot exceed the corresponding team score.
- Archive referenced teams/players rather than deleting match history. Transfers and roster eligibility rules are outside this prototype.
- Use deliberate monogram/crest placeholders and player silhouettes where authentic assets are unavailable. Do not represent generated portraits as real students.
- Replace demo content through organiser forms or a validated seed/import process. No public reset button or destructive automatic reseeding of deployed data.

## Design acceptance

- Establish the visual standard through the league home, standings, and one team profile before extending it to the remaining screens.
- Use strong sports typography, clear score hierarchy, university accents, and purposeful imagery where available.
- Compose layouts for phone and desktop; do not simply shrink desktop tables and navigation onto mobile.
- Provide intentional hover, focus, active, loading, empty, success, and error states. Preserve keyboard access, readable contrast, and reduced-motion preferences.
- Motion supports navigation, matchweek changes, and saved-state feedback. No fabricated live-match indicators.
- Reserve time for browser-based visual review and revision. A functional page alone does not satisfy the UI requirement.

## Technical architecture

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS/custom CSS, Radix primitives, and Motion.
- Backend: Django, Django REST Framework, PostgreSQL through Django ORM. Backend owns validation, fixture generation, permissions, standings, and scorer calculations.
- Repository structure: frontend/, backend/, docs/. API under /api/v1/ for season, team, player, fixture, result, standings, and scorer resources plus organiser authentication.
- Authentication default: short-lived bearer access tokens held in memory and rotating refresh tokens in secure HttpOnly cookies; logout invalidates refresh tokens. Prefer a same-origin /api proxy through Vercel to avoid reliance on third-party cookies. Restrict writes to organisers and configure CSRF/origin checks for cookie-authenticated endpoints.
- Save results and their goal events atomically. Derive public aggregates from completed published matches rather than mutable client-side counters.
- Refresh public queries on navigation/window focus and periodically while visible, so a second device sees published changes. WebSockets are not required.
- Proposed hosting: Vercel frontend, Render free web service for Django, Neon free PostgreSQL. Verify account availability and plan limits before deployment; never select a paid upgrade automatically.
- Keep initial images in versioned frontend assets or use supplied image URLs. Runtime file uploads and persistent media hosting are deferred.
- Keep secrets in deployment environment settings; provide a secret-free environment example, database migrations, deterministic demo seed command, API health endpoint, and deployment instructions.

## Not included by Friday

Payments, transfers, multiple competitions, knockout stages, automated venue optimisation, live event feeds, chat, notifications, public signup, advanced analytics, runtime image uploads, and native mobile apps.

## Verification and delivery

- Test round-robin uniqueness/byes, standings and ties, scorer attribution, corrected results, and permission boundaries.
- Exercise setup → teams/players → generated fixtures → publication → result entry → public standings/scorers from a second browser session.
- Verify refresh persistence, rejected unauthorised writes, empty states, failed saves, and loading/retry behaviour when the free backend wakes.
- Review phone and desktop layouts, long team names, populated tables, keyboard navigation, and reduced motion; run frontend production build and Django deployment checks.
- Tuesday: scope, brand direction, schema/API foundation, and first visual slice.
- Wednesday: guided setup, shared records, and core fan screens.
- Thursday: result/scorer logic, full integration, first hosted demo, and authentic data replacement if supplied.
- Friday: feature freeze, visual refinement, verification, and demo rehearsal. Open the hosted application before judging to allow a sleeping free backend to wake.

## Dependencies and hosting notes

Real team names, squads, university crest, and suitable photos are pending from the user; implementation proceeds with labelled placeholders. Deployment requires access to the selected hosting accounts and project configuration. Nothing has been deployed at scope-definition time.

Render free web services sleep after 15 idle minutes and have ephemeral local filesystems. Render free PostgreSQL expires after 30 days, so Neon is proposed for the database instead. Free-tier capacity is suitable for a bounded prototype, subject to provider quotas and account eligibility.

References checked on 22 September 2026:

- https://render.com/docs/free
- https://render.com/docs/your-first-deploy
- https://neon.com/blog/how-to-make-the-most-of-neons-free-plan
- https://vercel.com/docs/frameworks/frontend/vite
