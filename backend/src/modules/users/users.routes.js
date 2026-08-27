import { Router } from 'express';
import { z } from 'zod';
import { db, TABLES } from '../../db/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

const profileSchema = z.object({
  full_name: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).optional(),
  skills_offered: z.array(z.string().min(1).max(40)).max(20).optional(),
  skills_wanted: z.array(z.string().min(1).max(40)).max(20).optional(),
});

const avatarSchema = z.object({
  avatar_url: z.string().max(150000, 'Image is too large (max ~100 KB)'),
});

/** Never leak another student's email address. */
const toPublicProfile = (user) => ({
  id: user.id,
  full_name: user.full_name,
  bio: user.bio,
  avatar_url: user.avatar_url ?? '',
  skills_offered: user.skills_offered ?? [],
  skills_wanted: user.skills_wanted ?? [],
  rating_average: user.rating_average ?? 0,
  rating_count: user.rating_count ?? 0,
  created_at: user.created_at,
});

/** GET /api/users/:id - public profile with the trust score (slide 9). */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await db.findOne(TABLES.users, { id: req.params.id });
    if (!user) throw ApiError.notFound('User not found');
    res.json({ user: toPublicProfile(user) });
  })
);

/** PATCH /api/users/me - edit your own profile. */
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const patch = profileSchema.parse(req.body);
    const user = await db.update(TABLES.users, { id: req.user.id }, patch);
    if (!user) throw ApiError.notFound('User not found');
    res.json({ user });
  })
);

/** PATCH /api/users/me/avatar - upload a profile picture as base64. */
router.patch(
  '/me/avatar',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { avatar_url } = avatarSchema.parse(req.body);
    const user = await db.update(TABLES.users, { id: req.user.id }, { avatar_url });
    if (!user) throw ApiError.notFound('User not found');
    res.json({ user });
  })
);

export default router;
