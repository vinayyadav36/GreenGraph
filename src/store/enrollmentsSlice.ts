import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface EnrollmentsState {
  enrolledCourseIds: string[];
  isLoading: boolean;
}

const initialState: EnrollmentsState = {
  enrolledCourseIds: [],
  isLoading: false,
};

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    setEnrollments: (state, action: PayloadAction<string[]>) => {
      state.enrolledCourseIds = action.payload;
    },
    addEnrollment: (state, action: PayloadAction<string>) => {
      if (!state.enrolledCourseIds.includes(action.payload)) {
        state.enrolledCourseIds.push(action.payload);
      }
    },
    removeEnrollment: (state, action: PayloadAction<string>) => {
      state.enrolledCourseIds = state.enrolledCourseIds.filter((id) => id !== action.payload);
    },
    setEnrollmentsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setEnrollments, addEnrollment, removeEnrollment, setEnrollmentsLoading } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
