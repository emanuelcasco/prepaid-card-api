/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from 'ioredis';

import createRedisClient from '../redis';

export interface ICacheInput<TypeResult> {
  fn(...args: any[]): Promise<TypeResult>;
  args: any[];
  key: string;
  ttl: number;
  force?: boolean;
}

export interface ICacheOutput<TypeResult> {
  data: TypeResult;
  cache: boolean;
  ttl: number;
  force?: boolean;
}

class Cachify {
  redis: Redis;

  constructor(redisUrl: string) {
    this.redis = createRedisClient(redisUrl);
  }

  fetchOrCache<TypeResult>({
    fn,
    args,
    key,
    ttl,
    force = false
  }: ICacheInput<TypeResult>): Promise<ICacheOutput<TypeResult>> {
    return this.redis.get(key).then((cachedValue: string | null) => {
      if (cachedValue && !force) {
        return { data: JSON.parse(cachedValue), cache: true, ttl };
      }
      return Promise.resolve(fn(...args)).then((fetchValue: TypeResult) =>
        this.redis.set(key, JSON.stringify(fetchValue), 'EX', ttl).then(() => {
          const output: ICacheOutput<TypeResult> = { data: fetchValue, cache: false, ttl, force };
          return output;
        })
      );
    });
  }
}

export default Cachify;
