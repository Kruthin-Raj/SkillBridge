import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import ImageModal from '../components/ImageModal';

const TYPE_CONFIG = {
  new_bid: { icon: '💰', color: 'bg-freelance', label: 'New Bid' },
  bid_accepted: { icon: '✅', color: 'bg-emerald-500', label: 'Bid Accepted' },
  bid_rejected: { icon: '❌', color: 'bg-red-500', label: 'Bid Rejected' },
  exchange_proposal: { icon: '🔄', color: 'bg-exchange', label: 'Swap Proposal' },
  listing_completed: { icon: '🎉', color: 'bg-amber-500', label: 'Completed' },
  admin_warning: { icon: '⚠️', color: 'bg-amber-500', label: 'Warning' },
  admin_unblock: { icon: '🔓', color: 'bg-emerald-500', label: 'Unblocked' },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await api.notifications.list();
      setNotifications(result.notifications);
      setUnreadCount(result.unread_count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    try {
      await api.notifications.markRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-sm text-cw-text-3">Loading notifications…</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-cw-text-2">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="btn-ghost text-xs">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-3xl">🔔</p>
          <p className="mt-3 text-sm text-cw-text-2">No notifications yet.</p>
          <p className="mt-1 text-xs text-cw-text-3">
            You'll see updates here when someone bids on your listings or accepts your bids.
          </p>
        </div>
      )}

      <div>
        {notifications.map((n) => {
          const config = TYPE_CONFIG[n.type] || { icon: '📌', color: 'bg-cw-border', label: n.type };
          return (
            <div key={n.id} className={`timeline-item ${!n.read ? '' : 'opacity-60'}`}>
              <div className={`timeline-dot ${config.color}`}>
                <span className="text-sm">{config.icon}</span>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-cw-text-1' : 'text-cw-text-2'}`}>
                      {n.message}
                    </p>
                    {n.image_url && (
                      <div className="mt-2 mb-1">
                        <img 
                          src={n.image_url} 
                          alt="Attachment" 
                          className="max-h-32 rounded-lg border border-cw-border object-cover cursor-zoom-in"
                          onClick={() => setFullscreenImage(n.image_url)}
                        />
                      </div>
                    )}
                    <p className="mt-1 text-xs text-cw-text-3">{timeAgo(n.created_at)}</p>
                  </div>
                  {n.listing_id && (
                    <Link
                      to={`/listings/${n.listing_id}`}
                      className="flex-shrink-0 text-xs font-medium text-freelance hover:underline"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {fullscreenImage && (
        <ImageModal src={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </div>
  );
}
