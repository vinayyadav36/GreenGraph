import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { addSubscription, removeSubscription } from '../store/subscriptionsSlice';
import { addNotification } from '../store/notificationsSlice';
import api from '../lib/api';
import { v4 as uuidv4 } from 'uuid';

export function useSubscriptions() {
  const dispatch = useDispatch<AppDispatch>();
  const { subscribedExamIds, loading } = useSelector((state: RootState) => state.subscriptions);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const isSubscribed = (examId: string) => subscribedExamIds.includes(examId);

  const subscribe = async (examId: string) => {
    if (!isAuthenticated) return false;
    try {
      const res = await api.post('/subscriptions', { examId });
      dispatch(addSubscription({ id: res.data.id, examId, createdAt: res.data.createdAt }));
      // Add a local notification immediately
      dispatch(addNotification({
        id: uuidv4(),
        examId,
        examName: null,
        title: 'Exam Subscribed',
        message: 'You will now receive updates and reminders for this exam.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      }));
      return true;
    } catch {
      return false;
    }
  };

  const unsubscribe = async (examId: string) => {
    if (!isAuthenticated) return false;
    try {
      await api.delete(`/subscriptions/${examId}`);
      dispatch(removeSubscription(examId));
      return true;
    } catch {
      return false;
    }
  };

  return { isSubscribed, subscribe, unsubscribe, loading };
}
