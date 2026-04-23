/**
 * SchedulePage — weekly timetable view for the authenticated student.
 *
 * Layout:
 *   - Day tabs (Mon – Sat)
 *   - Sorted list of class cards for the selected day
 *   - Empty state when no classes on that day
 */

import { useState } from 'react';
import { mockScheduleSlots } from '../lib/mockData';
import { type DayOfWeek, type ScheduleSlot } from '../types';

// ─── constants ───────────────────────────────────────────────────────────────

const DAYS: { label: string; short: string; dow: DayOfWeek }[] = [
  { label: 'Monday',    short: 'Mon', dow: 1 },
  { label: 'Tuesday',   short: 'Tue', dow: 2 },
  { label: 'Wednesday', short: 'Wed', dow: 3 },
  { label: 'Thursday',  short: 'Thu', dow: 4 },
  { label: 'Friday',    short: 'Fri', dow: 5 },
  { label: 'Saturday',  short: 'Sat', dow: 6 },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function todayDayOfWeek(): DayOfWeek {
  const d = new Date().getDay(); // 0=Sun
  // clamp to 1-6 (Mon-Sat); Sun becomes 1 (Mon) as fallback
  const mapped = d === 0 ? 1 : d > 6 ? 6 : (d as DayOfWeek);
  return mapped;
}

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
}

function durationLabel(start: string, end: string): string {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const mins = toMin(end) - toMin(start);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── sub-components ──────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: '📐',
  Physics: '⚛️',
  'Computer Science': '💻',
  Economics: '📊',
  History: '🏛️',
};

function SlotCard({ slot }: { slot: ScheduleSlot }) {
  const icon = SUBJECT_ICONS[slot.subject] ?? '📖';
  const duration = durationLabel(slot.startTime, slot.endTime);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex">
      {/* colour bar */}
      <div className={`w-1.5 shrink-0 bg-gradient-to-b ${slot.color}`} />
      <div className="flex-1 p-5">
        <div className="flex items-start gap-4">
          {/* icon */}
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${slot.color} flex items-center justify-center text-xl shrink-0`}>
            {icon}
          </div>
          {/* info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 leading-snug">{slot.courseName}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{slot.subject}</p>
          </div>
          {/* time */}
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-gray-800">{formatTime(slot.startTime)}</p>
            <p className="text-xs text-gray-400">– {formatTime(slot.endTime)}</p>
          </div>
        </div>
        {/* meta row */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {slot.room}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export function SchedulePage() {
  const todayDow = todayDayOfWeek();
  const [selectedDow, setSelectedDow] = useState<DayOfWeek>(todayDow);

  const slotsForDay = mockScheduleSlots
    .filter((s) => s.dayOfWeek === selectedDow)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const selectedDayLabel = DAYS.find((d) => d.dow === selectedDow)?.label ?? '';

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Weekly Schedule</h1>
          <p className="text-gray-500 text-sm">Your class timetable for the semester</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6" role="tablist" aria-label="Day selector">
          {DAYS.map((day) => {
            const isToday = day.dow === todayDow;
            const isActive = day.dow === selectedDow;
            const hasSlots = mockScheduleSlots.some((s) => s.dayOfWeek === day.dow);

            return (
              <button
                key={day.dow}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedDow(day.dow)}
                className={[
                  'flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 border',
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600',
                ].join(' ')}
              >
                <span>{day.short}</span>
                {isToday && (
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-200' : 'text-blue-600'}`}>
                    Today
                  </span>
                )}
                {!isToday && hasSlots && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-200' : 'bg-blue-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Slot list */}
        <div role="tabpanel" aria-label={`${selectedDayLabel} schedule`}>
          {slotsForDay.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {slotsForDay.length} class{slotsForDay.length !== 1 ? 'es' : ''} on {selectedDayLabel}
              </p>
              <div className="space-y-4">
                {slotsForDay.map((slot) => (
                  <SlotCard key={slot.id} slot={slot} />
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No classes on {selectedDayLabel}</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Use this day to review notes, complete assignments, or take a well-deserved break.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SchedulePage;
