import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import ModeToggle from '../components/ModeToggle';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Browse() {
  const { user } = useAuth();
  const [mode, setMode] = useState('freelance');
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api.listings
      .list(mode)
      .then((data) => {
        if (!cancelled) setListings(data.listings);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">
            {mode === 'freelance' ? 'Open tasks' : 'Skill swaps'}
          </h1>
          <p className="text-sm text-cw-text-2">
            {mode === 'freelance'
              ? 'Paid work posted by students on campus.'
              : 'Teach what you know, learn what you want. No money involved.'}
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {user && (
        <Link to="/new" className="btn-primary mb-6">
          Post a listing
        </Link>
      )}

      {loading && <p className="text-sm text-cw-text-3">Loading listings…</p>}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="card text-center">
          <p className="text-sm text-cw-text-2">
            Nothing here yet. {user ? 'Be the first to post one.' : 'Sign in to post the first one.'}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
