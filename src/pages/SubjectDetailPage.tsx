import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { mockCourses } from '../lib/mockData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const courseProgress = useSelector((state: RootState) => state.progress.courseProgress);

  const course = mockCourses.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-500 mb-4">This course doesn't exist or has been removed.</p>
          <Link to="/courses"><Button variant="primary">Back to Courses</Button></Link>
        </div>
      </div>
    );
  }

  const progress = courseProgress[course.id] || [];
  const completedCount = progress.filter((p) => p.completed).length;
  const progressPercent = course.stages.length > 0 ? Math.round((completedCount / course.stages.length) * 100) : 0;

  const difficultyVariant = course.difficultyTag === 'easy' ? 'success' : course.difficultyTag === 'medium' ? 'warning' : 'error';

  const totalMinutes = course.stages.reduce((sum, s) => sum + s.estimatedDurationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/courses" className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-6 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="info">{course.subject}</Badge>
                {course.difficultyTag && <Badge variant={difficultyVariant}>{course.difficultyTag}</Badge>}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{course.title}</h1>
              {course.shortDesc && <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">{course.shortDesc}</p>}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-blue-200">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {course.stages.length} stages
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}m` : ''} total
                </span>
                <span>{course.language.toUpperCase()}</span>
              </div>
            </div>

            {/* Progress Card */}
            {progressPercent > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[200px]">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{progressPercent}%</div>
                  <div className="text-blue-200 text-sm mb-3">Complete</div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="text-xs text-blue-200 mt-2">{completedCount} / {course.stages.length} stages done</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stage List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
            <div className="space-y-3">
              {course.stages.map((stage, index) => {
                const isCompleted = progress.some((p) => p.stageId === stage.id && p.completed);
                return (
                  <div
                    key={stage.id}
                    className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${
                      stage.locked ? 'opacity-60' : 'hover:border-blue-200 hover:shadow-sm cursor-pointer'
                    } ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}
                    onClick={() => !stage.locked && navigate(`/lessons/${stage.id}`)}
                  >
                    {/* Order / status */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' : stage.locked ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {isCompleted ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : stage.locked ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <span className="font-semibold text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{stage.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{stage.estimatedDurationMinutes} min</div>
                    </div>
                    {!stage.locked && !isCompleted && (
                      <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Get Started</h3>
              <Button
                variant="primary"
                size="lg"
                className="w-full mb-3"
                onClick={() => navigate(`/lessons/${course.stages.find((s) => !s.locked)?.id || course.stages[0].id}`)}
              >
                {progressPercent > 0 ? t('courses.continue') : t('courses.enroll')}
              </Button>
              {progressPercent === 0 && (
                <p className="text-xs text-gray-400 text-center">Free enrollment. Start learning immediately.</p>
              )}

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full lifetime access
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Certificate on completion
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Offline access available
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">TAGS</p>
                <div className="flex flex-wrap gap-1">
                  {course.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SubjectDetailPage;
