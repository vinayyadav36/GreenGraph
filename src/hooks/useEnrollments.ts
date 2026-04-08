import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { setEnrollments, addEnrollment, removeEnrollment } from '../store/enrollmentsSlice';
import api from '../lib/api';

export function useEnrollments() {
  const dispatch = useDispatch<AppDispatch>();
  const { enrolledCourseIds, isLoading } = useSelector((state: RootState) => state.enrollments);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const isEnrolled = (courseId: string) => enrolledCourseIds.includes(courseId);

  const fetchEnrollments = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get<Array<{ courseId: string }>>('/enrollments');
      dispatch(setEnrollments(res.data.map((e) => e.courseId)));
    } catch {
      // silently fail
    }
  };

  const enroll = async (courseId: string, email: string): Promise<boolean> => {
    try {
      await api.post('/enrollments', { courseId, email });
      dispatch(addEnrollment(courseId));
      return true;
    } catch {
      return false;
    }
  };

  const unenroll = async (courseId: string): Promise<boolean> => {
    try {
      await api.delete(`/enrollments/${courseId}`);
      dispatch(removeEnrollment(courseId));
      return true;
    } catch {
      return false;
    }
  };

  return { enrolledCourseIds, isLoading, isEnrolled, fetchEnrollments, enroll, unenroll };
}
