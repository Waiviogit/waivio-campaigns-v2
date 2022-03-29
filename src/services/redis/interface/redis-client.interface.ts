export interface RedisClientInterface {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<string | undefined>;
}
