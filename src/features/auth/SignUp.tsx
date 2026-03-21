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

const schema = z
  .object({
    displayName: z.string().min(1, 'Display name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export function SignUp() {
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
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password);
      dispatch(addToast({ message: 'Account created successfully! Welcome to Forever University.', type: 'success' }));
      navigate('/courses');
    } catch {
      dispatch(addToast({ message: 'Sign up failed. Please try again.', type: 'error' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">FU</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join thousands of learners at Forever University</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
              label={t('auth.displayName')}
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              error={errors.displayName?.message}
              {...register('displayName')}
            />

            <Input
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('auth.password')}
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              helperText="Use at least 8 characters with a mix of letters and numbers"
              {...register('password')}
            />

            <Input
              label={t('auth.confirmPassword')}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              {t('auth.signUp')}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.haveAccount')}{' '}
            <Link to="/signin" className="text-blue-600 font-medium hover:underline">
              {t('nav.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
