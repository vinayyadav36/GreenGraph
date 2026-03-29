import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { examCards } from '../lib/mockData';
import { type ExamCard } from '../types';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { addToast } from '../store/uiSlice';

const categoryColors: Record<string, string> = {
  'Central Government': 'bg-blue-100 text-blue-700',
  'Banking': 'bg-green-100 text-green-700',
  'Railway': 'bg-purple-100 text-purple-700',
  'Medical': 'bg-red-100 text-red-700',
  'Engineering': 'bg-yellow-100 text-yellow-700',
  'Management': 'bg-indigo-100 text-indigo-700',
  'Defence': 'bg-gray-100 text-gray-700',
  'Law': 'bg-amber-100 text-amber-700',
  'General': 'bg-cyan-100 text-cyan-700',
};

function DifficultyDots({ difficulty }: { difficulty: ExamCard['difficulty'] }) {
  const levels = { easy: 1, medium: 2, hard: 3 };
  const level = levels[difficulty];
  const colors = { easy: 'bg-green-400', medium: 'bg-yellow-400', hard: 'bg-red-400' };
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= level ? colors[difficulty] : 'bg-gray-200'}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1 capitalize">{difficulty}</span>
    </div>
  );
}

function ExamCardComponent({ exam }: { exam: ExamCard }) {
  const { isSubscribed, subscribe, unsubscribe } = useSubscriptions();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [subLoading, setSubLoading] = useState(false);
  const subscribed = isSubscribed(exam.id);

  const handleSubscribeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(addToast({ message: 'Please sign in to subscribe to exams.', type: 'info' }));
      navigate('/signin');
      return;
    }
    setSubLoading(true);
    if (subscribed) {
      const ok = await unsubscribe(exam.id);
      if (ok) dispatch(addToast({ message: `Unsubscribed from ${exam.name}`, type: 'info' }));
    } else {
      const ok = await subscribe(exam.id);
      if (ok) dispatch(addToast({ message: `Subscribed to ${exam.name}! You'll receive updates.`, type: 'success' }));
      else dispatch(addToast({ message: 'Could not subscribe. Please try again.', type: 'error' }));
    }
    setSubLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-200 flex flex-col group">
      {/* Gradient Top Bar */}
      <div className={`h-2 bg-gradient-to-r ${exam.color}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exam.color} flex items-center justify-center text-2xl shadow-sm`}>
              {exam.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">{exam.name}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 inline-block ${categoryColors[exam.category] || 'bg-gray-100 text-gray-600'}`}>
                {exam.category}
              </span>
            </div>
          </div>
          {/* Subscribe Bell */}
          <button
            onClick={handleSubscribeToggle}
            disabled={subLoading}
            className={`shrink-0 p-1.5 rounded-lg border transition-all ${
              subscribed
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500'
            }`}
            aria-label={subscribed ? `Unsubscribe from ${exam.name}` : `Subscribe to ${exam.name}`}
            title={subscribed ? 'Unsubscribe' : 'Subscribe for updates'}
          >
            <svg className="h-4 w-4" fill={subscribed ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Full Name */}
        <p className="text-xs text-gray-500 mb-2 leading-relaxed font-medium">{exam.fullName}</p>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-1 line-clamp-2">{exam.description}</p>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="text-xs text-gray-400 mb-0.5">Vacancies</div>
            <div className="text-xs font-semibold text-gray-700">{exam.vacancies}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="text-xs text-gray-400 mb-0.5">Exam Date</div>
            <div className="text-xs font-semibold text-gray-700">{exam.examDate}</div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between mb-4">
          <DifficultyDots difficulty={exam.difficulty} />
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
            {exam.questionCount} questions
          </span>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1 mb-4">
          {exam.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{topic}</span>
          ))}
          {exam.topics.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{exam.topics.length - 3} more</span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/quiz/${exam.sessionId}`}
          className={`block w-full text-center py-2.5 px-4 bg-gradient-to-r ${exam.color} text-white text-sm font-semibold rounded-xl transition-opacity hover:opacity-90 shadow-sm`}
        >
          Start Practice →
        </Link>
      </div>
    </div>
  );
}

const ALL_CATEGORIES = 'All';

export function ExamSelectPage() {
  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(examCards.map((e) => e.category)))],
    [],
  );
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return examCards.filter((exam) => {
      const matchesCat = activeCategory === ALL_CATEGORIES || exam.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        exam.name.toLowerCase().includes(q) ||
        exam.fullName.toLowerCase().includes(q) ||
        exam.category.toLowerCase().includes(q) ||
        exam.topics.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-5">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              {examCards.length} Exams Available
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Choose Your Competitive Exam
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Practice with real exam-style questions, previous year papers, and topic-wise mock tests for UPSC, SSC, Banking, Railways, NEET, JEE and more.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Row */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams, topics..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              aria-label="Search exams"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-5">
          Showing {filtered.length} exam{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== ALL_CATEGORIES ? ` in ${activeCategory}` : ''}
        </p>

        {/* Exam Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((exam) => (
              <ExamCardComponent key={exam.id} exam={exam} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-500 text-sm">Try a different search term or category</p>
          </div>
        )}

        {/* Bottom Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Need more resources?</h3>
              <p className="text-blue-100 text-sm">Access GKToday, Oliveboard, PracticeMock, and more free study resources.</p>
            </div>
            <Link
              to="/resources"
              className="shrink-0 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Explore Resources →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ExamSelectPage;
