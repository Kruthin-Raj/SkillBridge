import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const toText = (list) => (list ?? []).join(', ');
const toList = (text) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    full_name: user.full_name ?? '',
    bio: user.bio ?? '',
    skills_offered: toText(user.skills_offered),
    skills_wanted: toText(user.skills_wanted),
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setSaving(true);

    try {
      const { user: updated } = await api.users.updateMe({
        full_name: form.full_name.trim(),
        bio: form.bio.trim(),
        skills_offered: toList(form.skills_offered),
        skills_wanted: toList(form.skills_wanted),
      });
      setUser(updated);
      setStatus('Profile saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <p className="mt-1 text-sm text-slate-600">{user.email}</p>

      <div className="card mt-4 flex items-center gap-4">
        <div>
          <p className="text-2xl font-bold">{Number(user.rating_average ?? 0).toFixed(1)}</p>
          <p className="text-xs text-slate-500">Trust score</p>
        </div>
        <div className="border-l border-slate-200 pl-4">
          <p className="text-2xl font-bold">{user.rating_count ?? 0}</p>
          <p className="text-xs text-slate-500">Reviews</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label htmlFor="full_name" className="label">
            Full name
          </label>
          <input
            id="full_name"
            required
            minLength={2}
            value={form.full_name}
            onChange={update('full_name')}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="bio" className="label">
            About you
          </label>
          <textarea id="bio" rows={3} value={form.bio} onChange={update('bio')} className="field" />
        </div>

        <div>
          <label htmlFor="skills_offered" className="label">
            Skills you can teach <span className="font-normal text-slate-400">(comma separated)</span>
          </label>
          <input
            id="skills_offered"
            value={form.skills_offered}
            onChange={update('skills_offered')}
            placeholder="Python, Photoshop"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="skills_wanted" className="label">
            Skills you want to learn{' '}
            <span className="font-normal text-slate-400">(comma separated)</span>
          </label>
          <input
            id="skills_wanted"
            value={form.skills_wanted}
            onChange={update('skills_wanted')}
            placeholder="Figma, Public speaking"
            className="field"
          />
        </div>

        <p className="text-xs text-slate-500">
          These two lists drive the skill-exchange matching, so keep them up to date.
        </p>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {status && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{status}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
