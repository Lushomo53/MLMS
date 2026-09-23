# Development increments

Each increment ends with a working build, verification and a user test guide. Pause for the user's evaluation; address feedback within the same increment before proceeding. Do not automatically begin the next increment.

## 1 — Public league experience (current)

Django season/team/player/fixture/goal models, a non-destructive fictional seed, league overview, standings, fixtures/results and match details, team directory/profiles, squads and top scorers. Server-calculated standings and scoring statistics. Responsive dark design with loading, error and empty states.

Evaluate: visual direction, navigation, mobile layouts, data readability and team identity.

## 2 — Organiser setup

Organiser login and permissions, team/player management, season creation, single round-robin generation, date/venue editing and publication. Complete the same-origin authentication configuration.

Evaluate: forms, validation, draft/public boundaries and the setup-to-publication flow.

## 3 — Match operations

Atomic score/scorer entry, optional assist attribution, own/unattributed goals, corrections without double counting, and shared updates across devices. Include assist totals in player profiles and an assists ranking. Validate that an assister is a different player on the scoring team; do not award assists for own goals. Unrecorded assists remain unknown rather than invented.

Evaluate: the complete judging flow and result corrections.

## 4 — Release and presentation

Supplied real data and assets, final visual feedback, PostgreSQL and deployed authentication verification, Vercel/Render/Neon free-tier deployment and demo rehearsal.

## Engineering boundaries

Django owns calculations and validation. Use database constraints and shared typed frontend components. Test business rules and permissions. Avoid microservices, WebSockets, generic workflow engines and speculative abstractions. The first increment uses one bounded current-season snapshot API; split it only when actual scale requires it.
