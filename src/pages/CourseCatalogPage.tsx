import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mockCourses } from '../lib/mockData';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Course } from '../types';

function DifficultyBadge({ difficulty }: { difficulty: Course['difficultyTag'] }) {
  if (!difficulty) return null;
  const map = { easy: 'success', medium: 'warning', hard: 'error' } as const;
  return <Badge variant={map[difficulty]}>{difficulty}</Badge>;
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 flex flex-col">
      <div className={`h-1.5 ${course.difficultyTag === 'easy' ? 'bg-green-400' : course.difficultyTag === 'medium' ? 'bg-yellow-400' : 'bg-red-400'}`} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="info">{course.subject}</Badge>
          <DifficultyBadge difficulty={course.difficultyTag} />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{course.title}</h3>
        {course.shortDesc && <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">{course.shortDesc}</p>}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
          ))}
        </div>

        {/* Progress */}
        {(course.progressPercent ?? 0) > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{course.progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {course.stages.length} stages
          </span>
          <span>{course.language.toUpperCase()}</span>
        </div>

        <Link
          to={`/courses/${course.id}`}
          className={`block w-full text-center py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            (course.progressPercent ?? 0) > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {(course.progressPercent ?? 0) > 0 ? 'Continue Learning' : 'Enroll Now'}
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex justify-between mb-3">
        <Skeleton width={80} height={22} variant="rectangular" />
        <Skeleton width={60} height={22} variant="rectangular" />
      </div>
      <Skeleton className="mb-2" height={20} />
      <Skeleton lines={2} className="mb-4" />
      <Skeleton height={36} variant="rectangular" />
    </div>
  );
}

export function CourseCatalogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading] = useState(false);

  const initialQuery = searchParams.get('q') || '';
  const initialSubject = searchParams.get('subject') || '';
  const [rawSearch, setRawSearch] = useState(initialQuery);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [subject, setSubject] = useState(initialSubject);

  const search = useDebouncedValue(rawSearch, 300);

  const subjects = useMemo(() => ['All', ...Array.from(new Set(mockCourses.map((c) => c.subject)))], []);

  const filtered = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch =
        !search ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.subject.toLowerCase().includes(search.toLowerCase()) ||
        course.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesDifficulty = difficulty === 'all' || course.difficultyTag === difficulty;
      const matchesSubject = !subject || subject === 'All' || course.subject === subject;
      return matchesSearch && matchesDifficulty && matchesSubject;
    });
  }, [search, difficulty, subject]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawSearch(e.target.value);
    setSearchParams((prev) => {
      if (e.target.value) prev.set('q', e.target.value);
      else prev.delete('q');
      return prev;
    });
  };

  const difficultyTabs = ['all', 'easy', 'medium', 'hard'] as const;

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('courses.title')}</h1>
          <p className="text-gray-500">Discover {mockCourses.length} courses across multiple subjects</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={rawSearch}
              onChange={handleSearchChange}
              placeholder={t('courses.search')}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              aria-label={t('courses.search')}
            />
          </div>

          {/* Subject Filter */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            aria-label="Filter by subject"
          >
            {subjects.map((s) => (
              <option key={s} value={s === 'All' ? '' : s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Tabs */}
        <div className="flex gap-2 mb-6">
          {difficultyTabs.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                difficulty === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {t(`courses.${d}` as const)}
            </button>
          ))}
        </div>

        {/* Results info */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default CourseCatalogPage;
