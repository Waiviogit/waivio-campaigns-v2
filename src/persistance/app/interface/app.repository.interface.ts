import { AppFindType } from '../types/app.repository.types';
import { App } from '../app.schema';

export interface AppRepositoryInterface {
  findOne({ filter, projection, options }: AppFindType): Promise<App>;
  findOneByHost(host: string): Promise<App>;
}
