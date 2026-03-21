import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function SignIn() {
  const { t } = useTranslation();
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password);
      dispatch(addToast({ message: 'Welcome back! Signed in successfully.', type: 'success' }));
      navigate('/courses');
    } catch {
      dispatch(addToast({ message: 'Sign in failed. Please check your credentials.', type: 'error' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">FU</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your Forever University account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label={t('auth.password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('rememberMe')}
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              {t('auth.signIn')}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-blue-600 font-medium hover:underline">
              {t('nav.signUp')}
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              <strong>Demo:</strong> Use any email + password (6+ chars) to sign in. Use "admin@..." for admin access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
