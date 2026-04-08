import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../store';
import { addToast } from '../store/uiSlice';
import { addPoints } from '../store/progressSlice';
import { mockExamSession, examSessionQuestions } from '../lib/mockData';
import { useExamTimer } from '../hooks/useExamTimer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import api from '../lib/api';

type ConfidenceLevel = 'confident' | 'guess';
interface Answer {
  selected: string | string[];
  confidence: ConfidenceLevel;
  timeTaken: number;
}

interface ApiQuestion {
  id: string;
  examId: string;
  text: string;
  options: string[];
  correct: string;
  type: string;
  difficulty: string;
  tags: string[];
  explanation: string;
  trick?: string;
}

export function QuizPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const session = sessionId === 'session-demo-1' ? mockExamSession : {
    ...mockExamSession,
    sessionId: sessionId || 'demo',
    questions: examSessionQuestions[sessionId || ''] || examSessionQuestions['session-demo-1'],
  };

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [confidence, setConfidence] = useState<ConfidenceLevel>('confident');
  const [submitted, setSubmitted] = useState(false);
  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[] | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setIsLoadingQuestions(true);
    api.get<ApiQuestion[]>(`/questions/${sessionId}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setApiQuestions(res.data);
        }
      })
      .catch(() => {
        // fallback to mock data
      })
      .finally(() => setIsLoadingQuestions(false));
  }, [sessionId]);

  const handleExpire = useCallback(() => {
    dispatch(addToast({ message: 'Time is up! Submitting your exam.', type: 'warning' }));
    handleSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { formatted, secondsLeft } = useExamTimer(30 * 60, handleExpire);

  const questions = apiQuestions
    ? apiQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correct: q.correct,
        type: q.type as 'single' | 'multi',
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        explanation: q.explanation,
      }))
    : session.questions;

  const currentQ = questions[currentIdx];

  const selectedAnswer = answers[currentQ?.id]?.selected;

  const handleOptionClick = (option: string) => {
    if (!currentQ || submitted) return;
    if (currentQ.type === 'multi') {
      const prev = (selectedAnswer as string[]) || [];
      const next = prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option];
      setAnswers((a) => ({ ...a, [currentQ.id]: { selected: next, confidence, timeTaken: 0 } }));
    } else {
      setAnswers((a) => ({ ...a, [currentQ.id]: { selected: option, confidence, timeTaken: 0 } }));
    }
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    let correctCount = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans) return;
      const isCorrect = Array.isArray(q.correct)
        ? JSON.stringify([...(ans.selected as string[])].sort()) === JSON.stringify([...(q.correct as string[])].sort())
        : ans.selected === q.correct;
      if (isCorrect) correctCount++;
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const timeTakenSeconds = 30 * 60 - secondsLeft;
    const accuracy = questions.length > 0 ? correctCount / questions.length : 0;

    dispatch(addPoints(score));

    try {
      const res = await api.post<{ id: string }>('/results', {
        examId: sessionId,
        score,
        accuracy,
        timeTakenSeconds,
        topicBreakdown: {},
      });
      dispatch(addToast({ message: `Submitted! Score: ${score}%`, type: 'success' }));
      setTimeout(() => navigate(`/results/${res.data.id}`), 2000);
    } catch {
      dispatch(addToast({ message: `Submitted! Score: ${score}%`, type: 'success' }));
      setTimeout(() => navigate(`/results/demo`), 2000);
    }
  };

  const isMultiSelected = (option: string) => Array.isArray(selectedAnswer) && selectedAnswer.includes(option);
  const isSingleSelected = (option: string) => !Array.isArray(selectedAnswer) && selectedAnswer === option;
  const isSelected = (option: string) => currentQ?.type === 'multi' ? isMultiSelected(option) : isSingleSelected(option);

  const progressPercent = Math.round((Object.keys(answers).length / questions.length) * 100);
  const isLowTime = secondsLeft <= 300;

  if (isLoadingQuestions) {
    return (
      <main id="main-content" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading questions...</p>
        </div>
      </main>
    );
  }

  if (!currentQ) return null;

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">{t('quiz.title')}</span>
              <Badge variant="default">{Object.keys(answers).length}/{questions.length} answered</Badge>
            </div>
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${isLowTime ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatted}
            </div>
            <Button variant="danger" size="sm" onClick={handleSubmit}>
              Submit Exam
            </Button>
          </div>
          {/* Progress */}
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Question */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    {t('quiz.question')} {currentIdx + 1} of {questions.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={currentQ.difficulty === 'easy' ? 'success' : currentQ.difficulty === 'medium' ? 'warning' : 'error'}>
                      {currentQ.difficulty}
                    </Badge>
                    {currentQ.type === 'multi' && <Badge variant="info">Multiple answers</Badge>}
                    {flagged.has(currentQ.id) && <Badge variant="warning">Flagged</Badge>}
                  </div>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`shrink-0 p-2 rounded-lg transition-colors ${flagged.has(currentQ.id) ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-500'}`}
                  aria-label={flagged.has(currentQ.id) ? 'Remove flag' : 'Flag question'}
                  title={t('quiz.flag')}
                >
                  <svg className="h-5 w-5" fill={flagged.has(currentQ.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </button>
              </div>
              <h2 className="text-lg font-medium text-gray-900 leading-relaxed">{currentQ.text}</h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, i) => {
                const selected = isSelected(option);
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(option)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 text-gray-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                      selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-500'
                    }`}>
                      {selected ? '✓' : String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Confidence */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">How confident are you?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfidence('confident')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${confidence === 'confident' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-green-50'}`}
                >
                  {t('quiz.confident')}
                </button>
                <button
                  onClick={() => setConfidence('guess')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${confidence === 'guess' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-yellow-50'}`}
                >
                  {t('quiz.guess')}
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0} className="flex-1">
                ← Previous
              </Button>
              {currentIdx < questions.length - 1 ? (
                <Button variant="primary" size="md" onClick={() => setCurrentIdx((i) => i + 1)} className="flex-1">
                  {t('quiz.next')}
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={handleSubmit} className="flex-1">
                  Submit Exam
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-36">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[q.id];
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = i === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`h-9 w-full rounded-lg text-sm font-medium transition-all border-2 ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : isFlagged
                          ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                          : isAnswered
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300'
                      }`}
                      aria-label={`Question ${i + 1}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
                      aria-current={isCurrent ? 'true' : undefined}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300" /> Answered
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" /> Flagged
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" /> Unanswered
                </div>
              </div>
              <Button variant="danger" size="sm" className="w-full mt-4" onClick={handleSubmit}>
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default QuizPage;
