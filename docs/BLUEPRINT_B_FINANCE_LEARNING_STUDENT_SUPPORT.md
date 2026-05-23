# Blueprint B — Finance / Learning / Student Support (SALTEDHASH)

## 1. Theme Summary
Student-first financial literacy product focused on simulation-based learning and practical planning.

## 2. Covered Product Types
Student finance mentor tools, budgeting education, scenario planners, checkpoint-led learning tracks.

## 3. Shared Problem Framework
Students face abstract and confusing financial guidance; they need explainable, low-risk educational simulation.

## 4. Core User Types
Student learner, educator/author, mentor/facilitator, admin/moderator.

## 5. SALTEDHASH Product Strategy
Ship learning + simulation + progress loops with clear educational framing.

## 6. Architecture Style
Express + JSON-first content store, schema-validated writes, atomic persistence.

## 7. Global System Structure
Profile/progress, learning content, simulation engine, assessment, guidance boundaries.

## 8. Core Reusable Modules
student profile, budgeting workspace, expense planner, loan simulator, savings goals, scenario learning, quizzes/checkpoints, concept library, progress dashboard, mentor guidance.

## 9. NoSQL / JSON Data Architecture
Versioned JSON collections with immutable attempt records and latest-state progress snapshots.

## 10. Authentication and Authorization
Student/educator/admin role boundaries with scoped data access.

## 11. Budgeting and Simulation Engine
Budget entries, amortization/savings simulation payloads, deterministic output structures.

## 12. Learning Content Engine
Lesson cards, concept index, scenario payloads, and checkpoint attempts.

## 13. Folder Structure
- `data/students.json`, `data/lessons.json`, `data/concepts.json`, `data/budgets.json`
- `data/scenarios.json`, `data/quiz_attempts.json`, `data/progress.json`, `data/guidance_rules.json`

## 14. API Design
Uses allowlisted `/api/data/:name` collections with strict schema checks.

## 15. Frontend Architecture
Simulation pages must render educational-purpose disclaimer banner.

## 16. Admin and Education Management System
Structured content authoring, checkpoint design, progress review, and rule-based guidance.

## 17. Data Models with Sample JSON
See: `data/students.json`, `data/budgets.json`, `data/scenarios.json`, `data/quiz_attempts.json`, `data/progress.json`, `data/guidance_rules.json`.

## 18. MVP Scope
Student profile, budget workspace, expense planning, one loan simulation flow, lessons, scenarios, checkpoints, progress.

## 19. Expansion Strategy
Adaptive learning paths, mentor cohorts, institutional analytics, localized curricula.

## 20. Risks and Guardrails
Regulatory ambiguity -> mandatory educational disclaimer; complexity overload -> plain-language UX; low engagement -> checkpoint + streak loops.

## 21. Final Recommendation
Position as educational simulation lab, never as regulated advisory product.
