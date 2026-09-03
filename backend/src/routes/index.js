import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import listingsRoutes from '../modules/listings/listings.routes.js';
import bidsRoutes from '../modules/bids/bids.routes.js';
import exchangesRoutes from '../modules/exchanges/exchanges.routes.js';
import reviewsRoutes from '../modules/reviews/reviews.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';
import messagesRoutes from '../modules/messages/messages.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/listings', listingsRoutes);
router.use('/bids', bidsRoutes);
router.use('/exchanges', exchangesRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/messages', messagesRoutes);
router.use('/reports', reportsRoutes);
router.use('/admin', adminRoutes);

export default router;
