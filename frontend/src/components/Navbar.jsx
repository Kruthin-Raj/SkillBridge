import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, BASE_URL } from '../lib/api';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition relative z-10 ${
    isActive ? 'bg-cw-accent text-white shadow-sm' : 'text-cw-text-2 hover:bg-cw-bg-alt hover:text-cw-text-1'
  }`;

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  const initials = user
    ? (user.full_name || user.email || '?')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  // Live unread notification count via Server-Sent Events (SSE)
  useEffect(() => {
    if (!user) return;

    // We pass the token in the query string since EventSource does not support custom headers natively.
    const token = localStorage.getItem('skillbridge.token');
    const source = new EventSource(`${BASE_URL}/api/notifications/stream?token=${token}`);

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.unread_count === 'number') {
          setUnread(data.unread_count);
        }
      } catch (err) {
        // Ignore parse errors
      }
    };

    source.onerror = () => {
      // It will auto-reconnect, but we can log or handle if necessary.
    };

    return () => {
      source.close();
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    setDropdownOpen(false);
    signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cw-accent/10 bg-cw-surface/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        {/* Left: Avatar (if signed in) + Logo */}
        <div className="flex items-center gap-3 mr-auto">
          {user && (
            <div ref={dropdownRef} className="relative z-50">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="avatar-sm focus:ring-2 focus:ring-cw-accent focus:ring-offset-2 transition"
                title="Profile menu"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" />
                ) : (
                  initials
                )}
              </button>

              {dropdownOpen && (
                <div className="dropdown animate-fade-in border-cw-accent/10 bg-cw-surface shadow-md">
                  <div className="px-4 py-2 border-b border-cw-accent/10 bg-cw-bg-alt/50">
                    <p className="text-sm font-semibold text-cw-text-1 truncate">
                      {user.full_name || 'Student'}
                    </p>
                    <p className="text-xs text-cw-text-2 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item text-cw-text-1 hover:bg-cw-bg hover:text-cw-accent"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item text-cw-text-1 hover:bg-cw-bg hover:text-cw-accent"
                  >
                    Dashboard
                  </Link>
                  <button type="button" onClick={handleSignOut} className="dropdown-item text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          <Link to="/" className="text-xl font-bold tracking-tight font-serif text-cw-text-1">
            Skill<span className="text-cw-accent italic">Bridge</span>
          </Link>
        </div>

        {/* Center: Nav links */}
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>
        <NavLink to="/browse" className={linkClass}>
          Browse
        </NavLink>

        {user ? (
          <>
            <NavLink to="/exchanges" className={linkClass}>
              Matches
            </NavLink>
            <NavLink to="/new" className={linkClass}>
              Post
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>

            {/* Notification bell */}
            <Link
              to="/notifications"
              className="relative rounded-lg p-2 text-cw-text-2 transition hover:bg-cw-bg-alt hover:text-cw-accent z-10"
              title="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn-primary ml-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            Sign in
          </Link>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className="ml-2 rounded-lg p-2 text-cw-text-2 transition hover:bg-cw-bg-alt hover:text-cw-accent z-10"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="19.36" x2="19.78" y2="20.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </nav>
    </header>
  );
}
