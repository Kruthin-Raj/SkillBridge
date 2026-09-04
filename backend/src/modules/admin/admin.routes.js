import { Router } from 'express';
import { db, TABLES } from '../../db/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.email !== 'kruthin123@gmail.com') {
    return next(ApiError.forbidden('Admin access only'));
  }
  next();
};

/** GET /api/admin/users - Get all users (Admin only) */
router.get(
  '/users',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await db.findMany(
      TABLES.users,
      {},
      { orderBy: 'created_at', ascending: false, limit: 100 }
    );
    // Exclude the admin from the management list
    const filteredUsers = users.filter(u => u.email !== 'kruthin123@gmail.com');
    res.json({ users: filteredUsers });
  })
);

/** GET /api/admin/reports - Get all reports (Admin only) */
router.get(
  '/reports',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const reports = await db.findMany(
      TABLES.reports,
      {},
      { orderBy: 'created_at', ascending: false, limit: 100 }
    );

    const userIds = [...new Set(reports.flatMap(r => [r.reported_user_id, r.reporter_id]))];
    const listingIds = [...new Set(reports.filter(r => r.listing_id).map(r => r.listing_id))];
    
    const users = await Promise.all(userIds.map(id => db.findOne(TABLES.users, { id })));
    const listings = await Promise.all(listingIds.map(id => db.findOne(TABLES.listings, { id })));
    
    const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
    const listingMap = listings.reduce((acc, l) => { acc[l.id] = l; return acc; }, {});

    const enrichedReports = reports.map(r => ({
      ...r,
      reported_email: userMap[r.reported_user_id]?.email,
      reported_name: userMap[r.reported_user_id]?.full_name,
      reporter_email: userMap[r.reporter_id]?.email,
      reporter_name: userMap[r.reporter_id]?.full_name,
      listing_title: listingMap[r.listing_id]?.title,
    }));

    res.json({ reports: enrichedReports });
  })
);

/** POST /api/admin/users/:id/warn - Warn a user (Admin only) */
router.post(
  '/users/:id/warn',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { message = '', image_url = '' } = req.body || {};
    
    const user = await db.findOne(TABLES.users, { id: userId });
    
    if (!user) throw ApiError.notFound('User not found');

    const newCount = (user.warnings_count || 0) + 1;
    const updatedUser = await db.update(
      TABLES.users,
      { id: userId },
      { warnings_count: newCount, updated_at: new Date().toISOString() }
    );
    
    await db.insert(TABLES.admin_actions, {
      user_id: userId,
      action: 'warn',
      message,
      image_url,
    });

    res.json({ user: updatedUser });
  })
);

/** POST /api/admin/users/:id/block - Block a user (Admin only) */
router.post(
  '/users/:id/block',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { message = '', image_url = '' } = req.body || {};
    
    if (userId === req.user.id) {
      throw ApiError.badRequest('You cannot block yourself');
    }

    const user = await db.findOne(TABLES.users, { id: userId });
    if (!user) throw ApiError.notFound('User not found');

    const updatedUser = await db.update(TABLES.users, { id: userId }, { is_blocked: true, updated_at: new Date().toISOString() });

    await db.insert(TABLES.admin_actions, {
      user_id: userId,
      action: 'block',
      message,
      image_url,
    });

    res.json({ success: true, user: updatedUser });
  })
);

/** POST /api/admin/users/:id/unblock - Unblock a user (Admin only) */
router.post(
  '/users/:id/unblock',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { message = '', image_url = '' } = req.body || {};
    
    const user = await db.findOne(TABLES.users, { id: userId });
    if (!user) throw ApiError.notFound('User not found');

    const updatedUser = await db.update(TABLES.users, { id: userId }, { is_blocked: false, updated_at: new Date().toISOString() });

    await db.insert(TABLES.admin_actions, {
      user_id: userId,
      action: 'unblock',
      message,
      image_url,
    });

    res.json({ success: true, user: updatedUser });
  })
);

/** DELETE /api/admin/reports/:id - Delete a report (Admin only) */
router.delete(
  '/reports/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const reportId = req.params.id;
    
    const report = await db.findOne(TABLES.reports, { id: reportId });
    if (!report) throw ApiError.notFound('Report not found');

    await db.remove(TABLES.reports, { id: reportId });

    res.json({ success: true });
  })
);

/** DELETE /api/admin/listings/:id - Delete a listing (Admin only) */
router.delete(
  '/listings/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const listingId = req.params.id;
    
    const listing = await db.findOne(TABLES.listings, { id: listingId });
    if (!listing) throw ApiError.notFound('Listing not found');

    await db.remove(TABLES.listings, { id: listingId });

    res.json({ success: true });
  })
);

export default router;
