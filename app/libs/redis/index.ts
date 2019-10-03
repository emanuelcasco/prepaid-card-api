import IORedis, { Redis } from 'ioredis';

import logger from '../../logger';

const createRedisClient = (redisURL: string): Redis => {
  const redis = new IORedis(redisURL);

  redis.on(
    'connect',
    (): void => {
      logger.info('[Redis] Connected');
    }
  );

  redis.on(
    'error',
    (err: unknown): void => {
      logger.error(`[Redis] Error: ${err}`);
    }
  );

  return redis;
};

export default createRedisClient;
