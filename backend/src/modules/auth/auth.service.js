import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { db, TABLES } from '../../db/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../middleware/requireAuth.js';
import { issueOtp, verifyOtp } from '../../services/otpService.js';

const normaliseEmail = (email) => String(email).trim().toLowerCase();

const assertCollegeEmail = (email) => {
  if (!email.endsWith(`@${env.allowedEmailDomain}`)) {
    throw ApiError.forbidden(
      `SkillBridge is open only to @${env.allowedEmailDomain} email addresses.`
    );
  }
};

/** Send an OTP code (used by both registration and forgot-password). */
export async function requestOtp(rawEmail) {
  const email = normaliseEmail(rawEmail);
  assertCollegeEmail(email);
  return issueOtp(email);
}

/** Sign in with email + password. */
export async function loginWithPassword(rawEmail, password) {
  const email = normaliseEmail(rawEmail);
  assertCollegeEmail(email);

  const user = await db.findOne(TABLES.users, { email });
  if (!user) {
    throw ApiError.unauthorized('No account found. Please register first.');
  }

  if (!user.password_hash) {
    throw ApiError.badRequest(
      'No password set on this account. Use "Forgot password" to set one.'
    );
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw ApiError.unauthorized('Incorrect password.');
  }

  return { token: signToken(user), user };
}

/** Register a new user — requires email, password, and a valid OTP. */
export async function registerWithOtp(rawEmail, password, code) {
  const email = normaliseEmail(rawEmail);
  assertCollegeEmail(email);
  verifyOtp(email, code); // throws if invalid

  const existing = await db.findOne(TABLES.users, { email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists. Please sign in.');
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await db.insert(TABLES.users, {
    email,
    full_name: '',
    bio: '',
    password_hash: hash,
    skills_offered: [],
    skills_wanted: [],
    rating_average: 0,
    rating_count: 0,
  });

  return { token: signToken(user), user };
}

/** Forgot-password flow: verify OTP, then set new password. */
export async function resetPassword(rawEmail, code, password) {
  const email = normaliseEmail(rawEmail);
  assertCollegeEmail(email);
  verifyOtp(email, code);

  const user = await db.findOne(TABLES.users, { email });
  if (!user) {
    throw ApiError.notFound('No account found with this email.');
  }

  const hash = await bcrypt.hash(password, 12);
  const updated = await db.update(TABLES.users, { id: user.id }, { password_hash: hash });

  return { token: signToken(updated), user: updated };
}

/** Change password while already signed in. */
export async function setPassword(userId, password) {
  const hash = await bcrypt.hash(password, 12);
  const user = await db.update(TABLES.users, { id: userId }, { password_hash: hash });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function getUserById(id) {
  const user = await db.findOne(TABLES.users, { id });
  if (!user) throw ApiError.unauthorized('User not found (please sign in again)');
  return user;
}
