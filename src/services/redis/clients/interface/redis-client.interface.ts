export interface RedisClientInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<string>;
  setex(key: string, expire: number, value: string): Promise<string>;
  deleteKey(key: string): Promise<number>;
  hGetAll(key: string): Promise<object>;
  publish(key: string, data: string): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zremrangebyscore(key: string, min: number, max: number): Promise<number>;
  zrem(key: string, member: string): Promise<number>;
  // Queue methods for comment posting
  lpush(key: string, value: string): Promise<number>;
  rpop(key: string): Promise<string | null>;
  llen(key: string): Promise<number>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
}
