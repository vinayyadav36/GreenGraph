import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mockCourses, examCards, resourceLinks } from '../lib/mockData';
import { Badge } from '../components/ui/Badge';
import { type ExamCard } from '../types';

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600">{value}</div>
      <div className="text-gray-600 text-sm mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function CourseCard({ course }: { course: (typeof mockCourses)[0] }) {
  const difficultyVariant =
    course.difficultyTag === 'easy' ? 'success' : course.difficultyTag === 'medium' ? 'warning' : 'error';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="info">{course.subject}</Badge>
          <Badge variant={difficultyVariant}>{course.difficultyTag}</Badge>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 leading-tight">{course.title}</h3>
        <p className="text-gray-500 text-xs mb-4 leading-relaxed line-clamp-2">{course.shortDesc}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span>{course.stages.length} stages</span>
          <span>{course.tags.slice(0, 2).join(', ')}</span>
        </div>
        <Link
          to={`/courses/${course.id}`}
          className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}

function ExamCardPreview({ exam }: { exam: ExamCard }) {
  return (
    <Link
      to={`/quiz/${exam.sessionId}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 flex flex-col"
    >
      <div className={`h-1.5 bg-gradient-to-r ${exam.color}`} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${exam.color} flex items-center justify-center text-xl`}>
            {exam.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{exam.name}</h3>
            <p className="text-xs text-gray-400">{exam.category}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{exam.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{exam.questionCount} questions</span>
          <span className="text-blue-600 font-medium group-hover:underline">Practice →</span>
        </div>
      </div>
    </Link>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const featuredCourses = mockCourses.slice(0, 3);
  const featuredExams = examCards.slice(0, 6);
  const featuredResources = resourceLinks.slice(0, 4);

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              Now with offline learning support
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                {t('landing.getStarted')}
              </Link>
              <Link
                to="/exams"
                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Explore Exams
              </Link>
              <Link
                to="/courses"
                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                {t('landing.browseCourses')}
              </Link>
            </div>
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 fill-gray-50">
            <path d="M0,60 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="50,000+" label="Active Students" />
            <StatCard value="10+" label="Competitive Exams" />
            <StatCard value="200+" label="Expert Courses" />
            <StatCard value="98%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* Competitive Exam Cards */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Prepare for Any Competitive Exam</h2>
            <p className="text-gray-500 mt-1">Topic-wise questions, previous year papers & mock tests for India's top exams</p>
          </div>
          <Link to="/exams" className="hidden sm:flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm">
            View all exams
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredExams.map((exam) => (
            <ExamCardPreview key={exam.id} exam={exam} />
          ))}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link to="/exams" className="text-blue-600 font-medium hover:underline">View all exams →</Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('landing.whyChooseUs')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to learn, practice, and succeed — all in one platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title={t('landing.feature1Title')}
              desc={t('landing.feature1Desc')}
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              title={t('landing.feature2Title')}
              desc={t('landing.feature2Desc')}
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              }
              title={t('landing.feature3Title')}
              desc={t('landing.feature3Desc')}
            />
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Top Study Resources</h2>
            <p className="text-gray-500 mt-1">GKToday, Oliveboard, PracticeMock & more — all in one place</p>
          </div>
          <Link to="/resources" className="hidden sm:flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm">
            All resources
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredResources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center text-xl mb-3`}>
                {resource.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{resource.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{resource.category}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{resource.description}</p>
              <div className="mt-3 text-xs text-blue-600 font-medium group-hover:underline">Visit →</div>
            </a>
          ))}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link to="/resources" className="text-blue-600 font-medium hover:underline">All resources →</Link>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('landing.featuredCourses')}</h2>
              <p className="text-gray-500 mt-1">Hand-picked courses to kickstart your journey</p>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm">
              View all courses
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/courses" className="text-blue-600 font-medium hover:underline">View all courses →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your learning journey?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join over 50,000 students preparing for UPSC, SSC, Banking, Railways and more.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/exams"
              className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Choose Your Exam
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
