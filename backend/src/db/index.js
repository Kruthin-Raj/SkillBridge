import { isSupabaseConfigured } from '../config/env.js';
import { memoryDb } from './memory.js';

/**
 * Single data-access entry point.
 *
 * Both drivers expose the same five methods, so no module above this layer
 * needs to know whether it is talking to Postgres or to a Map:
 *
 *   db.insert(table, row)
 *   db.findOne(table, where)
 *   db.findMany(table, where, { orderBy, ascending, limit })
 *   db.update(table, where, patch)
 *   db.updateMany(table, where, patch)
 *   db.remove(table, where)
 *
 * The Supabase module is imported lazily so the app still boots when the
 * credentials are missing.
 */
let db = memoryDb;

if (isSupabaseConfigured) {
  const { supabaseDb } = await import('./supabase.js');
  db = supabaseDb;
}

export { db };

/** Table names, kept in one place so a typo becomes an import error. */
export const TABLES = {
  users: 'users',
  listings: 'listings',
  bids: 'bids',
  exchanges: 'exchanges',
  reviews: 'reviews',
  messages: 'messages',
  reports: 'reports',
};
