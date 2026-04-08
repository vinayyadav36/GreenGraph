import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../store';
import { setProgress } from '../store/progressSlice';
import api from '../lib/api';

export function useProgress() {
  const dispatch = useDispatch<AppDispatch>();

  const fetchProgress = async () => {
    try {
      const res = await api.get<Array<{ courseId: string; stageId: string; completed: boolean; completedAt?: string; score?: number }>>('/progress');
      dispatch(setProgress(res.data));
    } catch {
      // silently fail
    }
  };

  const saveProgress = async (courseId: string, stageId: string, score?: number) => {
    try {
      await api.post('/progress', { courseId, stageId, score });
    } catch {
      // silently fail
    }
  };

  return { fetchProgress, saveProgress };
}
