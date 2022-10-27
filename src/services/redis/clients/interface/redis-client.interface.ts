export interface RedisClientInterface {
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<string>;
  setex(key: string, expire: number, value: string): Promise<string>;
  deleteKey(key: string): Promise<string>;
  hGetAll(key: string): Promise<object>;
  publish(key: string, data: string): Promise<string>;
  zadd(key: string, score: number, member: string): Promise<string>;
  zremrangebyscore(key: string, min: number, max: number): Promise<string>;
  zrem(key: string, member: string): Promise<string>;
}
