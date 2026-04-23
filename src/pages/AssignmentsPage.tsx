/**
 * AssignmentsPage — track all assignments across courses.
 *
 * Layout:
 *   - Filter bar: status tabs + course selector
 *   - Grid of assignment cards with due date, status badge, grade
 *   - Empty state when filters produce no results
 */

import { useState, useMemo } from 'react';
import { mockAssignments } from '../lib/mockData';
import { type Assignment, type AssignmentStatus } from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function isOverdue(dueDate: string, status: AssignmentStatus): boolean {
  return status !== 'submitted' && status !== 'graded' && new Date(dueDate) < new Date();
}

function daysUntilLabel(dueDate: string, status: AssignmentStatus): string {
  if (status === 'submitted') return 'Submitted';
  if (status === 'graded') return 'Graded';
  if (isOverdue(dueDate, status)) return 'Overdue!';

  const diff = Math.ceil((new Date(dueDate).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `${diff}d left`;
}

function dueLabelColor(dueDate: string, status: AssignmentStatus): string {
  if (status === 'submitted' || status === 'graded') return 'text-gray-400';
  if (isOverdue(dueDate, status)) return 'text-red-600 font-semibold';
  const diff = Math.ceil((new Date(dueDate).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  if (diff <= 2) return 'text-yellow-600 font-semibold';
  return 'text-gray-500';
}

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  graded: 'Graded',
};

const STATUS_COLORS: Record<AssignmentStatus, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-blue-100 text-blue-700',
  graded: 'bg-green-100 text-green-700',
};

// ─── sub-components ──────────────────────────────────────────────────────────

function AssignmentCard({ asgn }: { asgn: Assignment }) {
  const overdue = isOverdue(asgn.dueDate, asgn.status);

  return (
    <div
      className={[
        'bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3',
        overdue ? 'border-red-200' : 'border-gray-100',
      ].join(' ')}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
          {asgn.subject}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[asgn.status]}`}>
          {STATUS_LABELS[asgn.status]}
        </span>
      </div>

      {/* title */}
      <h3 className="font-semibold text-gray-900 leading-snug">{asgn.title}</h3>
      <p className="text-xs text-gray-500">{asgn.courseName}</p>

      {/* footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-50">
        {/* due date */}
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Due date</p>
          <p className="text-xs font-medium text-gray-700">
            {new Date(asgn.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* countdown / grade */}
        <div className="text-right">
          <p className={`text-sm font-semibold ${dueLabelColor(asgn.dueDate, asgn.status)}`}>
            {daysUntilLabel(asgn.dueDate, asgn.status)}
          </p>
          {asgn.status === 'graded' && asgn.grade !== undefined && (
            <p className={`text-xs font-bold ${asgn.grade >= 80 ? 'text-green-600' : asgn.grade >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {asgn.grade} / {asgn.maxMarks}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

type StatusFilter = AssignmentStatus | 'all';

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'not_started', label: 'Not Started' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'graded', label: 'Graded' },
];

export function AssignmentsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [courseFilter, setCourseFilter] = useState('');

  const courses = useMemo(
    () => ['All', ...Array.from(new Set(mockAssignments.map((a) => a.courseName)))],
    [],
  );

  const filtered = useMemo(() => {
    return mockAssignments
      .filter((a) => statusFilter === 'all' || a.status === statusFilter)
      .filter((a) => !courseFilter || courseFilter === 'All' || a.courseName === courseFilter)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [statusFilter, courseFilter]);

  const overdueCount = mockAssignments.filter((a) => isOverdue(a.dueDate, a.status)).length;

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Assignments</h1>
              <p className="text-gray-500 text-sm">{mockAssignments.length} assignments across all courses</p>
            </div>
            {overdueCount > 0 && (
              <div className="shrink-0 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm font-medium">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                {overdueCount} overdue
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Status tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={statusFilter === tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap border',
                  statusFilter === tab.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Course selector */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            aria-label="Filter by course"
          >
            {courses.map((c) => (
              <option key={c} value={c === 'All' ? '' : c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Results info */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} assignment{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((asgn) => (
              <AssignmentCard key={asgn.id} asgn={asgn} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-5xl mb-4">📭</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No assignments found</h2>
            <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default AssignmentsPage;
