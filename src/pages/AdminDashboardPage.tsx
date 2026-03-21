import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { mockCourses, mockExamResults } from '../lib/mockData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

function StatCard({ label, value, icon, change }: { label: string; value: string | number; icon: string; change?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const progress = useSelector((state: RootState) => state.progress);

  const totalStagesCompleted = Object.values(progress.courseProgress).flat().filter((s) => s.completed).length;

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Manage and monitor the Forever University platform</p>
            </div>
            <Badge variant="primary">{user?.role}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Courses" value={mockCourses.length} icon="📚" change="+2 this month" />
          <StatCard label="Active Students" value="50,284" icon="👥" change="+1,230 this month" />
          <StatCard label="Exams Completed" value={mockExamResults.length} icon="📝" />
          <StatCard label="Stages Completed" value={totalStagesCompleted} icon="✅" />
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Recent Exam Results</h2>
            <div className="space-y-3">
              {mockExamResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.examId}</p>
                    <p className="text-xs text-gray-400">User ID: {result.userId}</p>
                    <p className="text-xs text-gray-400">{new Date(result.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'error'}>
                      {result.score}%
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">{Math.round(result.timeTakenSeconds / 60)}m taken</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Course Overview</h2>
            <div className="space-y-3">
              {mockCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                    <p className="text-xs text-gray-400">{course.stages.length} stages • {course.subject}</p>
                  </div>
                  <Badge variant={course.difficultyTag === 'easy' ? 'success' : course.difficultyTag === 'medium' ? 'warning' : 'error'}>
                    {course.difficultyTag}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => alert('Course editor coming soon!')}>
              + Add Course
            </Button>
            <Button variant="secondary" onClick={() => alert('Question bank coming soon!')}>
              + Add Questions
            </Button>
            <Button variant="secondary" onClick={() => alert('User management coming soon!')}>
              Manage Users
            </Button>
            <Button variant="ghost" onClick={() => alert('Reports coming soon!')}>
              Export Reports
            </Button>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <h2 className="font-bold text-gray-900 mb-3">Platform Health</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'API Uptime', value: '99.9%', status: 'success' },
              { label: 'Avg. Response', value: '120ms', status: 'success' },
              { label: 'Error Rate', value: '0.01%', status: 'success' },
            ].map(({ label, value, status }) => (
              <div key={label} className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <Badge variant={status as 'success'}>{status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboardPage;
