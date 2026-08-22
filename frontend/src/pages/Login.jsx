import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLLEGE_DOMAIN = import.meta.env.VITE_COLLEGE_DOMAIN || 'apollouniversity.edu.in';

export default function Login() {
  const { requestOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSending(true);

    try {
      const result = await requestOtp(email);
      navigate('/verify', {
        state: { email, deliveredByEmail: result.deliveredByEmail },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Sign in to SkillBridge</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use your college email address. Only <strong>@{COLLEGE_DOMAIN}</strong> accounts can join,
        so everyone here is a verified student.
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
            onChange={(event) => setEmail(event.target.value)}
            placeholder={`yourname@${COLLEGE_DOMAIN}`}
            className="field"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={sending} className="btn-primary w-full">
          {sending ? 'Sending code…' : 'Send verification code'}
        </button>
      </form>
    </div>
  );
}
