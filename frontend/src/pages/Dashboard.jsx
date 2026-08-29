import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const TABS = [
  { key: 'active', label: 'Active Work' },
  { key: 'posted', label: 'My Listings' },
  { key: 'bids', label: 'Bid History' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_COLORS = {
  open: 'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-600',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function Dashboard() {
  const [tab, setTab] = useState('active');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await api.dashboard.get();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard…</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;

  const activeWork = data?.active_work ?? [];
  const posted = data?.posted ?? [];
  const bidHistory = data?.bid_history ?? [];
  const completed = data?.completed ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Your work at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Work', count: activeWork.length, color: 'text-blue-600' },
          { label: 'My Listings', count: posted.length, color: 'text-freelance' },
          { label: 'Bids Placed', count: bidHistory.length, color: 'text-exchange' },
          { label: 'Completed', count: completed.length, color: 'text-slate-700' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="mt-1 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={tab === t.key ? 'tab-active' : 'tab'}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'active' && (
          <div className="space-y-3">
            {activeWork.length === 0 && (
              <div className="card text-center">
                <p className="text-sm text-slate-600">No active work right now.</p>
                <Link to="/browse" className="mt-3 inline-block text-sm font-medium text-freelance hover:underline">
                  Browse open tasks →
                </Link>
              </div>
            )}
            {activeWork.map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`} className="card block transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${listing.mode === 'freelance' ? 'bg-freelance' : 'bg-exchange'}`}>
                        {listing.mode === 'freelance' ? 'Freelance' : 'Exchange'}
                      </span>
                      <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{listing.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      listing.worker_status === 'todo' ? 'bg-slate-100 text-slate-700' :
                      listing.worker_status === 'review' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {listing.worker_status ? listing.worker_status.replace('_', ' ') : 'To Do'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {listing.budget ? (
                    <p className="text-sm font-semibold text-freelance">₹{listing.budget}</p>
                  ) : (
                    <p className="text-sm font-semibold text-exchange">Skill Swap</p>
                  )}
                  {listing.deadline && (
                    <p className={`text-xs font-medium ${new Date(listing.deadline) < new Date() ? 'text-red-600' : 'text-slate-500'}`}>
                      Due: {formatDate(listing.deadline)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'posted' && (
          <div className="space-y-3">
            {posted.length === 0 && (
              <div className="card text-center">
                <p className="text-sm text-slate-600">You haven't posted any listings yet.</p>
                <Link to="/new" className="mt-3 inline-block text-sm font-medium text-freelance hover:underline">
                  Post your first listing →
                </Link>
              </div>
            )}
            {posted.map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`} className="card block transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${listing.mode === 'freelance' ? 'bg-freelance' : 'bg-exchange'}`}>
                        {listing.mode === 'freelance' ? 'Freelance' : 'Exchange'}
                      </span>
                      <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-1">{listing.description}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[listing.status] || 'bg-slate-100 text-slate-600'}`}>
                    {listing.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Posted {formatDate(listing.created_at)}</p>
              </Link>
            ))}
          </div>
        )}

        {tab === 'bids' && (
          <div className="space-y-3">
            {bidHistory.length === 0 && (
              <div className="card text-center">
                <p className="text-sm text-slate-600">You haven't placed any bids yet.</p>
                <Link to="/browse" className="mt-3 inline-block text-sm font-medium text-freelance hover:underline">
                  Browse open tasks →
                </Link>
              </div>
            )}
            {bidHistory.map((bid) => (
              <Link
                key={bid.id}
                to={bid.listing ? `/listings/${bid.listing.id}` : '#'}
                className="card block transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {bid.listing?.title || 'Deleted listing'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{bid.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-freelance">₹{bid.amount}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[bid.status] || 'bg-slate-100 text-slate-600'}`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">Bid placed {formatDate(bid.created_at)}</p>
              </Link>
            ))}
          </div>
        )}

        {tab === 'completed' && (
          <div className="space-y-3">
            {completed.length === 0 && (
              <div className="card text-center">
                <p className="text-sm text-slate-600">No completed work yet. Keep going!</p>
              </div>
            )}
            {completed.map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`} className="card block transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${listing.mode === 'freelance' ? 'bg-freelance' : 'bg-exchange'}`}>
                        {listing.mode === 'freelance' ? 'Freelance' : 'Exchange'}
                      </span>
                      <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-1">{listing.description}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS.completed}`}>
                    Completed
                  </span>
                </div>
                {listing.budget && (
                  <p className="mt-2 text-sm font-semibold text-freelance">₹{listing.budget}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
