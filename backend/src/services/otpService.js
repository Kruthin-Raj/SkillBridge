import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sendMail } from './mailer.js';

/**
 * One-time passwords, kept in memory.
 *
 * Memory is fine here: an OTP lives for ten minutes and a restart simply means
 * the student asks for a new code. Move this to a Redis or a Supabase table
 * only if the API is ever run as more than one instance.
 */
const pending = new Map(); // email -> { hash, expiresAt, attempts }

const hash = (code) => createHash('sha256').update(code).digest();

const generateCode = () => {
  const max = 10 ** env.otp.length;
  return String(randomInt(0, max)).padStart(env.otp.length, '0');
};

const buildMessage = (code) => ({
  subject: `Your SkillBridge verification code: ${code}`,
  text: [
    'SkillBridge',
    '',
    `Your verification code is: ${code}`,
    '',
    `It expires in ${env.otp.ttlMinutes} minutes and can be used once.`,
    'If you did not request this, you can ignore this email.',
  ].join('\n'),
});

/** Creates a code, stores its hash and hands it to the mailer. */
export async function issueOtp(email) {
  const code = generateCode();

  pending.set(email, {
    hash: hash(code),
    expiresAt: Date.now() + env.otp.ttlMinutes * 60_000,
    attempts: 0,
  });

  const { subject, text } = buildMessage(code);
  const result = await sendMail({ to: email, subject, text });

  return { expiresInMinutes: env.otp.ttlMinutes, ...result };
}

/** Consumes a code. Throws if it is missing, expired, exhausted or wrong. */
export function verifyOtp(email, code) {
  const entry = pending.get(email);

  if (!entry) {
    throw ApiError.badRequest('No code was requested for this email. Request a new one.');
  }
  if (Date.now() > entry.expiresAt) {
    pending.delete(email);
    throw ApiError.badRequest('That code has expired. Request a new one.');
  }
  if (entry.attempts >= env.otp.maxAttempts) {
    pending.delete(email);
    throw ApiError.tooManyRequests('Too many wrong attempts. Request a new code.');
  }

  const supplied = hash(String(code));
  if (!timingSafeEqual(supplied, entry.hash)) {
    entry.attempts += 1;
    throw ApiError.badRequest('That code is not correct.');
  }

  pending.delete(email);
  return true;
}
