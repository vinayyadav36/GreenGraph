# DATA MODEL

SALTEDHASH stores all persistent data as local JSON files under `/data`.

## Runtime Guarantees
- **Schema integrity at write entry-point**: `server/jsonSchemas.js` validates supported payloads before any write.
- **Atomic file writes**: writes go to `.tmp` and are promoted using `fs.rename`.
- **Per-file lock queueing**: write operations are serialized by file path to reduce race-condition corruption risks.
- **Content-code decoupling**: durable product content lives in `/data/*.json`, not hardcoded in components.
- **Finance simulation boundary**: simulation pages should include the educational-purpose banner component (`src/components/ui/SimulationPurposeBanner.tsx`).

## Files
- `users.json`
- `fundamentals_concepts.json`
- `fundamentals_questions.json`
- `exam_questions.json`
- `exam_results.json`
- `projects.json`
- `resume_templates.json`
- `job_descriptions.json`
- `issues.json`
- `resources.json`
- `members.json`
- `threads.json`
- `events.json`
- `sponsors.json`
- `taxonomy.json`
- `moderation.json`
- `audit.json`
- `students.json`
- `lessons.json`
- `concepts.json`
- `budgets.json`
- `scenarios.json`
- `quiz_attempts.json`
- `progress.json`
- `guidance_rules.json`

## Model Summary

### users.json
- `users[]`: profile metadata and progress map.
- Includes optional `resumes[]` profile extension for saved resumes.

### fundamentals_concepts.json
- `concepts[]`: concept metadata and ordered `steps[]`.

### fundamentals_questions.json
- `questions[]`: concept-linked practice items with `explanation_steps[]`.

### exam_questions.json
- `topics[]`: exam topic catalog.
- `questions[]`: topic-linked NEET/JEE question bank with `solution_steps[]`.

### exam_results.json
- `attempts[]`: persisted question attempts with correctness and timing details.

### projects.json
- `projects[]`: minimal project studio catalog.

### resume_templates.json
- `templates[]`: structured template sections and fields.

### job_descriptions.json
- `jobs[]`: keyword-rich sample job descriptions.

### Community / Newsletter / Knowledge Networks
- `issues.json`: newsletter issue lifecycle records (`draft -> review -> approved -> scheduled -> published`).
- `resources.json`: curated resource library with visibility gating and topic tags.
- `members.json`: member directory with role and tier metadata.
- `threads.json`: discussion threads linked to authors and topic taxonomy.
- `events.json`: workshop/session records with capacity and visibility.
- `sponsors.json`: sponsor slot placements mapped to issue IDs.
- `taxonomy.json`: controlled vocabulary for topics and tags.
- `moderation.json`: moderation queue with structured review states.
- `audit.json`: append-style event records for governance and traceability.

### Finance / Learning / Student Support
- `students.json`: student profile and preference records.
- `lessons.json`: lesson cards and checkpoint references.
- `concepts.json`: financial concept library index.
- `budgets.json`: budgeting workspace snapshots.
- `scenarios.json`: scenario-based learning payloads.
- `quiz_attempts.json`: immutable quiz/checkpoint attempt records.
- `progress.json`: student progress snapshots.
- `guidance_rules.json`: mentor-style deterministic guidance rules + educational disclaimer text.
