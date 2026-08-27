import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, signOut } = useAuth();
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

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    api.notifications.list().then((r) => setUnread(r.unread_count)).catch(() => {});
    const interval = setInterval(() => {
      api.notifications.list().then((r) => setUnread(r.unread_count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        {/* Left: Avatar (if signed in) + Logo */}
        <div className="flex items-center gap-3 mr-auto">
          {user && (
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="avatar-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition"
                title="Profile menu"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" />
                ) : (
                  initials
                )}
              </button>

              {dropdownOpen && (
                <div className="dropdown animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user.full_name || 'Student'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item"
                  >
                    Dashboard
                  </Link>
                  <button type="button" onClick={handleSignOut} className="dropdown-item text-red-600">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          <Link to="/" className="text-lg font-bold tracking-tight">
            Skill<span className="text-freelance">Bridge</span>
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
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
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
          <Link to="/login" className="btn-primary ml-2">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
