# DATA MODEL

SALTEDHASH stores all persistent data as local JSON files under `/data`.

## Files
- `users.json`
- `fundamentals_concepts.json`
- `fundamentals_questions.json`
- `exam_questions.json`
- `exam_results.json`
- `projects.json`
- `resume_templates.json`
- `job_descriptions.json`

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
