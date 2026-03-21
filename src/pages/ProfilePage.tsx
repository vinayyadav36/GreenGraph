import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store';
import { setUser } from '../store/authSlice';
import { addToast } from '../store/uiSlice';
import { useAuth } from '../hooks/useAuth';
import { mockExamResults } from '../lib/mockData';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const progress = useSelector((state: RootState) => state.progress);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.profile.displayName || '',
      email: user?.email || '',
    },
  });

  if (!user) return null;

  const totalCourses = Object.keys(progress.courseProgress).length;
  const completedStages = Object.values(progress.courseProgress).flat().filter((s) => s.completed).length;

  const onSave = async (data: ProfileFormData) => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    dispatch(setUser({
      ...user,
      email: data.email,
      profile: { ...user.profile, displayName: data.displayName },
    }));
    dispatch(addToast({ message: 'Profile updated successfully!', type: 'success' }));
    setIsEditing(false);
    setIsSaving(false);
  };

  const onCancel = () => {
    reset({ displayName: user.profile.displayName, email: user.email });
    setIsEditing(false);
  };

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Avatar name={user.profile.displayName} src={user.profile.avatarUrl} size="xl" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold">{user.profile.displayName}</h1>
          <p className="text-blue-200">{user.email}</p>
          <div className="mt-3">
            <Badge variant="primary">{user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Streak', value: `${progress.currentStreak}d`, icon: '🔥' },
            { label: 'Points', value: progress.totalPoints, icon: '⭐' },
            { label: 'Stages Done', value: completedStages, icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 text-lg">Profile Information</h2>
            {!isEditing && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <Input label="Display Name" error={errors.displayName?.message} {...register('displayName')} />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" isLoading={isSaving}>Save Changes</Button>
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4">
              {[
                { label: 'Display Name', value: user.profile.displayName },
                { label: 'Email', value: user.email },
                { label: 'Role', value: user.role },
                { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' }) },
                { label: 'Preferred Language', value: user.profile.preferredLanguage === 'en' ? 'English' : 'Hindi' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Recent Exam Results */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Recent Exam Results</h2>
          {mockExamResults.length === 0 ? (
            <p className="text-gray-500 text-sm">No exam results yet. Take a quiz to see your results here.</p>
          ) : (
            <div className="space-y-3">
              {mockExamResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.examId.replace(/-/g, ' ').replace(/exam/i, 'Exam')}</p>
                    <p className="text-xs text-gray-400">{new Date(result.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.score}%
                    </span>
                    <p className="text-xs text-gray-400">{Math.round(result.accuracy * 100)}% accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Summary */}
        {totalCourses > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Learning Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Courses started</span>
                <span className="font-semibold">{totalCourses}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Stages completed</span>
                <span className="font-semibold">{completedStages}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total points earned</span>
                <span className="font-semibold text-blue-600">{progress.totalPoints} pts</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfilePage;
