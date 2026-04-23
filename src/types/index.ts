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

export interface ExamCard {
  id: string;
  name: string;
  fullName: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  vacancies: string;
  examDate: string;
  difficulty: Difficulty;
  topics: string[];
  sessionId: string;
  questionCount: number;
}

export interface ResourceLink {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  features: string[];
  color: string;
  badge: string;
}

// 1 = Monday … 6 = Saturday
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6;

export interface ScheduleSlot {
  id: string;
  courseId: string;
  courseName: string;
  subject: string;
  /** Day of the week: 1 = Monday, 2 = Tuesday … 6 = Saturday */
  dayOfWeek: DayOfWeek;
  /** 24-hour start time, e.g. "09:00" */
  startTime: string;
  /** 24-hour end time, e.g. "10:30" */
  endTime: string;
  room: string;
  /** Tailwind gradient classes for the colour bar */
  color: string;
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  subject: string;
  title: string;
  /** ISO 8601 date string */
  dueDate: string;
  status: AssignmentStatus;
  /** Percentage grade when status is 'graded' */
  grade?: number;
  maxMarks: number;
}

export interface GradeEntry {
  courseId: string;
  courseName: string;
  subject: string;
  /** Score out of 100 */
  continuousAssessment: number;
  /** Score out of 100 */
  midterm: number;
  /** Score out of 100 */
  final: number;
  /** Weighted total out of 100 */
  total: number;
  /** Letter grade: A+, A, B+, B, C, F */
  letterGrade: string;
}
