import { BlockProcessor } from '../../domain/processor/block-processor';

export const ENSURE_VALUES = [
  'MONGO_HOST',
  'MONGO_PORT',
  'WAIVIO_DB',
  'CURRENCIES_DB',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_DB_BLOCKS',
  'API_KEY',
];
export const BLOCK_MAIN_PROCESSOR = `BLOCK_NUM_${BlockProcessor.name}`;
