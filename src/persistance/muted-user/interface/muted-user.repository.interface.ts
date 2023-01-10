import { MutedUserDocumentType, MutedUserFindOneType } from '../types';

export interface MutedUserRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: MutedUserFindOneType): Promise<MutedUserDocumentType[]>;
}
