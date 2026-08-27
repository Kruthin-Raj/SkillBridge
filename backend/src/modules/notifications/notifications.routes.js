import { Router } from 'express';
import { db, TABLES } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

/**
 * Build notification objects by scanning recent activity relevant to the user.
 * This is a computed view — no dedicated notifications table needed.
 */
async function buildNotifications(userId) {
  const notifications = [];
  const user = await db.findOne(TABLES.users, { id: userId });
  const lastRead = user?.last_read_at ? new Date(user.last_read_at) : new Date(0);

  // 1. New bids on user's listings
  const myListings = await db.findMany(TABLES.listings, { owner_id: userId }, { limit: 100 });
  for (const listing of myListings) {
    const bids = await db.findMany(TABLES.bids, { listing_id: listing.id }, { limit: 50 });
    for (const bid of bids) {
      notifications.push({
        id: `bid-${bid.id}`,
        type: 'new_bid',
        message: `New bid of ₹${bid.amount} on "${listing.title}"`,
        listing_id: listing.id,
        created_at: bid.created_at,
        read: new Date(bid.created_at) <= lastRead,
      });
    }
  }

  // 2. Bid accepted/rejected on listings user bid on
  const myBids = await db.findMany(TABLES.bids, { bidder_id: userId }, { limit: 100 });
  for (const bid of myBids) {
    if (bid.status === 'accepted') {
      const listing = await db.findOne(TABLES.listings, { id: bid.listing_id });
      notifications.push({
        id: `bid-accepted-${bid.id}`,
        type: 'bid_accepted',
        message: `Your bid was accepted on "${listing?.title || 'a listing'}"`,
        listing_id: bid.listing_id,
        created_at: bid.updated_at || bid.created_at,
        read: new Date(bid.updated_at || bid.created_at) <= lastRead,
      });
    }
    if (bid.status === 'rejected') {
      const listing = await db.findOne(TABLES.listings, { id: bid.listing_id });
      notifications.push({
        id: `bid-rejected-${bid.id}`,
        type: 'bid_rejected',
        message: `Your bid was not selected on "${listing?.title || 'a listing'}"`,
        listing_id: bid.listing_id,
        created_at: bid.updated_at || bid.created_at,
        read: new Date(bid.updated_at || bid.created_at) <= lastRead,
      });
    }
  }

  // 3. Exchange proposals on user's listings
  const exchanges = await db.findMany(TABLES.exchanges, { owner_id: userId }, { limit: 100 });
  for (const ex of exchanges) {
    const listing = await db.findOne(TABLES.listings, { id: ex.listing_id });
    notifications.push({
      id: `exchange-${ex.id}`,
      type: 'exchange_proposal',
      message: `New swap proposal on "${listing?.title || 'a listing'}"`,
      listing_id: ex.listing_id,
      created_at: ex.created_at,
      read: new Date(ex.created_at) <= lastRead,
    });
  }

  // 4. Listings completed (that user posted or worked on)
  for (const listing of myListings) {
    if (listing.status === 'completed') {
      notifications.push({
        id: `completed-${listing.id}`,
        type: 'listing_completed',
        message: `"${listing.title}" has been marked as completed`,
        listing_id: listing.id,
        created_at: listing.updated_at || listing.created_at,
        read: new Date(listing.updated_at || listing.created_at) <= lastRead,
      });
    }
  }

  // Sort newest first
  notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return notifications;
}

/** GET /api/notifications — all events relevant to the signed-in user. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await buildNotifications(req.user.id);
    const unread_count = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unread_count });
  })
);

/** PATCH /api/notifications/read — mark everything as read. */
router.patch(
  '/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    await db.update(TABLES.users, { id: req.user.id }, { last_read_at: new Date().toISOString() });
    res.json({ success: true });
  })
);

export default router;
