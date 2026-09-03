import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import ReportModal from '../components/ReportModal';

const Stars = ({ rating }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= rating ? 'star' : 'star-empty'}>★</span>
    ))}
  </span>
);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [userData, reviewData] = await Promise.all([
        api.users.get(id),
        api.reviews.forUser(id),
      ]);
      setProfile(userData.user);
      setReviews(reviewData.reviews);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-cw-text-3">Loading profile…</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!profile) return <p className="text-sm text-red-700">User not found.</p>;

  const initials = (profile.full_name || profile.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="card">
        <div className="flex items-center gap-5">
          <div className="avatar-xl">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'Avatar'} />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold truncate">
              {profile.full_name || 'Anonymous Student'}
            </h1>
            <p className="mt-1 text-sm text-cw-text-3">
              Member since {formatDate(profile.created_at)}
            </p>
            {profile.bio && (
              <p className="mt-3 text-sm text-cw-text-1 whitespace-pre-line">{profile.bio}</p>
            )}
            <div className="mt-4">
              <button
                onClick={() => setIsReporting(true)}
                className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
              >
                Report User
              </button>
            </div>
          </div>
        </div>

        {/* Trust score */}
        <div className="mt-6 flex items-center gap-6 border-t border-cw-border pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-cw-text-1">
              {Number(profile.rating_average ?? 0).toFixed(1)}
            </p>
            <Stars rating={Math.round(profile.rating_average ?? 0)} />
            <p className="mt-1 text-xs text-cw-text-3">Trust Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cw-text-1">{profile.rating_count ?? 0}</p>
            <p className="text-xs text-cw-text-3">Reviews</p>
          </div>
        </div>

        {/* Skills */}
        {((profile.skills_offered?.length > 0) || (profile.skills_wanted?.length > 0)) && (
          <div className="mt-4 grid gap-4 border-t border-cw-border pt-4 sm:grid-cols-2">
            {profile.skills_offered?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-cw-text-3 uppercase tracking-wider">Can teach</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.skills_offered.map((s) => (
                    <span key={s} className="rounded-full bg-freelance/10 px-2.5 py-0.5 text-xs font-medium text-freelance">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.skills_wanted?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-cw-text-3 uppercase tracking-wider">Wants to learn</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.skills_wanted.map((s) => (
                    <span key={s} className="rounded-full bg-exchange/10 px-2.5 py-0.5 text-xs font-medium text-exchange">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold">Reviews ({reviews.length})</h2>

        {reviews.length === 0 && (
          <div className="card mt-4 text-center py-8">
            <p className="text-sm text-cw-text-2">No reviews yet.</p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Stars rating={review.rating} />
                  <span className="ml-2 text-sm font-semibold text-cw-text-1">{review.rating}/5</span>
                </div>
                <p className="text-xs text-cw-text-3">{formatDate(review.created_at)}</p>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-cw-text-1 whitespace-pre-line">{review.comment}</p>
              )}
              <Link
                to={`/listings/${review.listing_id}`}
                className="mt-2 inline-block text-xs font-medium text-freelance hover:underline"
              >
                View listing →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {isReporting && (
        <ReportModal 
          reportedUser={profile} 
          onClose={() => setIsReporting(false)} 
        />
      )}
    </div>
  );
}
