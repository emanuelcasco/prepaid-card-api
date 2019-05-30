const Redis = require('ioredis');

const logger = require('../../logger');

exports.createRedisClient = redisURL => {
  const redis = new Redis(redisURL);

  redis.on('connect', () => {
    logger.info('[Redis] Connected');
  });

  redis.on('error', err => {
    logger.error(`[Redis] Error: ${err}`);
  });

  return redis;
};
