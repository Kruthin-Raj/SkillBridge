import { randomUUID } from 'node:crypto';

/**
 * In-memory stand-in for Supabase, used only while SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY are unset. It lets the whole app run end to end
 * before the database exists. Everything is lost when the server restarts.
 */
const tables = new Map();

const rowsOf = (name) => {
  if (!tables.has(name)) tables.set(name, []);
  return tables.get(name);
};

const matches = (row, where = {}) =>
  Object.entries(where).every(([key, value]) => row[key] === value);

const compare = (a, b, key, ascending) => {
  const left = a[key] ?? '';
  const right = b[key] ?? '';
  if (left === right) return 0;
  const result = left < right ? -1 : 1;
  return ascending ? result : -result;
};

export const memoryDb = {
  kind: 'memory',

  async insert(name, row) {
    const record = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      ...row,
    };
    rowsOf(name).push(record);
    return { ...record };
  },

  async findOne(name, where) {
    const row = rowsOf(name).find((candidate) => matches(candidate, where));
    return row ? { ...row } : null;
  },

  async findMany(name, where = {}, options = {}) {
    const { orderBy = 'created_at', ascending = false, limit = 50 } = options;
    return rowsOf(name)
      .filter((row) => matches(row, where))
      .sort((a, b) => compare(a, b, orderBy, ascending))
      .slice(0, limit)
      .map((row) => ({ ...row }));
  },

  async update(name, where, patch) {
    const row = rowsOf(name).find((candidate) => matches(candidate, where));
    if (!row) return null;
    Object.assign(row, patch, { updated_at: new Date().toISOString() });
    return { ...row };
  },

  async remove(name, where) {
    const rows = rowsOf(name);
    const index = rows.findIndex((candidate) => matches(candidate, where));
    if (index === -1) return false;
    rows.splice(index, 1);
    return true;
  },
};
