import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import progressReducer from './progressSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    progress: progressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
