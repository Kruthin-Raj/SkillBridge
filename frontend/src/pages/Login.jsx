import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, isProfileIncomplete } from '../context/AuthContext';

const COLLEGE_DOMAIN = import.meta.env.VITE_COLLEGE_DOMAIN || 'apollouniversity.edu.in';

export default function Login() {
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { isNewUser } = await loginWithPassword(email, password);
      navigate(isNewUser ? '/profile/setup' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <h1 className="text-2xl font-bold">Sign in to SkillBridge</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use your college email address. Only <strong>@{COLLEGE_DOMAIN}</strong> accounts can join.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="label">
            College email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`yourname@${COLLEGE_DOMAIN}`}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="field"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-medium text-freelance hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" className="font-medium text-freelance hover:underline">
            New here? Register
          </Link>
        </div>
      </form>
    </div>
  );
}
