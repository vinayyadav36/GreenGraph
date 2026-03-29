import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { setUser, clearUser, setLoading, setError } from '../store/authSlice';
import { setNotifications } from '../store/notificationsSlice';
import { setSubscriptions } from '../store/subscriptionsSlice';
import { type User } from '../types';
import api from '../lib/api';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const loadUserData = async () => {
    try {
      const [notifRes, subRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/subscriptions'),
      ]);
      dispatch(setNotifications(notifRes.data));
      dispatch(setSubscriptions(subRes.data));
    } catch {
      // non-critical, ignore
    }
  };

  const signIn = async (email: string, password: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      sessionStorage.setItem('access_token', token);
      dispatch(setUser(userData));
      await loadUserData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Sign in failed. Please check your credentials.';
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/register', {
        email,
        password,
        displayName,
      });
      const { token, user: userData } = res.data;
      sessionStorage.setItem('access_token', token);
      dispatch(setUser(userData));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Sign up failed. Please try again.';
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('access_token');
    dispatch(clearUser());
    dispatch(setNotifications([]));
    dispatch(setSubscriptions([]));
  };

  const restoreSession = async () => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await api.get<User>('/auth/me');
      dispatch(setUser(res.data));
      await loadUserData();
    } catch {
      sessionStorage.removeItem('access_token');
    }
  };

  return { user, isAuthenticated, isLoading, error, signIn, signUp, signOut, restoreSession };
}

