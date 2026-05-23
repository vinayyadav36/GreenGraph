# SALTEDHASH

==================== SALTEDHASH ====================

SALTEDHASH is an offline-first educational web app focused on fundamentals learning, NEET/JEE practice, and basic career tools. It uses local JSON files under `/data` as a NoSQL-like data store.

## Modules
- Fundamentals Lab
- Exam Engine
- Career Launchpad
- Project Studio (minimal stub)

## Run locally
1. Install dependencies:
   - `npm install`
2. Start backend JSON API:
   - `npm run dev:server`
3. Start frontend:
   - `npm run dev`
4. Open app in browser and go to `#/fundamentals`.

## Notes
- No external APIs.
- No SQL or DB servers.
- Data persistence is done by reading and writing local JSON files in `/data`.
- Active backend target is `server/saltedhash-server.js` (JSON-only persistence + local-only CORS policy).
- JSON collections are initialized empty for production onboarding (no demo seed profiles in `data/users.json`).
- JSON writes are now protected with atomic write + lock behavior in `server/jsonStore.js`.
- Data payloads are validated at API entry using centralized schemas in `server/jsonSchemas.js`.

## Blueprint Packs (Execution-Ready Foundations)
- Community / Newsletter / Knowledge Networks data modules:
  - `issues.json`, `resources.json`, `members.json`, `threads.json`, `events.json`, `sponsors.json`, `taxonomy.json`, `moderation.json`, `audit.json`
- Finance / Learning / Student Support data modules:
  - `students.json`, `lessons.json`, `concepts.json`, `budgets.json`, `scenarios.json`, `quiz_attempts.json`, `progress.json`, `guidance_rules.json`

## Architecture Docs
- `docs/SALTEDHASH_CORE_ENGINE_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
