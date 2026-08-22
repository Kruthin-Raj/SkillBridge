import { ZodError } from 'zod';
import { isDev } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`No route matches ${req.method} ${req.originalUrl}`));
}

/* eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  // Anything reaching here is unexpected - always surface it in the log.
  console.error('[unhandled]', err);
  return res.status(500).json({
    error: 'Internal server error',
    details: isDev ? err.message : undefined,
  });
}
