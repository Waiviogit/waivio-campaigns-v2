export interface RedisClientInterface {
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<string>;
  setex(key: string, expire: number, value: string): Promise<string>;
  deleteKey(key: string): Promise<string>;
  hGetAll(key: string): Promise<object>;
  publish(key: string, data: string): Promise<string>;
}
