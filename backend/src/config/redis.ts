import Redis from 'ioredis';
import config from './index';
import pino from 'pino';

const logger = pino({ level: config.logging.level });

let redis: Redis | null = null;
let redisConnected = false;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryStrategy: config.redis.retryStrategy,
      lazyConnect: true,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
    });

    redis.on('error', (err: Error) => {
      logger.warn('Redis error:', err.message);
      redisConnected = false;
    });
    redis.on('connect', () => {
      logger.info('Redis connected');
      redisConnected = true;
    });
    redis.on('close', () => {
      redisConnected = false;
    });
    
    // Attempt connection but don't block
    redis.connect().catch(err => {
      logger.warn('Redis connection failed (non-blocking):', err.message);
    });
  }
  return redis;
}

export function isRedisConnected(): boolean {
  return redisConnected;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export default { getRedis, closeRedis };
