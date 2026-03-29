import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import progressReducer from './progressSlice';
import notificationsReducer from './notificationsSlice';
import subscriptionsReducer from './subscriptionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    progress: progressReducer,
    notifications: notificationsReducer,
    subscriptions: subscriptionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
