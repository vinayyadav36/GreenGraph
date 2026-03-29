import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ExamSubscription {
  id: string;
  examId: string;
  createdAt: string;
  exam?: {
    id: string;
    name: string;
    fullName: string;
    category: string;
    icon: string;
    color: string;
    examDate: string;
    difficulty: string;
  };
}

// Use an array of IDs (Set is not serializable in Redux)
interface SubscriptionsStateSerializable {
  items: ExamSubscription[];
  subscribedExamIds: string[];
  loading: boolean;
}

const initialState: SubscriptionsStateSerializable = {
  items: [],
  subscribedExamIds: [],
  loading: false,
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<ExamSubscription[]>) => {
      state.items = action.payload;
      state.subscribedExamIds = action.payload.map((s) => s.examId);
    },
    addSubscription: (state, action: PayloadAction<ExamSubscription>) => {
      state.items.unshift(action.payload);
      if (!state.subscribedExamIds.includes(action.payload.examId)) {
        state.subscribedExamIds.push(action.payload.examId);
      }
    },
    removeSubscription: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((s) => s.examId !== action.payload);
      state.subscribedExamIds = state.subscribedExamIds.filter((id) => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setSubscriptions, addSubscription, removeSubscription, setLoading } =
  subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
