import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { markStageComplete } from '../store/progressSlice';
import { addToast } from '../store/uiSlice';
import { mockCourses } from '../lib/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function LessonModulePage() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Find the stage and course
  let foundStage = null;
  let foundCourse = null;
  for (const course of mockCourses) {
    const stage = course.stages.find((s) => s.id === stageId);
    if (stage) {
      foundStage = stage;
      foundCourse = course;
      break;
    }
  }

  if (!foundStage || !foundCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
          <Link to="/courses"><Button variant="primary">Back to Courses</Button></Link>
        </div>
      </div>
    );
  }

  const stage = foundStage;
  const course = foundCourse;
  const stageIndex = course.stages.findIndex((s) => s.id === stageId);
  const prevStage = stageIndex > 0 ? course.stages[stageIndex - 1] : null;
  const nextStage = stageIndex < course.stages.length - 1 ? course.stages[stageIndex + 1] : null;

  const handleMarkComplete = () => {
    dispatch(markStageComplete({ courseId: course.id, stageId: stage.id }));
    dispatch(addToast({ message: `"${stage.title}" marked as complete! +10 points`, type: 'success' }));
    setCompleted(true);
    if (nextStage && !nextStage.locked) {
      setTimeout(() => navigate(`/lessons/${nextStage.id}`), 1500);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/courses/${course.id}`} className="text-gray-400 hover:text-gray-600 shrink-0">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{course.title}</p>
              <p className="text-sm font-medium text-gray-900 truncate">{stage.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="info">Stage {stageIndex + 1} of {course.stages.length}</Badge>
            {completed && <Badge variant="success">Completed ✓</Badge>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div
              className="bg-gray-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative cursor-pointer group"
              onClick={() => setIsPlaying(!isPlaying)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {/* Fake video thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-900 opacity-80" />
              <div className="relative text-center">
                <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                  <svg className="h-7 w-7 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                {isPlaying && (
                  <div className="flex items-center gap-1">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${20 + i * 8}px`, animationDelay: `${i * 0.15}s` }} />
                    ))}
                    <span className="text-white ml-2 text-sm">Playing...</span>
                  </div>
                )}
                {!isPlaying && (
                  <p className="text-white/80 text-sm">{stage.estimatedDurationMinutes} min lesson</p>
                )}
              </div>
            </div>

            {/* Stage Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{stage.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {stage.estimatedDurationMinutes} minutes
                </span>
              </div>
              <div className="prose prose-sm text-gray-600 leading-relaxed">
                <p>
                  Welcome to <strong>{stage.title}</strong>. In this lesson, you'll explore key concepts and build
                  a solid understanding of the topic through interactive examples and explanations.
                </p>
                <p className="mt-3">
                  This stage is part of the <em>{course.title}</em> course. Make sure you complete the lesson
                  and mark it as done to track your progress and earn points.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <Button
                variant={completed ? 'secondary' : 'primary'}
                size="lg"
                className="w-full mb-3"
                onClick={handleMarkComplete}
                disabled={completed}
              >
                {completed ? '✓ Completed' : 'Mark as Complete'}
              </Button>
              {completed && nextStage && !nextStage.locked && (
                <Button variant="ghost" size="md" className="w-full" onClick={() => navigate(`/lessons/${nextStage.id}`)}>
                  Next Lesson →
                </Button>
              )}
            </div>

            {/* Stage List */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Course Stages</h3>
              <div className="space-y-1">
                {course.stages.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => !s.locked && navigate(`/lessons/${s.id}`)}
                    disabled={s.locked}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      s.id === stageId ? 'bg-blue-50 text-blue-700 font-medium' : s.locked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center shrink-0">
                      {s.locked ? '🔒' : i + 1}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              {prevStage && (
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/lessons/${prevStage.id}`)}>
                  ← Prev
                </Button>
              )}
              {nextStage && !nextStage.locked && (
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/lessons/${nextStage.id}`)}>
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LessonModulePage;
