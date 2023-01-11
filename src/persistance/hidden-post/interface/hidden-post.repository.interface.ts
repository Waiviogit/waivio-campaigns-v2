import { HiddenPostDocumentType, HiddenPostFindOneType } from '../types';

export interface HiddenPostRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: HiddenPostFindOneType): Promise<HiddenPostDocumentType[]>;

  findOne({
    filter,
    projection,
    options,
  }: HiddenPostFindOneType): Promise<HiddenPostDocumentType>;
}
