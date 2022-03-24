export interface RedisClient {
  get(key: number): Promise<string>;
}
