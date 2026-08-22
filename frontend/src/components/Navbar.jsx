import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-auto text-lg font-bold tracking-tight">
          Skill<span className="text-freelance">Bridge</span>
        </Link>

        <NavLink to="/" className={linkClass} end>
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
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <button type="button" onClick={handleSignOut} className="btn-ghost ml-2">
              Sign out
            </button>
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
