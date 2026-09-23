# Increment 1 — Public league experience

Status: ready for user evaluation. Do not start increment 2 until this slice has been reviewed and its feedback addressed.

## Open locally

Frontend: http://127.0.0.1:5173/

Django API: http://127.0.0.1:8000/api/v1/league/

Both development servers must be running. The API reads saved records; the browser does not supply fallback match data when the backend is unavailable.

## What is included

- League overview with latest results, featured upcoming match, standings preview and leading scorers.
- Full standings with shared sporting ranks, recent form and prototype tie-breaking rules.
- Fixtures/results across all seven matchweeks, match-status filters and links that preserve filters across refresh.
- Match panels with kickoff time, ground, score and scorer events.
- Team directory, search, team profiles, squad filters and recent/upcoming matches.
- Player panels and top-scorer rankings with a team filter.
- Mobile bottom navigation, responsive tables, reduced-motion support, loading/error/empty states.
- PostgreSQL-compatible Django models, initial migrations, read-only league administration and a bounded public current-season snapshot.
- Labelled demo records: 8 fictional clubs, 88 players, 28 fixtures and 16 completed matches.

## Suggested evaluation path

1. Open the overview on your laptop. Evaluate the dark palette, typography, spacing, hierarchy and whether the competition feels distinctive enough.
2. Open **Match details**, then close with Escape.
3. Visit **Standings**, select Northside FC, filter its squad to **Forwards**, and open a player.
4. Visit **Fixtures**, choose **MW 04** and **Results**, open a match and inspect its scorers. Refresh and confirm your filters remain.
5. Visit **Teams** and try both a matching and non-matching search.
6. Visit **Scorers** and filter by club.
7. Repeat on a phone or narrow window. The standings table scrolls horizontally within its container; the page itself should not overflow.

## UI iteration — match-day motion

- Featured match pitch markings, stadium lighting, raised crests and gentle mouse-driven perspective on featured matches and club cards.
- Short page/section entrances and button, fixture and player feedback; no continuous animation loop or added animation dependency.
- Club spotlight on standings and selectable recent-form badges that open the corresponding match.
- Perspective is enabled only for large screens with a fine hover pointer. Touch devices use shorter transitions; reduced-motion preferences disable decorative motion.
- Try hovering over the featured match and team cards, then select a club under Standings and open a form badge. On phones, scroll the table sideways to reach recent form.
- Performance safeguards are verified in browser emulation; physical low-end phone testing remains part of user evaluation.

## UI iteration — football editorial direction

- New matchweek poster with original SVG football artwork, a fixtures link and current-season progress.
- Scrollable club strip links directly to each team; featured fixtures use both clubs' colours.
- Team cards include oversized club lettering. Scorer cards display illustrative kits using each player's saved shirt number.
- Inspiration: [Sky Sports Premier League identity case study](https://www.behance.net/gallery/245996303/Premier-League-2025-Sky-Sports), [The Software House football homepage concept](https://dribbble.com/shots/22489109-Premier-League-homepage-UI-concept), and [Juventus](https://www.juventus.com/en/). Reference assets have not been copied into the application.
- Assists are scheduled for increment 3: optional attribution, validation, corrected aggregates, player totals and an assists ranking. They are not implemented in this public UI iteration.
- Seven browser tests passed after the layout corrections; desktop and phone screenshots reviewed. Touch/reduced-motion safeguards remain in place.

## Engineering verification

- 16 Django tests: seed idempotence and pairing uniqueness, public/draft boundaries, query count, score corrections, ranking ties, own/unattributed goals, database constraints and failure handling.
- 7 browser tests covering the above user flows, API failure/retry, empty-season behaviour, mouse depth, reduced-motion changes and touch interactions.
- Six routes checked at 320, 390, 768 and 1440px; desktop/phone screenshots captured for visual review.
- TypeScript and production frontend build checked.

## Intentional boundaries

- No organiser sign-in or editing interface yet. The league admin is also read-only until validated setup/result workflows are implemented.
- No deployment yet. Local verification uses SQLite; PostgreSQL integration remains required before hosting.
- University brand colours are provisional until the official crest is supplied. Monograms and all records are clearly labelled placeholders.
- The first increment uses one five-query snapshot endpoint, appropriate to one small league. Authentication, writes and more granular API resources follow only when needed.
- Match data refreshes in the foreground every minute and when the page regains focus; this is not a live match feed.

## Feedback to capture

Identify the page, what feels wrong, and the desired change. Prioritise visual direction and usability first, then missing details within this public browsing experience.
