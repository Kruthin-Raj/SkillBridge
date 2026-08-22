import { env } from '../../config/env.js';
import { db, TABLES } from '../../db/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../middleware/requireAuth.js';
import { issueOtp, verifyOtp } from '../../services/otpService.js';

const normaliseEmail = (email) => String(email).trim().toLowerCase();

/** Slide 4: sign-up is restricted to the college domain, so every user is a verified student. */
const assertCollegeEmail = (email) => {
  if (!email.endsWith(`@${env.allowedEmailDomain}`)) {
    throw ApiError.forbidden(
      `SkillBridge is open only to @${env.allowedEmailDomain} email addresses.`
    );
  }
};

export async function requestOtp(rawEmail) {
  const email = normaliseEmail(rawEmail);
  assertCollegeEmail(email);
  return issueOtp(email);
}

/**
 * Verifies the code and returns a token. First-time verifiers get a user row
 * created for them, so there is no separate registration step.
 */
export async function verifyOtpAndIssueToken(rawEmail, code) {
  const email = normaliseEmail(rawEmail);
  assertCollegeEmail(email);
  verifyOtp(email, code);

  let user = await db.findOne(TABLES.users, { email });
  let isNewUser = false;

  if (!user) {
    user = await db.insert(TABLES.users, {
      email,
      full_name: email.split('@')[0],
      bio: '',
      skills_offered: [],
      skills_wanted: [],
      rating_average: 0,
      rating_count: 0,
    });
    isNewUser = true;
  }

  return { token: signToken(user), user, isNewUser };
}

export async function getUserById(id) {
  const user = await db.findOne(TABLES.users, { id });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}
