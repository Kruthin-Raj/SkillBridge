import { Router } from 'express';
import { z } from 'zod';
import { db, TABLES } from '../../db/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

/**
 * Both modes share one listings table (slide 9), separated by `mode`:
 *   freelance - has a budget and a deadline, receives bids
 *   exchange  - has skill_offered / skill_wanted, receives matches
 */
export const LISTING_MODES = ['freelance', 'exchange'];
export const LISTING_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];

const baseSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(2000),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  image_url: z.string().max(300000, 'Image is too large').default(''),
});

const freelanceSchema = baseSchema.extend({
  mode: z.literal('freelance'),
  budget: z.number().int().positive().max(100000),
  deadline: z.string().datetime({ message: 'deadline must be an ISO date-time' }),
});

const exchangeSchema = baseSchema.extend({
  mode: z.literal('exchange'),
  skill_offered: z.string().min(2).max(40),
  skill_wanted: z.string().min(2).max(40),
});

const createSchema = z.discriminatedUnion('mode', [freelanceSchema, exchangeSchema]);

const statusSchema = z.object({ status: z.enum(LISTING_STATUSES) });

/** GET /api/listings?mode=freelance - browse open listings. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const where = { status: 'open' };
    if (req.query.mode) {
      if (!LISTING_MODES.includes(req.query.mode)) {
        throw ApiError.badRequest(`mode must be one of: ${LISTING_MODES.join(', ')}`);
      }
      where.mode = req.query.mode;
    }

    let listings = await db.findMany(TABLES.listings, where, { limit: 100 });
    
    // Filter out expired freelance listings (deadline in the past)
    const now = new Date();
    listings = listings.filter((listing) => {
      if (listing.mode === 'freelance' && listing.deadline) {
        return new Date(listing.deadline) > now;
      }
      return true;
    });

    res.json({ listings: listings.slice(0, 50) });
  })
);

/** GET /api/listings/:id */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    let token = null;
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      token = header.substring(7).trim();
      if (token === 'null' || token === 'undefined') token = null;
    }
    let userId = null;
    if (token) {
      try {
        const payload = (await import('jsonwebtoken')).default.verify(token, (await import('../../config/env.js')).env.jwtSecret);
        userId = payload.sub;
      } catch (err) {}
    }

    const listing = await db.findOne(TABLES.listings, { id: req.params.id });
    if (!listing) throw ApiError.notFound('Listing not found');

    const owner = await db.findOne(TABLES.users, { id: listing.owner_id });
    if (owner) {
      listing.owner = {
        id: owner.id,
        full_name: owner.full_name,
        avatar_url: owner.avatar_url,
      };
    }

    let isParticipant = false;
    const assigned_users = [];
    
    if (listing.status !== 'open' && listing.status !== 'cancelled') {
      if (listing.mode === 'freelance') {
        const acceptedBids = await db.findMany(TABLES.bids, { listing_id: listing.id, status: 'accepted' });
        for (const bid of acceptedBids) {
          const user = await db.findOne(TABLES.users, { id: bid.bidder_id });
          if (user) {
            assigned_users.push({
              id: user.id,
              full_name: user.full_name,
              avatar_url: user.avatar_url,
              role: 'freelancer'
            });
          }
        }
      } else if (listing.mode === 'exchange') {
        const acceptedExchanges = await db.findMany(TABLES.exchanges, { listing_id: listing.id, status: 'accepted' });
        for (const ex of acceptedExchanges) {
          const user = await db.findOne(TABLES.users, { id: ex.proposer_id });
          if (user) {
            assigned_users.push({
              id: user.id,
              full_name: user.full_name,
              avatar_url: user.avatar_url,
              role: 'exchange_partner'
            });
          }
        }
      }
    }
    
    listing.assigned_users = assigned_users;

    if (userId) {
      if (listing.owner_id === userId) {
        isParticipant = true;
      } else if (assigned_users.some(u => u.id === userId)) {
        isParticipant = true;
      }
    }

    res.json({ listing: { ...listing, is_participant: isParticipant } });
  })
);

/** POST /api/listings - post a task or a skill swap. */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const listing = await db.insert(TABLES.listings, {
      ...payload,
      owner_id: req.user.id,
      status: 'open',
      worker_status: 'todo',
    });
    res.status(201).json({ listing });
  })
);

/** PATCH /api/listings/:id/status - owner moves the gig along. */
router.patch(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = statusSchema.parse(req.body);

    const listing = await db.findOne(TABLES.listings, { id: req.params.id });
    if (!listing) throw ApiError.notFound('Listing not found');
    if (listing.owner_id !== req.user.id) {
      throw ApiError.forbidden('Only the person who posted this listing can change its status');
    }

    const updated = await db.update(TABLES.listings, { id: listing.id }, { status });
    res.json({ listing: updated });
  })
);

const workerStatusSchema = z.object({ worker_status: z.enum(['todo', 'in_progress', 'review']) });

/** PATCH /api/listings/:id/worker-status - worker updates their progress. */
router.patch(
  '/:id/worker-status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { worker_status } = workerStatusSchema.parse(req.body);

    const listing = await db.findOne(TABLES.listings, { id: req.params.id });
    if (!listing) throw ApiError.notFound('Listing not found');

    let isAuthorized = false;
    
    // For freelance, the accepted bidder can update status
    if (listing.mode === 'freelance') {
      const bid = await db.findOne(TABLES.bids, { listing_id: listing.id, bidder_id: req.user.id, status: 'accepted' });
      if (bid) isAuthorized = true;
    }
    
    // For exchanges, either the owner or the accepted proposer can update status
    if (listing.mode === 'exchange') {
      if (listing.owner_id === req.user.id) isAuthorized = true;
      else {
        const exchange = await db.findOne(TABLES.exchanges, { listing_id: listing.id, proposer_id: req.user.id, status: 'accepted' });
        if (exchange) isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to update the progress of this task');
    }

    const updated = await db.update(TABLES.listings, { id: listing.id }, { worker_status });
    res.json({ listing: updated });
  })
);

export default router;
