import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from './store';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastProvider } from './components/toasts/ToastProvider';
import { AuthGuard } from './features/auth/AuthGuard';
import { useAuth } from './hooks/useAuth';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CourseCatalogPage = lazy(() => import('./pages/CourseCatalogPage'));
const ExamSelectPage = lazy(() => import('./pages/ExamSelectPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const SubjectDetailPage = lazy(() => import('./pages/SubjectDetailPage'));
const LessonModulePage = lazy(() => import('./pages/LessonModulePage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const SignIn = lazy(() => import('./features/auth/SignIn'));
const SignUp = lazy(() => import('./features/auth/SignUp'));
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" aria-live="polite" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const { theme } = useSelector((state: RootState) => state.ui);
  const { restoreSession } = useAuth();

  useEffect(() => {
    // Restore JWT session on page load
    restoreSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CourseCatalogPage />} />
              <Route path="/courses/:id" element={<SubjectDetailPage />} />
              <Route path="/exams" element={<ExamSelectPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/lessons/:stageId" element={<LessonModulePage />} />
              <Route path="/quiz/:sessionId" element={<QuizPage />} />
              <Route path="/results/:resultId" element={<ResultPage />} />
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <ProfilePage />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <AuthGuard requiredRole="admin">
                    <AdminDashboardPage />
                  </AuthGuard>
                }
              />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="*"
                element={
                  <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
                      <p className="text-gray-500 mb-4">Page not found</p>
                      <a href="/" className="text-blue-600 hover:underline font-medium">← Back to Home</a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </div>
        <Footer />
        <ToastProvider />
      </div>
    </BrowserRouter>
  );
}

export default App;
