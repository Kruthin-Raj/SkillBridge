import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db, TABLES } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Reads the Bearer token, verifies it and puts the caller on `req.user`.
 * Every route that touches user-owned data must sit behind this.
 */
export async function requireAuth(req, _res, next) {
  let token = null;

  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    token = header.substring(7).trim();
    if (token === 'null' || token === 'undefined') token = null;
  } else if (req.query.token && req.query.token !== 'null' && req.query.token !== 'undefined') {
    // Fallback for SSE EventSource which cannot send custom headers
    token = req.query.token.trim();
  }

  if (!token) {
    return next(ApiError.unauthorized('Missing Bearer token'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const userId = payload.sub;

    // Check if the user has been blocked
    const userRecord = await db.findOne(TABLES.users, { id: userId });
    if (userRecord && userRecord.is_blocked) {
      return next(ApiError.unauthorized('Your account has been blocked. Please contact support.'));
    }

    req.user = { id: userId, email: payload.email };
    return next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}
