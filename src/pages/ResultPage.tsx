import { Link, useParams } from 'react-router-dom';
import { mockExamResults, mockExamSession } from '../lib/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

function CircularScore({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#CA8A04' : '#DC2626';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}

export function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();

  const result = mockExamResults.find((r) => r.id === resultId) || {
    id: resultId || 'demo',
    userId: '1',
    examId: mockExamSession.examId,
    score: 78,
    accuracy: 0.78,
    timeTakenSeconds: 2340,
    topicBreakdown: { 'Limits': 90, 'Derivatives': 75, 'Continuity': 70, 'Applications': 65 },
    createdAt: new Date().toISOString(),
  };

  const scoreVariant = result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'error';
  const minutes = Math.floor(result.timeTakenSeconds / 60);
  const seconds = result.timeTakenSeconds % 60;

  const insights = [
    result.score >= 80
      ? { text: 'Excellent performance! You have a strong grasp of the material.', icon: '🌟' }
      : result.score >= 60
      ? { text: 'Good effort! Review the weaker topics and try again for a higher score.', icon: '📚' }
      : { text: 'Keep practicing! Focus on understanding the core concepts before retrying.', icon: '💪' },
    {
      text: `Your accuracy was ${Math.round(result.accuracy * 100)}%. ${result.accuracy >= 0.8 ? 'Great precision!' : 'Work on eliminating guesses.'}`,
      icon: '🎯',
    },
    { text: `You completed the exam in ${minutes}m ${seconds}s. Time management is key in exams.`, icon: '⏱️' },
  ];

  const topicEntries = Object.entries(result.topicBreakdown).sort(([, a], [, b]) => b - a);

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Exam Results</h1>
          <p className="text-blue-200">Completed on {new Date(result.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <CircularScore score={result.score} />
          <div className="mt-4">
            <Badge variant={scoreVariant} className="text-sm px-3 py-1">
              {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{Math.round(result.accuracy * 100)}%</div>
              <div className="text-xs text-gray-500 mt-1">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{minutes}m {seconds}s</div>
              <div className="text-xs text-gray-500 mt-1">Time Taken</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{result.score}</div>
              <div className="text-xs text-gray-500 mt-1">Points Earned</div>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Topic Breakdown</h2>
          <div className="space-y-3">
            {topicEntries.map(([topic, score]) => (
              <div key={topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{topic}</span>
                  <span className={`font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Performance Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl shrink-0">{insight.icon}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/quiz/session-demo-1">
            <Button variant="primary" size="lg">Retry Exam</Button>
          </Link>
          <Link to="/courses">
            <Button variant="secondary" size="lg">Browse Courses</Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="lg">View Profile</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ResultPage;
