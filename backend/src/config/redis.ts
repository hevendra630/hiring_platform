import IORedis, { Redis } from 'ioredis';
import { env } from '@config/env';
import { logger } from '@utils/logger';

/**
 * A single shared Redis connection used for:
 *  - BullMQ job queues (AI scoring, email sending, report generation)
 *  - express-rate-limit store
 *  - generic caching (e.g. cached analytics aggregates)
 *
 * BullMQ requires `maxRetriesPerRequest: null` on connections it owns.
 */
export const redisConnection: Redis = new IORedis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('error', (err) => logger.error('Redis error', { error: err.message }));
