/**
 * DashboardPage — personal quick-overview for authenticated students.
 *
 * Layout:
 *   - Greeting banner (name + today's date)
 *   - 3 KPI tiles: enrolled courses, quiz streak, total points
 *   - Two-column: Today's schedule (2/3) | Upcoming assignments (1/3)
 *   - Quick links row
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { mockScheduleSlots, mockAssignments } from '../lib/mockData';
import { type ScheduleSlot, type Assignment, type AssignmentStatus } from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function todayDayOfWeek(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 7 : d; // return 1=Mon … 7=Sun
}

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
}

function isOverdue(dueDate: string, status: AssignmentStatus): boolean {
  return status !== 'submitted' && status !== 'graded' && new Date(dueDate) < new Date();
}

function daysUntil(dueDate: string): number {
  const diff = new Date(dueDate).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── sub-components ──────────────────────────────────────────────────────────

function KPICard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function ScheduleCard({ slot }: { slot: ScheduleSlot }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className={`w-1 self-stretch rounded-full bg-gradient-to-b ${slot.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{slot.courseName}</p>
        <p className="text-xs text-gray-500">{slot.room}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-gray-700">{formatTime(slot.startTime)}</p>
        <p className="text-xs text-gray-400">{formatTime(slot.endTime)}</p>
      </div>
    </div>
  );
}

function AssignmentRow({ asgn }: { asgn: Assignment }) {
  const overdue = isOverdue(asgn.dueDate, asgn.status);
  const days = daysUntil(asgn.dueDate);

  const statusColors: Record<AssignmentStatus, string> = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-yellow-100 text-yellow-700',
    submitted: 'bg-blue-100 text-blue-700',
    graded: 'bg-green-100 text-green-700',
  };

  const statusLabels: Record<AssignmentStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    submitted: 'Submitted',
    graded: 'Graded',
  };

  return (
    <div className="p-3 bg-gray-50 rounded-xl space-y-1">
      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{asgn.title}</p>
      <p className="text-xs text-gray-500">{asgn.courseName}</p>
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[asgn.status]}`}>
          {statusLabels[asgn.status]}
        </span>
        {asgn.status !== 'graded' && asgn.status !== 'submitted' && (
          <span className={`text-[11px] font-medium ${overdue ? 'text-red-600' : days <= 3 ? 'text-yellow-600' : 'text-gray-400'}`}>
            {overdue ? 'Overdue!' : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `${days}d left`}
          </span>
        )}
        {asgn.status === 'graded' && asgn.grade !== undefined && (
          <span className="text-[11px] font-bold text-green-700">{asgn.grade}%</span>
        )}
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const progress = useSelector((state: RootState) => state.progress);
  const enrollments = useSelector((state: RootState) => state.enrollments.items);

  const todayDow = todayDayOfWeek();
  const now = new Date();

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const todayDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Today's schedule slots, sorted by start time
  const todaySlots = useMemo(
    () =>
      mockScheduleSlots
        .filter((s) => s.dayOfWeek === todayDow)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [todayDow],
  );

  // Upcoming assignments: not graded, not submitted, sorted by due date (next 5)
  const upcomingAssignments = useMemo(
    () =>
      mockAssignments
        .filter((a) => a.status === 'not_started' || a.status === 'in_progress')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5),
    [],
  );

  const totalPoints = progress.totalPoints;
  const currentStreak = progress.currentStreak;
  const enrolledCount = enrollments.length;

  const quickLinks = [
    { label: 'Courses', to: '/courses', icon: '📚' },
    { label: 'Schedule', to: '/schedule', icon: '🗓️' },
    { label: 'Assignments', to: '/assignments', icon: '📝' },
    { label: 'Grades', to: '/grades', icon: '🎓' },
    { label: 'Exams', to: '/exams', icon: '✍️' },
    { label: 'Resources', to: '/resources', icon: '🔗' },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Greeting banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-blue-200 text-sm font-medium mb-1">{todayDate}</p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {greeting}, {user?.profile.displayName || 'Student'} 👋
          </h1>
          <p className="text-blue-100 mt-1 text-sm">Here's a summary of your learning activity today.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI tiles */}
        <section aria-label="Key stats">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard icon="📚" label="Enrolled Courses" value={enrolledCount} sub={enrolledCount === 1 ? '1 active course' : `${enrolledCount} active courses`} />
            <KPICard icon="🔥" label="Quiz Streak" value={`${currentStreak}d`} sub="Keep it going!" />
            <KPICard icon="⭐" label="Total Points" value={totalPoints} sub="Earned so far" />
          </div>
        </section>

        {/* Today's schedule + upcoming assignments */}
        <section aria-label="Today overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's classes */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-lg">Today's Classes</h2>
                <Link to="/schedule" className="text-sm text-blue-600 font-medium hover:underline">
                  Full schedule →
                </Link>
              </div>
              {todaySlots.length > 0 ? (
                <div className="space-y-3">
                  {todaySlots.map((slot) => (
                    <ScheduleCard key={slot.id} slot={slot} />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="font-semibold text-gray-900">No classes today!</p>
                  <p className="text-sm text-gray-500 mt-1">Enjoy your free day or catch up on assignments.</p>
                </div>
              )}
            </div>

            {/* Upcoming assignments */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-lg">Due Soon</h2>
                <Link to="/assignments" className="text-sm text-blue-600 font-medium hover:underline">
                  All →
                </Link>
              </div>
              {upcomingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAssignments.map((asgn) => (
                    <AssignmentRow key={asgn.id} asgn={asgn} />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-semibold text-gray-900">All caught up!</p>
                  <p className="text-sm text-gray-500 mt-1">No pending assignments.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section aria-label="Quick links">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Quick Links</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="text-xs font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
