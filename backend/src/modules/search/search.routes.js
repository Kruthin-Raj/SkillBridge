import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db, TABLES } from '../../db/index.js';
import { supabase } from '../../db/supabase.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { fuzzyFilterAndSort } from '../../utils/fuzzySearch.js';

/**
 * Express API routes for unified search with typo-tolerance.
 * @author = kruthinraj
 * @date = 2026-10-15
 */

const router = Router();

/** Never leak another student's sensitive info. */
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

/**
 * GET /api/search?q=...&type=all|users|posts
 * Returns typo-tolerant matches for users and posts accessible to the requester.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = (req.query.q || '').trim();
    const type = req.query.type || 'all'; // 'all' | 'users' | 'posts'

    if (!q) {
      return res.json({ query: '', users: [], listings: [], total: 0 });
    }

    // Attempt to extract token to filter by college scoping
    let token = null;
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      token = header.substring(7).trim();
      if (token === 'null' || token === 'undefined') token = null;
    }

    let userCollegeId = null;
    if (token) {
      try {
        const payload = jwt.verify(token, env.jwtSecret);
        userCollegeId = payload.college_id;
      } catch (err) {
        // Continue unauthenticated if token invalid/expired
      }
    }

    try {
      let matchedUsers = [];
      let matchedListings = [];

      // 1. Search Users if requested
      if (type === 'all' || type === 'users') {
        let userQuery = supabase
          .from(TABLES.users)
          .select('id, full_name, bio, avatar_url, skills_offered, skills_wanted, rating_average, rating_count, college_id, created_at')
          .neq('email', 'kruthin123@gmail.com');

        if (userCollegeId) {
          userQuery = userQuery.eq('college_id', userCollegeId);
        }

        const { data: rawUsers, error: userErr } = await userQuery.limit(200);
        if (userErr) {
          console.error('[Search Users Supabase Error]', userErr);
        } else if (rawUsers) {
          const eligibleUsers = rawUsers;
          const userTextExtractor = (u) => [
            u.full_name || '',
            u.bio || '',
            Array.isArray(u.skills_offered) ? u.skills_offered.join(' ') : '',
            Array.isArray(u.skills_wanted) ? u.skills_wanted.join(' ') : '',
          ].join(' ');

          matchedUsers = fuzzyFilterAndSort(eligibleUsers, q, userTextExtractor, 0.55)
            .map(toPublicProfile)
            .slice(0, 30);
        }
      }

      // 2. Search Listings/Posts if requested
      if (type === 'all' || type === 'posts') {
        let listingQuery = supabase
          .from(TABLES.listings)
          .select('*')
          .neq('status', 'cancelled');

        if (userCollegeId) {
          listingQuery = listingQuery.eq('college_id', userCollegeId);
        }

        const { data: rawListings, error: listingErr } = await listingQuery.limit(200);
        if (listingErr) {
          console.error('[Search Listings Supabase Error]', listingErr);
        } else if (rawListings) {
          // Fetch owner details for display
          const ownerIds = [...new Set(rawListings.map(l => l.owner_id).filter(Boolean))];
          let ownerMap = new Map();
          if (ownerIds.length > 0) {
            const { data: owners } = await supabase
              .from(TABLES.users)
              .select('id, full_name, avatar_url')
              .in('id', ownerIds);
            if (owners) {
              for (const o of owners) {
                ownerMap.set(o.id, o);
              }
            }
          }

          // Attach owner info
          const listingsWithOwner = rawListings.map(l => ({
            ...l,
            owner: ownerMap.get(l.owner_id) || null,
          }));

          const listingTextExtractor = (l) => [
            l.title || '',
            l.description || '',
            Array.isArray(l.tags) ? l.tags.join(' ') : '',
            l.skill_offered || '',
            l.skill_wanted || '',
            l.mode || '',
            l.owner?.full_name || '',
          ].join(' ');

          matchedListings = fuzzyFilterAndSort(listingsWithOwner, q, listingTextExtractor, 0.55)
            .slice(0, 30);
        }
      }

      res.json({
        query: q,
        users: matchedUsers,
        listings: matchedListings,
        total: matchedUsers.length + matchedListings.length,
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error('[Unified Search Error]', err);
      throw new ApiError(503, "Shhh... it's bedtime right now! 😴 I'm busy taking a quick nap, try again later.");
    }
  })
);

export default router;
