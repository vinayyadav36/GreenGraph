/**
 * GradesPage — per-course grade breakdown for the authenticated student.
 *
 * Layout:
 *   - Summary row: average total, GPA-equivalent letter
 *   - Table/card for each course with CA, Midterm, Final, Total, Letter grade
 *   - Note: Final exam not yet conducted (shown as "–")
 */

import { mockGrades } from '../lib/mockData';
import { type GradeEntry } from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function letterColor(letter: string): string {
  if (letter.startsWith('A')) return 'text-green-700 bg-green-50 border-green-200';
  if (letter.startsWith('B')) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (letter.startsWith('C')) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

function totalColor(total: number): string {
  if (total >= 75) return 'text-green-700';
  if (total >= 60) return 'text-blue-700';
  if (total >= 50) return 'text-yellow-700';
  return 'text-red-600';
}

function scoreBar(score: number, max = 100) {
  const pct = Math.min(100, (score / max) * 100);
  const color = score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-blue-400' : score >= 40 ? 'bg-yellow-400' : 'bg-red-400';
  return { pct, color };
}

// ─── sub-components ──────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: '📐',
  Physics: '⚛️',
  'Computer Science': '💻',
  Economics: '📊',
  History: '🏛️',
};

function ScoreCell({ score, label }: { score: number | null; label: string }) {
  if (score === null) {
    return (
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-400">– (pending)</p>
      </div>
    );
  }
  const { pct, color } = scoreBar(score);
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mb-1">{score}%</p>
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function GradeCard({ entry }: { entry: GradeEntry }) {
  const icon = SUBJECT_ICONS[entry.subject] ?? '📖';
  const lc = letterColor(entry.letterGrade);
  const tc = totalColor(entry.total);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 leading-snug text-sm line-clamp-2">{entry.courseName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{entry.subject}</p>
        </div>
        {/* letter grade badge */}
        <span className={`shrink-0 text-lg font-bold px-3 py-1 rounded-xl border ${lc}`}>
          {entry.letterGrade}
        </span>
      </div>

      {/* score breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <ScoreCell score={entry.continuousAssessment} label="CA (30%)" />
        <ScoreCell score={entry.midterm} label="Midterm (30%)" />
        <ScoreCell score={entry.final > 0 ? entry.final : null} label="Final (40%)" />
      </div>

      {/* total */}
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">Total (so far)</p>
        <p className={`text-lg font-bold ${tc}`}>{entry.total}%</p>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

function overallGpa(grades: GradeEntry[]): string {
  if (grades.length === 0) return '–';
  const avg = grades.reduce((s, g) => s + g.total, 0) / grades.length;
  if (avg >= 85) return 'A+';
  if (avg >= 75) return 'A';
  if (avg >= 65) return 'B+';
  if (avg >= 55) return 'B';
  if (avg >= 45) return 'C';
  return 'F';
}

export function GradesPage() {
  const avgTotal = mockGrades.length > 0
    ? Math.round(mockGrades.reduce((s, g) => s + g.total, 0) / mockGrades.length)
    : 0;
  const gpa = overallGpa(mockGrades);

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Grades</h1>
          <p className="text-gray-500 text-sm">
            Semester performance across {mockGrades.length} courses — final exams pending
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary strip */}
        <section aria-label="Grade summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Courses</p>
              <p className="text-3xl font-bold text-gray-900">{mockGrades.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Average</p>
              <p className={`text-3xl font-bold ${totalColor(avgTotal)}`}>{avgTotal}%</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Overall Grade</p>
              <p className={`text-3xl font-bold ${gpa === 'F' ? 'text-red-700' : gpa.startsWith('A') ? 'text-green-700' : 'text-blue-700'}`}>
                {gpa}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Final Exam</p>
              <p className="text-lg font-bold text-gray-400">Pending</p>
              <p className="text-xs text-gray-400 mt-0.5">Upcoming</p>
            </div>
          </div>
        </section>

        {/* Grade key */}
        <section aria-label="Grade key">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Grade Key</p>
            <div className="flex flex-wrap gap-2">
              {[
                { grade: 'A+', range: '≥ 85%', color: 'bg-green-50 text-green-700 border-green-200' },
                { grade: 'A',  range: '75–84%', color: 'bg-green-50 text-green-700 border-green-200' },
                { grade: 'B+', range: '65–74%', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { grade: 'B',  range: '55–64%', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { grade: 'C',  range: '45–54%', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { grade: 'F',  range: '< 45%', color: 'bg-red-50 text-red-700 border-red-200' },
              ].map((item) => (
                <div key={item.grade} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${item.color}`}>
                  <span className="font-bold">{item.grade}</span>
                  <span className="opacity-75">{item.range}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Weighting note */}
        <p className="text-xs text-gray-400 -mt-4">
          * Weights: Continuous Assessment 30% · Midterm 30% · Final 40%. Total shown is based on completed components only.
        </p>

        {/* Course cards */}
        <section aria-label="Course grades">
          {mockGrades.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockGrades.map((entry) => (
                <GradeCard key={entry.courseId} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-5xl mb-4">📋</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No grades yet</h2>
              <p className="text-gray-500 text-sm">Grades will appear here once assessments are published.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default GradesPage;
