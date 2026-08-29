import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TaskProgress from '../components/TaskProgress';
import WorkspaceChat from '../components/WorkspaceChat';
import ParticipantCard from '../components/ParticipantCard';
import WorkspaceReview from '../components/WorkspaceReview';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [form, setForm] = useState({ amount: '', message: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isOwner = user && listing && listing.owner_id === user.id;
  const isParticipant = listing && listing.is_participant;

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

  if (loading) return <p className="text-sm text-cw-text-3">Loading…</p>;
  if (!listing) return <p className="text-sm text-red-700">{error || 'Listing not found.'}</p>;

  const isFreelance = listing.mode === 'freelance';
  const isExpired = isFreelance && listing.deadline && new Date(listing.deadline) < new Date();
  
  // Determine who to review (the other participant)
  let targetReviewee = null;
  if (isParticipant && listing.status === 'completed') {
    if (isOwner && listing.assigned_users?.length > 0) {
      targetReviewee = listing.assigned_users[0]; // For simplicity, take the first assigned user
    } else if (!isOwner && listing.owner) {
      targetReviewee = listing.owner;
    }
  }

  return (
    <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6 lg:col-span-2">
        <div className="card overflow-hidden">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
              isExpired ? 'bg-cw-border text-cw-text-1' : isFreelance ? 'bg-freelance' : 'bg-exchange'
            }`}
          >
            {isExpired ? 'Expired' : isFreelance ? 'Freelance' : 'Exchange'}
          </span>

          {listing.image_url && (
            <div className="-mx-5 mt-3">
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full max-h-72 object-cover"
              />
            </div>
          )}

          <h1 className="mt-3 text-2xl font-bold">{listing.title}</h1>
          <p className="mt-2 whitespace-pre-line text-cw-text-1">{listing.description}</p>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {isFreelance ? (
              <>
                <div>
                  <dt className="text-cw-text-2">Budget</dt>
                  <dd className="font-semibold">₹{listing.budget}</dd>
                </div>
                <div>
                  <dt className="text-cw-text-2">Deadline</dt>
                  <dd className={`font-semibold ${isExpired ? 'text-red-600' : ''}`}>
                    {new Date(listing.deadline).toLocaleDateString()} {isExpired && '(Passed)'}
                  </dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt className="text-cw-text-2">They can teach</dt>
                  <dd className="font-semibold">{listing.skill_offered}</dd>
                </div>
                <div>
                  <dt className="text-cw-text-2">They want to learn</dt>
                  <dd className="font-semibold">{listing.skill_wanted}</dd>
                </div>
              </>
            )}
            <div>
              <dt className="text-cw-text-2">Status</dt>
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
          <p className="card text-sm text-cw-text-2">
            Sign in with your college email to bid or propose a swap.
          </p>
        )}

        {/* Workspace controls */}
        {user && isParticipant && listing.status === 'in_progress' && (
          <TaskProgress 
            listingId={listing.id} 
            currentStatus={listing.worker_status} 
            onUpdate={(updated) => setListing({ ...listing, worker_status: updated.worker_status })} 
          />
        )}
        
        {/* Review System when completed */}
        {user && isParticipant && listing.status === 'completed' && targetReviewee && (
          listing.has_reviewed ? (
            <div className="card text-center bg-cw-surface border-cw-border">
              <p className="text-cw-text-1 font-medium">You have already left a review.</p>
              <p className="text-sm text-cw-text-3 mt-1">Thank you for your feedback.</p>
            </div>
          ) : (
            <WorkspaceReview 
              listingId={listing.id} 
              reviewee={targetReviewee} 
              onReviewSubmitted={load}
            />
          )
        )}

        {/* Freelance mode: place a bid, or (as owner) accept one. */}
        {user && isFreelance && (
          <div className="card">
            <h2 className="mb-3 font-semibold">Bids ({bids.length})</h2>

            <ul className="space-y-3">
              {bids.map((bid) => (
                <li
                  key={bid.id}
                  className="flex items-start gap-3 rounded-lg border border-cw-border bg-cw-surface p-3"
                >
                  <div className="mr-auto">
                    <p className="font-semibold">₹{bid.amount}</p>
                    <p className="text-sm text-cw-text-2">{bid.message}</p>
                  </div>
                  <span className="chip capitalize">{bid.status}</span>
                  {isOwner && bid.status === 'pending' && listing.status === 'open' && !isExpired && (
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
              {bids.length === 0 && <li className="text-sm text-cw-text-3">No bids yet.</li>}
            </ul>

            {!isOwner && listing.status === 'open' && !isExpired && (
              <form onSubmit={submitBid} className="mt-4 space-y-3 border-t border-cw-border pt-4">
                <div>
                  <label htmlFor="amount" className="label">
                    Your price (₹)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    min={1}
                    max={100000}
                    required
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    className="field"
                  />
                  <p className="mt-1 text-xs text-cw-text-3">Max ₹1,00,000</p>
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
            {!isOwner && listing.status === 'open' && isExpired && (
              <div className="mt-4 border-t border-cw-border pt-4 text-sm text-cw-text-3 text-center">
                The deadline for this listing has passed. No new bids can be placed.
              </div>
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

      {/* Workspace Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Participants Overview */}
        {(listing.status === 'in_progress' || listing.status === 'completed') && (
          <div className="space-y-3">
            <h3 className="font-semibold text-cw-text-1 px-1">Participants</h3>
            
            {listing.owner && (
              <ParticipantCard 
                user={listing.owner} 
                role="Owner" 
                listingId={listing.id} 
              />
            )}
            
            {listing.assigned_users?.map((assignee) => (
              <ParticipantCard 
                key={assignee.id} 
                user={assignee} 
                role={assignee.role} 
                listingId={listing.id} 
              />
            ))}
          </div>
        )}

        {user && isParticipant && listing.status === 'in_progress' && (
          <div className="sticky top-6">
            <WorkspaceChat listingId={listing.id} />
          </div>
        )}
      </div>
    </div>
  );
}
