export type UserRole = 'student' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  profile: {
    displayName: string;
    avatarUrl?: string;
    preferredLanguage: string;
  };
}

export interface Stage {
  id: string;
  title: string;
  order: number;
  estimatedDurationMinutes: number;
  contentRef: string;
  locked: boolean;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  stages: Stage[];
  language: string;
  tags: string[];
  shortDesc?: string;
  progressPercent?: number;
  difficultyTag?: 'easy' | 'medium' | 'hard';
}

export type QuestionType = 'single' | 'multi' | 'numeric';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: string | string[];
  type: QuestionType;
  difficulty: Difficulty;
  tags: string[];
  explanation: string;
  trick?: string;
}

export interface ExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  accuracy: number;
  timeTakenSeconds: number;
  topicBreakdown: Record<string, number>;
  createdAt: string;
}

export interface ExamSession {
  sessionId: string;
  examId: string;
  questions: Question[];
  startedAt: string;
  answers: Record<string, { selected: string | string[]; confidence: 'confident' | 'guess'; timeTaken: number }>;
  flagged: string[];
}
