import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeToggle from '../components/ModeToggle';
import { api } from '../lib/api';

const emptyForm = {
  title: '',
  description: '',
  tags: '',
  budget: '',
  deadline: '',
  skill_offered: '',
  skill_wanted: '',
};

export default function CreateListing() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('freelance');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const buildPayload = () => {
    const base = {
      mode,
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (mode === 'freelance') {
      return {
        ...base,
        budget: Number(form.budget),
        // The API expects a full ISO date-time; the input gives a plain date.
        deadline: new Date(form.deadline).toISOString(),
      };
    }

    return {
      ...base,
      skill_offered: form.skill_offered.trim(),
      skill_wanted: form.skill_wanted.trim(),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const { listing } = await api.listings.create(buildPayload());
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Post a listing</h1>
      <p className="mt-2 text-sm text-slate-600">
        Choose whether you are paying for work or swapping a skill.
      </p>

      <div className="mt-4">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            required
            minLength={5}
            value={form.title}
            onChange={update('title')}
            placeholder={
              mode === 'freelance'
                ? 'Design a poster for our tech fest'
                : 'I can teach Python, I want to learn Figma'
            }
            className="field"
          />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            required
            minLength={10}
            rows={4}
            value={form.description}
            onChange={update('description')}
            className="field"
          />
        </div>

        {mode === 'freelance' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="budget" className="label">
                Budget (₹)
              </label>
              <input
                id="budget"
                type="number"
                min={1}
                required
                value={form.budget}
                onChange={update('budget')}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="deadline" className="label">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                required
                value={form.deadline}
                onChange={update('deadline')}
                className="field"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="skill_offered" className="label">
                Skill you can teach
              </label>
              <input
                id="skill_offered"
                required
                value={form.skill_offered}
                onChange={update('skill_offered')}
                placeholder="Python"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="skill_wanted" className="label">
                Skill you want to learn
              </label>
              <input
                id="skill_wanted"
                required
                value={form.skill_wanted}
                onChange={update('skill_wanted')}
                placeholder="Figma"
                className="field"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="tags" className="label">
            Tags <span className="font-normal text-slate-400">(comma separated)</span>
          </label>
          <input
            id="tags"
            value={form.tags}
            onChange={update('tags')}
            placeholder="design, urgent"
            className="field"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Posting…' : 'Post listing'}
        </button>
      </form>
    </div>
  );
}
