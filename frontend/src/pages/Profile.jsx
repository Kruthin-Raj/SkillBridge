import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import EditListingModal from '../components/EditListingModal';
import ConfirmModal from '../components/ConfirmModal';

const toText = (list) => (list ?? []).join(', ');
const toList = (text) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const Stars = ({ rating }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= rating ? 'star' : 'star-empty'}>★</span>
    ))}
  </span>
);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    full_name: user.full_name ?? '',
    bio: user.bio ?? '',
    skills_offered: toText(user.skills_offered),
    skills_wanted: toText(user.skills_wanted),
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [editingListing, setEditingListing] = useState(null);
  const [listingToDelete, setListingToDelete] = useState(null);

  const initials = (user.full_name || user.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Load own reviews and listings
  const loadProfileData = useCallback(async () => {
    try {
      const [reviewData, listingsData] = await Promise.all([
        api.reviews.forUser(user.id).catch(() => ({ reviews: [] })),
        api.listings.forOwner(user.id).catch(() => ({ listings: [] }))
      ]);
      setReviews(reviewData.reviews || []);
      setMyListings(listingsData.listings || []);
    } catch (_) {
      // silently ignore
    }
  }, [user.id]);

  useEffect(() => { loadProfileData(); }, [loadProfileData]);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      setError('Image too large. Please use an image under 100 KB.');
      return;
    }

    setAvatarUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { user: updated } = await api.users.updateAvatar(base64);
      setUser(updated);
      setStatus('Avatar updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

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

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    try {
      await api.listings.delete(listingToDelete.id);
      setMyListings(myListings.filter(l => l.id !== listingToDelete.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      {editingListing && (
        <EditListingModal 
          listing={editingListing} 
          onClose={() => setEditingListing(null)} 
          onUpdated={() => {
            setEditingListing(null);
            loadProfileData();
          }} 
        />
      )}
      
      {listingToDelete && (
        <ConfirmModal
          title="Delete Listing"
          message={`Are you sure you want to permanently delete "${listingToDelete.title}"? This cannot be undone.`}
          confirmText="Delete Post"
          isDestructive={true}
          onConfirm={handleDeleteListing}
          onClose={() => setListingToDelete(null)}
        />
      )}

      <h1 className="text-2xl font-bold">Your profile</h1>

      {/* Avatar section */}
      <div className="card flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="avatar-xl">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40
                       text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            {avatarUploading ? (
              <span className="text-xs">Uploading…</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div className="text-center">
          <p className="font-semibold text-cw-text-1">{user.full_name || 'Student'}</p>
          <p className="text-sm text-cw-text-2">{user.email}</p>
        </div>

        {/* Trust score */}
        <div className="flex flex-wrap items-center gap-6 border-t border-cw-border pt-4 w-full justify-center">
          <div className="text-center px-4">
            <p className="text-2xl font-bold">{Number(user.rating_average ?? 0).toFixed(1)}</p>
            <p className="text-xs text-cw-text-3">Trust score</p>
          </div>
          <div className="border-l border-cw-border pl-6 px-4 text-center">
            <p className="text-2xl font-bold">{user.rating_count ?? 0}</p>
            <p className="text-xs text-cw-text-3">Reviews</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-semibold text-cw-text-1">Edit Profile</h2>

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
            Skills you can teach <span className="font-normal text-cw-text-3">(comma separated)</span>
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
            <span className="font-normal text-cw-text-3">(comma separated)</span>
          </label>
          <input
            id="skills_wanted"
            value={form.skills_wanted}
            onChange={update('skills_wanted')}
            placeholder="Figma, Public speaking"
            className="field"
          />
        </div>

        <p className="text-xs text-cw-text-3">
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

      {/* My Listings */}
      <div>
        <h2 className="text-xl font-bold mb-4">My Listings ({myListings.length})</h2>
        {myListings.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm text-cw-text-2">You haven't posted anything yet.</p>
            <Link to="/new" className="mt-3 inline-block btn-primary text-xs py-1.5 px-3">Post something</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myListings.map(listing => (
              <div key={listing.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cw-bg-alt text-cw-text-2 capitalize">
                      {listing.mode}
                    </span>
                    <h3 className="font-semibold text-base mt-1 line-clamp-1">{listing.title}</h3>
                  </div>
                  <span className={`chip capitalize ${listing.status === 'open' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
                    {listing.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-cw-text-2 line-clamp-2">{listing.description}</p>
                
                <div className="flex gap-2 pt-3 border-t border-cw-border mt-auto">
                  <Link to={`/listings/${listing.id}`} className="btn-primary py-1 px-3 text-xs bg-cw-bg-alt text-cw-text-1 hover:bg-cw-border border-none shadow-none flex-1 text-center">
                    View
                  </Link>
                  {listing.status === 'open' && (
                    <button 
                      onClick={() => setEditingListing(listing)} 
                      className="btn-primary py-1 px-3 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none shadow-none flex-1"
                    >
                      Edit
                    </button>
                  )}
                  <button 
                    onClick={() => setListingToDelete(listing)}
                    className="btn-primary py-1 px-3 text-xs bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Set password */}
      <SetPasswordCard />

      {/* Reviews on this profile */}
      <div>
        <h2 className="text-xl font-bold">Your Reviews ({reviews.length})</h2>

        {reviews.length === 0 && (
          <div className="card mt-4 text-center py-6">
            <p className="text-sm text-cw-text-2">No reviews yet. Complete work to earn reviews.</p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Stars rating={review.rating} />
                  <span className="ml-2 text-sm font-semibold text-cw-text-1">{review.rating}/5</span>
                </div>
                <p className="text-xs text-cw-text-3 w-full sm:w-auto">{formatDate(review.created_at)}</p>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-cw-text-1 whitespace-pre-line">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetPasswordCard() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwStatus('');

    if (password !== confirm) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      await api.auth.setPassword(password);
      setPwStatus('Password set successfully. You can now sign in with your email and password.');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <form onSubmit={handleSetPassword} className="card space-y-4">
      <h2 className="font-semibold text-cw-text-1">Set Password</h2>
      <p className="text-xs text-cw-text-3">
        Set a password so you can sign in without waiting for an OTP every time.
      </p>

      <div>
        <label htmlFor="new-password" className="label">New password</label>
        <PasswordInput
          id="new-password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="label">Confirm password</label>
        <PasswordInput
          id="confirm-password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter password"
        />
      </div>

      {pwError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pwError}</p>
      )}
      {pwStatus && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{pwStatus}</p>
      )}

      <button type="submit" disabled={pwSaving} className="btn-primary w-full">
        {pwSaving ? 'Setting…' : 'Set password'}
      </button>
    </form>
  );
}
