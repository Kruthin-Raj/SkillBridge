import { Router } from 'express';
import { db, TABLES } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

/**
 * GET /api/dashboard
 *
 * Returns everything the signed-in student needs in one call:
 *  - active_work:  listings where they are the accepted bidder (in_progress)
 *  - posted:       their own listings (all statuses)
 *  - bid_history:  every bid they have placed, enriched with listing info
 *  - completed:    listings they participated in that are completed
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Listings posted by this user
    const posted = await db.findMany(TABLES.listings, { owner_id: userId }, { limit: 100 });

    // 2. Bids this user has placed
    const myBids = await db.findMany(TABLES.bids, { bidder_id: userId }, { limit: 200 });

    // 3. Enrich bids with listing details and find active work
    const activeWork = [];
    const completed = [];
    const bidHistory = [];

    for (const bid of myBids) {
      const listing = await db.findOne(TABLES.listings, { id: bid.listing_id });
      const entry = { ...bid, listing: listing || null };
      bidHistory.push(entry);

      if (bid.status === 'accepted' && listing) {
        if (listing.status === 'in_progress') activeWork.push(listing);
        if (listing.status === 'completed') completed.push(listing);
      }
    }

    // 4. Also include completed listings posted by this user
    const ownCompleted = posted.filter((l) => l.status === 'completed');
    const allCompleted = [...completed, ...ownCompleted].reduce((acc, listing) => {
      if (!acc.find((l) => l.id === listing.id)) acc.push(listing);
      return acc;
    }, []);

    res.json({
      active_work: activeWork,
      posted,
      bid_history: bidHistory,
      completed: allCompleted,
    });
  })
);

export default router;
