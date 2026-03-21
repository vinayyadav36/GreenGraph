import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { toggleTheme, setLanguage } from '../../store/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.ui);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  const handleLangToggle = () => {
    const next = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(next);
    dispatch(setLanguage(next));
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Forever University Home">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FU</span>
            </div>
            <span className="hidden sm:block font-bold text-gray-900 text-lg leading-tight">
              Forever<br />
              <span className="text-blue-600 text-xs font-medium leading-none">University</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/courses"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {t('nav.courses')}
            </Link>
            <Link
              to="/quiz/session-demo-1"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {t('nav.quiz')}
            </Link>
            {user?.role === 'admin' || user?.role === 'superadmin' ? (
              <Link
                to="/admin"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {t('nav.admin')}
              </Link>
            ) : null}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t('courses.search')}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
                aria-label={t('courses.search')}
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={handleLangToggle}
              className="hidden sm:flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-md transition-colors"
              aria-label="Toggle language"
            >
              {i18n.language === 'en' ? 'HI' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar name={user.profile.displayName} src={user.profile.avatarUrl} size="sm" />
                  <span className="hidden lg:block text-sm font-medium text-gray-700">{user.profile.displayName}</span>
                </Link>
                <button
                  onClick={() => { signOut(); navigate('/'); }}
                  className="hidden sm:block px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {t('nav.signUp')}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <form onSubmit={handleSearch} className="px-1 mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t('courses.search')}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </form>
            <Link to="/courses" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
              {t('nav.courses')}
            </Link>
            <Link to="/quiz/session-demo-1" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
              {t('nav.quiz')}
            </Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <button onClick={handleLangToggle} className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                {i18n.language === 'en' ? 'HI' : 'EN'}
              </button>
            </div>
            {isAuthenticated && user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={() => { signOut(); navigate('/'); setMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  {t('nav.signIn')}
                </Link>
                <Link to="/signup" className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
