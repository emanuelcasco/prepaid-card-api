const redis = require('../redis');

class Cachify {
  constructor(redisUrl) {
    this.redis = redis.createRedisClient(redisUrl);
  }

  fetchOrCache({ fn, args, key, ttl, force = false }) {
    return this.redis.get(key).then(cachedValue => {
      if (cachedValue && !force) {
        return { data: JSON.parse(cachedValue), cache: true };
      }
      return Promise.resolve(fn(...args)).then(fetchValue => {
        return this.redis
          .set(key, JSON.stringify(fetchValue), 'EX', ttl)
          .then(() => ({ data: fetchValue, cache: false, ttl, force }));
      });
    });
  }
}

module.exports = Cachify;
