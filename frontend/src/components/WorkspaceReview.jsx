import { useState } from 'react';
import { api } from '../lib/api';

export default function WorkspaceReview({ listingId, reviewee, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.reviews.create({
        listing_id: listingId,
        reviewee_id: reviewee.id,
        rating,
        comment,
      });
      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card text-center bg-emerald-50 border-emerald-100">
        <p className="text-emerald-700 font-medium">Review submitted successfully!</p>
        <p className="text-sm text-emerald-600 mt-1">Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2">
        Review {reviewee.full_name}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
        
        <div>
          <label className="label">Rating</label>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl focus:outline-none transition-colors ${
                  star <= rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Review Comment (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Share your experience working with this user..."
            className="field"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
