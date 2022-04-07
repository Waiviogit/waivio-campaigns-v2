import { AppFindType } from '../types/app.repository.types';
import { AppDocumentType } from '../types';

export interface AppRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: AppFindType): Promise<AppDocumentType>;
  findOneByHost(host: string): Promise<AppDocumentType>;
}
