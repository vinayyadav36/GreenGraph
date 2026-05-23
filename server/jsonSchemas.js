import { z } from 'zod';

const simpleArrayRoot = (key) => z.object({ [key]: z.array(z.unknown()) }).passthrough();

const isoDateString = z.string().datetime({ offset: true }).or(z.string());
const id = z.string().min(1);

const issueSchema = z.object({
  id,
  title: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(['draft', 'review', 'approved', 'scheduled', 'published']),
  topics: z.array(z.string()),
  gatedTier: z.enum(['public', 'member', 'premium', 'pro']),
  publishedAt: z.string().optional(),
  updatedAt: isoDateString,
});

const resourceSchema = z.object({
  id,
  type: z.string().min(1),
  title: z.string().min(1),
  topics: z.array(z.string()),
  visibility: z.enum(['public', 'members', 'premium']),
  summary: z.string().optional(),
});

const memberSchema = z.object({
  id,
  role: z.enum(['admin', 'editor', 'moderator', 'member', 'expert', 'student']),
  tier: z.enum(['free', 'member', 'premium', 'pro']),
  interests: z.array(z.string()),
  displayName: z.string().optional(),
});

const threadSchema = z.object({
  id,
  topic: z.string().min(1),
  authorId: z.string().min(1),
  status: z.enum(['open', 'closed', 'archived']),
  createdAt: isoDateString,
});

const eventSchema = z.object({
  id,
  type: z.enum(['workshop', 'session', 'ama', 'office-hours']),
  title: z.string().min(1),
  expertId: z.string().optional(),
  capacity: z.number().int().nonnegative(),
  visibility: z.enum(['public', 'members', 'premium']),
});

const sponsorSlotSchema = z.object({
  id,
  issueId: z.string().min(1),
  placement: z.string().min(1),
  status: z.enum(['open', 'reserved', 'published']),
  partnerName: z.string().optional(),
});

const studentSchema = z.object({
  id,
  grade: z.string().min(1),
  goals: z.array(z.string()),
  riskComfort: z.enum(['low', 'medium', 'high']),
  createdAt: isoDateString,
});

const lessonSchema = z.object({
  id,
  title: z.string().min(1),
  category: z.string().min(1),
  checkpoints: z.array(z.string()).default([]),
  contentMarkdown: z.string().min(1),
});

const conceptSchema = z.object({
  id,
  title: z.string().min(1),
  definition: z.string().min(1),
  tags: z.array(z.string()),
});

const budgetSchema = z.object({
  id,
  studentId: z.string().min(1),
  income: z.number(),
  fixedExpenses: z.number(),
  variableExpenses: z.number(),
});

const scenarioSchema = z.object({
  id,
  title: z.string().min(1),
  inputs: z.array(z.string()),
  checkpointIds: z.array(z.string()),
});

const quizAttemptSchema = z.object({
  id,
  studentId: z.string().min(1),
  score: z.number().min(0).max(100),
  conceptsWeak: z.array(z.string()),
  attemptedAt: isoDateString,
});

const progressSchema = z.object({
  studentId: z.string().min(1),
  lessonsCompleted: z.number().int().nonnegative(),
  simulationsRun: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
});

const guidanceRuleSchema = z.object({
  id,
  trigger: z.string().min(1),
  tip: z.string().min(1),
  disclaimer: z.string().min(1),
});

const schemaWithVersion = (key, valueSchema) =>
  z.object({
    schema_version: z.string().min(1),
    updated_at: isoDateString,
    [key]: z.array(valueSchema),
  });

const schemas = {
  users: z
    .object({
      users: z.array(z.object({ id: z.string().optional() }).passthrough()),
    })
    .passthrough(),
  fundamentals_concepts: simpleArrayRoot('concepts'),
  fundamentals_questions: simpleArrayRoot('questions'),
  exam_questions: z
    .object({
      topics: z.array(z.unknown()),
      questions: z.array(z.unknown()),
    })
    .passthrough(),
  exam_results: simpleArrayRoot('attempts'),
  projects: simpleArrayRoot('projects'),
  resume_templates: simpleArrayRoot('templates'),
  job_descriptions: simpleArrayRoot('jobs'),

  issues: schemaWithVersion('issues', issueSchema),
  resources: schemaWithVersion('resources', resourceSchema),
  members: schemaWithVersion('members', memberSchema),
  threads: schemaWithVersion('threads', threadSchema),
  events: schemaWithVersion('events', eventSchema),
  sponsors: schemaWithVersion('sponsors', sponsorSlotSchema),
  taxonomy: z.object({
    schema_version: z.string().min(1),
    updated_at: isoDateString,
    topics: z.array(
      z.object({
        id,
        name: z.string().min(1),
        slug: z.string().min(1),
        parentId: z.string().nullable(),
      })
    ),
    tags: z.array(
      z.object({
        id,
        name: z.string().min(1),
        slug: z.string().min(1),
        topicId: z.string().min(1),
      })
    ),
  }),
  moderation: z.object({
    schema_version: z.string().min(1),
    updated_at: isoDateString,
    queue: z.array(
      z.object({
        id,
        itemType: z.string().min(1),
        itemId: z.string().min(1),
        reason: z.string().min(1),
        status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']),
      })
    ),
  }),
  audit: z.object({
    schema_version: z.string().min(1),
    updated_at: isoDateString,
    events: z.array(
      z.object({
        id,
        actorId: z.string().min(1),
        action: z.string().min(1),
        entityType: z.string().min(1),
        entityId: z.string().min(1),
        createdAt: isoDateString,
      })
    ),
  }),

  students: schemaWithVersion('students', studentSchema),
  lessons: schemaWithVersion('lessons', lessonSchema),
  concepts: schemaWithVersion('concepts', conceptSchema),
  budgets: schemaWithVersion('budgets', budgetSchema),
  scenarios: schemaWithVersion('scenarios', scenarioSchema),
  quiz_attempts: schemaWithVersion('quiz_attempts', quizAttemptSchema),
  progress: schemaWithVersion('progress', progressSchema),
  guidance_rules: schemaWithVersion('guidance_rules', guidanceRuleSchema),
};

export function validateDataPayload(fileName, payload) {
  const schema = schemas[fileName];
  if (!schema) return { ok: true, data: payload };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  return { ok: true, data: parsed.data };
}

