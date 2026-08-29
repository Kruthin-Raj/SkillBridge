import { Router } from 'express';
import { z } from 'zod';
import { db, TABLES } from '../../db/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

const reportSchema = z.object({
  reported_user_id: z.string().min(1, 'Reported user ID is required'),
  listing_id: z.string().optional(),
  reason: z.enum(['harassment', 'scam', 'inappropriate_content', 'non_delivery', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
});

/** POST /api/reports - submit a new report */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = reportSchema.parse(req.body);

    if (payload.reported_user_id === req.user.id) {
      throw ApiError.badRequest('You cannot report yourself');
    }

    const reportedUser = await db.findOne(TABLES.users, { id: payload.reported_user_id });
    if (!reportedUser) {
      throw ApiError.notFound('The user you are trying to report does not exist');
    }

    if (payload.listing_id) {
      const listing = await db.findOne(TABLES.listings, { id: payload.listing_id });
      if (!listing) {
        throw ApiError.notFound('The listing associated with this report does not exist');
      }
    }

    const report = await db.insert(TABLES.reports, {
      ...payload,
      reporter_id: req.user.id,
      status: 'pending',
    });

    res.status(201).json({ report });
  })
);

export default router;
