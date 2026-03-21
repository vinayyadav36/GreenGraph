import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setUser, clearUser, setLoading, setError } from '../store/authSlice';
import { User } from '../types';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const signIn = async (email: string, _password: string) => {
    dispatch(setLoading(true));
    try {
      const mockUser: User = {
        id: '1',
        email,
        role: email.includes('admin') ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
        profile: {
          displayName: email.split('@')[0],
          preferredLanguage: 'en',
        },
      };
      sessionStorage.setItem('access_token', 'mock_token_123');
      dispatch(setUser(mockUser));
    } catch {
      dispatch(setError('Sign in failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('access_token');
    dispatch(clearUser());
  };

  return { user, isAuthenticated, isLoading, error, signIn, signOut };
}
