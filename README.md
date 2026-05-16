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
