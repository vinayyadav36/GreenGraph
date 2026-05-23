# SALTEDHASH Core Engine Architecture

## 1) System Blueprint & Topology
- Client: reactive product UI (current repo implementation is React + Vite; blueprint targets remain reusable for Vue 3 + Vite).
- Gateway: Express API with rate limiting and JSON persistence routes.
- Pipelines:
  - Finance sandbox pipeline (budgeting and simulation payloads).
  - Curated content pipeline (newsletter, resources, taxonomy, moderation).
- Storage core:
  - In-memory lock map for file-level write serialization.
  - Atomic local JSON writes (`*.tmp -> rename`) for safer commit behavior.

## 2) Atomic Data Layer & I/O Engine
- Implementation file: `server/jsonStore.js`
- Guarantees:
  - `readJsonFile(filePath)` parses persisted JSON.
  - `writeJsonFileAtomic(filePath, payload)` writes to temporary file then renames.
  - `writeJsonFileLocked(filePath, payload)` serializes writes for each file path.

## 3) Schema Enforcement Layer
- Implementation file: `server/jsonSchemas.js`
- API integration file: `server/saltedhash-server.js`
- Behavior:
  - Every POST write to `/api/data/:name` is validated through `validateDataPayload`.
  - Invalid payloads return `400` with structured issue paths/messages.
  - This prevents schema drift across file-based NoSQL collections.

## 4) Auth and Access Boundaries
- Existing token/session flow remains in place for current app auth.
- Target tier model for blueprint packs:
  - role tiers: `admin | editor | moderator | member | expert | student`
  - content tiers: `public | member | premium | pro`
- Premium-gated entities are represented at data level (`gatedTier`, `visibility`, and tier fields).

## 5) Finance Computational Boundary
- Finance learning modules are simulation-only.
- Mandatory UX rule: calculation/simulation pages must display educational disclaimer messaging.
- Reusable UI component: `src/components/ui/SimulationPurposeBanner.tsx`.

## 6) Core JSON Domain Packs
### Community / Newsletter / Knowledge Networks
- `issues.json`
- `resources.json`
- `members.json`
- `threads.json`
- `events.json`
- `sponsors.json`
- `taxonomy.json`
- `moderation.json`
- `audit.json`

### Finance / Learning / Student Support
- `students.json`
- `lessons.json`
- `concepts.json`
- `budgets.json`
- `scenarios.json`
- `quiz_attempts.json`
- `progress.json`
- `guidance_rules.json`

## 7) Functional Boundaries
- Content from JSON, not hardcoded production assets in UI modules.
- Deterministic simulation logic isolated from persistence concerns.
- Governance-first defaults:
  - taxonomy-controlled discovery
  - moderation queue from day one
  - append-style audit events

## 8) Operational Notes for Solo Founder Execution
- Zero external database required for MVP.
- One Express process can run read/write for both blueprint packs.
- Scale path:
  - keep JSON schemas stable and versioned.
  - shard high-volume files by date/category as growth increases.
