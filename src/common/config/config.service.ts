import * as dotenv from 'dotenv';

import { ENSURE_VALUES } from '../constants';

dotenv.config({ path: `env/.env.${process.env.NODE_ENV || 'development'}` });

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value;
  }

  public ensureValues(keys: string[]): ConfigService {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getMongoWaivioConnectionString(): string {
    const host = this.getValue('MONGO_HOST');
    const port = this.getValue('MONGO_PORT');
    const db = this.getValue('WAIVIO_DB');
    return `mongodb://${host}:${port}/${db}`;
  }

  public getPort(): string {
    return this.getValue('PORT', true);
  }
}

const configService = new ConfigService(process.env).ensureValues(
  ENSURE_VALUES,
);

export { configService };
