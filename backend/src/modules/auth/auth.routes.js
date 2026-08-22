import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { getUserById, requestOtp, verifyOtpAndIssueToken } from './auth.service.js';

const router = Router();

const requestSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const verifySchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'The code is 6 digits'),
});

/** POST /api/auth/request-otp - emails (or prints) a fresh code. */
router.post(
  '/request-otp',
  asyncHandler(async (req, res) => {
    const { email } = requestSchema.parse(req.body);
    const result = await requestOtp(email);

    res.json({
      message: `A verification code was sent to ${email}.`,
      expiresInMinutes: result.expiresInMinutes,
      // Tells the UI to show the "check your terminal" hint in dev.
      deliveredByEmail: result.delivered,
    });
  })
);

/** POST /api/auth/verify-otp - exchanges a valid code for a JWT. */
router.post(
  '/verify-otp',
  asyncHandler(async (req, res) => {
    const { email, code } = verifySchema.parse(req.body);
    const { token, user, isNewUser } = await verifyOtpAndIssueToken(email, code);
    res.json({ token, user, isNewUser });
  })
);

/** GET /api/auth/me - the currently signed-in student. */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await getUserById(req.user.id) });
  })
);

export default router;
