import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [form, setForm] = useState({ amount: '', message: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isOwner = user && listing && listing.owner_id === user.id;

  const load = useCallback(async () => {
    setError('');
    try {
      const { listing: found } = await api.listings.get(id);
      setListing(found);

      // Bids are only visible to signed-in students.
      if (found.mode === 'freelance' && user) {
        const { bids: list } = await api.bids.forListing(id);
        setBids(list);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (action) => {
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitBid = (event) => {
    event.preventDefault();
    return handleAction(async () => {
      await api.bids.create({
        listing_id: id,
        amount: Number(form.amount),
        message: form.message.trim(),
      });
      setForm({ amount: '', message: '' });
    });
  };

  const proposeSwap = () =>
    handleAction(() =>
      api.exchanges.propose({ listing_id: id, message: 'I would like to swap skills with you.' })
    );

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!listing) return <p className="text-sm text-red-700">{error || 'Listing not found.'}</p>;

  const isFreelance = listing.mode === 'freelance';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
            isFreelance ? 'bg-freelance' : 'bg-exchange'
          }`}
        >
          {isFreelance ? 'Freelance' : 'Exchange'}
        </span>

        <h1 className="mt-3 text-2xl font-bold">{listing.title}</h1>
        <p className="mt-2 whitespace-pre-line text-slate-700">{listing.description}</p>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {isFreelance ? (
            <>
              <div>
                <dt className="text-slate-500">Budget</dt>
                <dd className="font-semibold">₹{listing.budget}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Deadline</dt>
                <dd className="font-semibold">
                  {new Date(listing.deadline).toLocaleDateString()}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt className="text-slate-500">They can teach</dt>
                <dd className="font-semibold">{listing.skill_offered}</dd>
              </div>
              <div>
                <dt className="text-slate-500">They want to learn</dt>
                <dd className="font-semibold">{listing.skill_wanted}</dd>
              </div>
            </>
          )}
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="font-semibold capitalize">{listing.status.replace('_', ' ')}</dd>
          </div>
        </dl>

        {isOwner && listing.status === 'in_progress' && (
          <button
            type="button"
            onClick={() => handleAction(() => api.listings.setStatus(id, 'completed'))}
            className="btn-ghost mt-4"
          >
            Mark as completed
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!user && (
        <p className="card text-sm text-slate-600">
          Sign in with your college email to bid or propose a swap.
        </p>
      )}

      {/* Freelance mode: place a bid, or (as owner) accept one. */}
      {user && isFreelance && (
        <div className="card">
          <h2 className="mb-3 font-semibold">Bids ({bids.length})</h2>

          <ul className="space-y-3">
            {bids.map((bid) => (
              <li
                key={bid.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
              >
                <div className="mr-auto">
                  <p className="font-semibold">₹{bid.amount}</p>
                  <p className="text-sm text-slate-600">{bid.message}</p>
                </div>
                <span className="chip capitalize">{bid.status}</span>
                {isOwner && bid.status === 'pending' && listing.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => handleAction(() => api.bids.accept(bid.id))}
                    className="btn-primary"
                  >
                    Accept
                  </button>
                )}
              </li>
            ))}
            {bids.length === 0 && <li className="text-sm text-slate-500">No bids yet.</li>}
          </ul>

          {!isOwner && listing.status === 'open' && (
            <form onSubmit={submitBid} className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <div>
                <label htmlFor="amount" className="label">
                  Your price (₹)
                </label>
                <input
                  id="amount"
                  type="number"
                  min={1}
                  required
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="message" className="label">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={2}
                  required
                  minLength={5}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  placeholder="Why you are a good fit"
                  className="field"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Place bid
              </button>
            </form>
          )}
        </div>
      )}

      {/* Exchange mode: propose the swap. */}
      {user && !isFreelance && !isOwner && listing.status === 'open' && (
        <button type="button" onClick={proposeSwap} className="btn-primary">
          Propose a swap
        </button>
      )}
    </div>
  );
}
