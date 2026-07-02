import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisConnection } from '@config/redis';
import { env } from '@config/env';

// Jest/CI runs don't spin up Redis, so fall back to the in-memory store there.
// In every real environment (dev/staging/prod) we use Redis so limits are
// shared correctly across horizontally-scaled API instances.
const isTest = env.nodeEnv === 'test';

const redisStore = (prefix: string) =>
  isTest
    ? undefined
    : new RedisStore({
        sendCommand: (...args: [string, ...string[]]) =>
          redisConnection.call(...args) as unknown as Promise<import('rate-limit-redis').RedisReply>,
        prefix,
      });

/** General-purpose API limiter */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore('rl:api:'),
  message: { success: false, statusCode: 429, message: 'Too many requests, please try again later.' },
});

/** Stricter limiter for auth endpoints (login/signup/forgot-password) to deter brute force */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore('rl:auth:'),
  message: { success: false, statusCode: 429, message: 'Too many auth attempts, please try again later.' },
});
