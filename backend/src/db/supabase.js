import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Server-side Supabase client. It uses the service-role key, which bypasses
 * Row Level Security, so this module must never be imported by the frontend.
 * Every request is authorised in our own middleware before it reaches here.
 */
export const supabase = createClient(env.supabase.url, env.supabase.serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const fail = (error) => {
  throw new ApiError(500, `Database error: ${error.message}`);
};

const applyWhere = (query, where = {}) =>
  Object.entries(where).reduce((acc, [column, value]) => acc.eq(column, value), query);

export const supabaseDb = {
  kind: 'supabase',

  async insert(table, row) {
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) fail(error);
    return data;
  },

  async findOne(table, where) {
    const { data, error } = await applyWhere(supabase.from(table).select('*'), where)
      .limit(1)
      .maybeSingle();
    if (error) fail(error);
    return data;
  },

  async findMany(table, where = {}, options = {}) {
    const { orderBy = 'created_at', ascending = false, limit = 50 } = options;
    const { data, error } = await applyWhere(supabase.from(table).select('*'), where)
      .order(orderBy, { ascending })
      .limit(limit);
    if (error) fail(error);
    return data ?? [];
  },

  async update(table, where, patch) {
    const { data, error } = await applyWhere(supabase.from(table).update(patch), where)
      .select()
      .maybeSingle();
    if (error) fail(error);
    return data;
  },

  async remove(table, where) {
    const { error } = await applyWhere(supabase.from(table).delete(), where);
    if (error) fail(error);
    return true;
  },
};
