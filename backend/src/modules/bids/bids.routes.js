import { Router } from 'express';
import { z } from 'zod';
import { db, TABLES } from '../../db/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

const bidSchema = z.object({
  listing_id: z.string().min(1),
  amount: z.number().int().positive().max(100000),
  message: z.string().min(5).max(500),
});

const editBidSchema = z.object({
  amount: z.number().int().positive().max(100000).optional(),
  message: z.string().min(5).max(500).optional(),
});

/** GET /api/bids?listing_id=... - every bid on one listing. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const listingId = req.query.listing_id;
    if (!listingId) throw ApiError.badRequest('listing_id query parameter is required');

    const bids = await db.findMany(TABLES.bids, { listing_id: listingId }, { limit: 100 });
    
    // Attach user details for each bid
    for (const bid of bids) {
      const user = await db.findOne(TABLES.users, { id: bid.bidder_id });
      if (user) {
        bid.bidder = {
          id: user.id,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          rating_average: user.rating_average,
          rating_count: user.rating_count,
        };
      }
    }

    res.json({ bids });
  })
);

/** POST /api/bids - place a bid on a freelance listing. */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = bidSchema.parse(req.body);

    const listing = await db.findOne(TABLES.listings, { id: payload.listing_id });
    if (!listing) throw ApiError.notFound('Listing not found');
    if (listing.mode !== 'freelance') throw ApiError.badRequest('Only freelance listings take bids');
    if (listing.status !== 'open') throw ApiError.conflict('This listing is no longer open');
    if (listing.owner_id === req.user.id) throw ApiError.forbidden('You cannot bid on your own listing');
    
    if (listing.deadline && new Date(listing.deadline) < new Date()) {
      throw ApiError.conflict('The deadline for this listing has passed');
    }

    const existing = await db.findOne(TABLES.bids, {
      listing_id: listing.id,
      bidder_id: req.user.id,
    });
    if (existing) throw ApiError.conflict('You have already bid on this listing');

    const bid = await db.insert(TABLES.bids, {
      ...payload,
      bidder_id: req.user.id,
      status: 'pending',
    });
    res.status(201).json({ bid });
  })
);

/** PATCH /api/bids/:id - edit an existing bid. */
router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = editBidSchema.parse(req.body);
    
    if (Object.keys(payload).length === 0) {
      throw ApiError.badRequest('Nothing to update');
    }

    const bid = await db.findOne(TABLES.bids, { id: req.params.id });
    if (!bid) throw ApiError.notFound('Bid not found');
    
    if (bid.bidder_id !== req.user.id) {
      throw ApiError.forbidden('You can only edit your own bids');
    }
    
    const listing = await db.findOne(TABLES.listings, { id: bid.listing_id });
    if (!listing || listing.status !== 'open') {
      throw ApiError.conflict('Cannot edit bid on a listing that is closed or in progress');
    }

    const updated = await db.update(TABLES.bids, { id: bid.id }, payload);
    res.json({ bid: updated });
  })
);

/** POST /api/bids/:id/accept - owner picks a bid; the gig starts. */
router.post(
  '/:id/accept',
  requireAuth,
  asyncHandler(async (req, res) => {
    const bid = await db.findOne(TABLES.bids, { id: req.params.id });
    if (!bid) throw ApiError.notFound('Bid not found');

    const listing = await db.findOne(TABLES.listings, { id: bid.listing_id });
    if (!listing) throw ApiError.notFound('Listing not found');
    if (listing.owner_id !== req.user.id) {
      throw ApiError.forbidden('Only the person who posted this listing can accept a bid');
    }
    if (listing.status !== 'open') throw ApiError.conflict('This listing is no longer open');

    const accepted = await db.update(TABLES.bids, { id: bid.id }, { status: 'accepted' });
    await db.update(
      TABLES.listings,
      { id: listing.id },
      { status: 'in_progress', accepted_bid_id: bid.id }
    );

    // Reject all other pending bids on this listing.
    const allBids = await db.findMany(TABLES.bids, { listing_id: listing.id }, { limit: 1000 });
    const losers = allBids.filter((b) => b.id !== bid.id && b.status === 'pending');
    await Promise.all(
      losers.map((b) => db.update(TABLES.bids, { id: b.id }, { status: 'rejected' }))
    );

    res.json({ bid: accepted });
  })
);

export default router;
