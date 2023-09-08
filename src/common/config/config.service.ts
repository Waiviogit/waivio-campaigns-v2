import * as dotenv from 'dotenv';

import { ENSURE_VALUES } from '../constants';
import * as process from 'process';

dotenv.config({ path: `env/${process.env.NODE_ENV || 'development'}.env` });

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

    const defaultConnectionString = `mongodb://${host}:${port}/${db}`;
    const connectionString = process.env.MONGO_URI_WAIVIO
      ? process.env.MONGO_URI_WAIVIO
      : defaultConnectionString;

    return connectionString;
  }

  public getMongoCurrenciesConnectionString(): string {
    const host = this.getValue('MONGO_HOST');
    const port = this.getValue('MONGO_PORT');
    const db = this.getValue('CURRENCIES_DB');
    const defaultConnectionString = `mongodb://${host}:${port}/${db}`;
    const connectionString = process.env.MONGO_URI_CURRENCIES
      ? process.env.MONGO_URI_CURRENCIES
      : defaultConnectionString;

    return connectionString;
  }

  public getRedisBlocksConfig(): string {
    const host = this.getValue('REDIS_HOST');
    const port = this.getValue('REDIS_PORT');
    const db = this.getValue('REDIS_DB_BLOCKS');

    return `redis://${host}:${port}/${db}`;
  }

  public getRedisCampaignsConfig(): string {
    const host = this.getValue('REDIS_HOST');
    const port = this.getValue('REDIS_PORT');
    const db = this.getValue('REDIS_DB_CAMPAIGNS');

    return `redis://${host}:${port}/${db}`;
  }

  public getRedisCampaignsDB(): string {
    return this.getValue('REDIS_DB_CAMPAIGNS');
  }

  public getPort(): string {
    return this.getValue('PORT', true);
  }

  public getAppHost(): string {
    return this.getValue('APP_HOST', true);
  }

  public getGuestValidationURL(): string {
    return this.getValue('VALIDATE_GUEST_TOKEN_ROUTE', true);
  }

  public getNotificationsKey(): string {
    return this.getValue('API_KEY', true);
  }

  public getAntiApp(): string {
    return this.getValue('ANTI_APP', true);
  }

  public getNotificationsRoute(): string {
    return this.getValue('NOTIFICATIONS_SET', true);
  }
}

const configService = new ConfigService(process.env).ensureValues(
  ENSURE_VALUES,
);

export { configService };
