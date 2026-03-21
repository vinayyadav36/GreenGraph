import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface StageProgress {
  stageId: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
}

interface ProgressState {
  courseProgress: Record<string, StageProgress[]>;
  currentStreak: number;
  totalPoints: number;
}

const initialState: ProgressState = {
  courseProgress: {},
  currentStreak: 0,
  totalPoints: 0,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    markStageComplete: (state, action: PayloadAction<{ courseId: string; stageId: string; score?: number }>) => {
      const { courseId, stageId, score } = action.payload;
      if (!state.courseProgress[courseId]) {
        state.courseProgress[courseId] = [];
      }
      const existing = state.courseProgress[courseId].find((s) => s.stageId === stageId);
      if (existing) {
        existing.completed = true;
        existing.completedAt = new Date().toISOString();
        if (score !== undefined) existing.score = score;
      } else {
        state.courseProgress[courseId].push({
          stageId,
          completed: true,
          completedAt: new Date().toISOString(),
          score,
        });
      }
      state.totalPoints += 10;
    },
    setStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = action.payload;
    },
    addPoints: (state, action: PayloadAction<number>) => {
      state.totalPoints += action.payload;
    },
  },
});

export const { markStageComplete, setStreak, addPoints } = progressSlice.actions;
export default progressSlice.reducer;
