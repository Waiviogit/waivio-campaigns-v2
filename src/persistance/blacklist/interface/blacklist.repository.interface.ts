import {
  BlacklistDocumentType,
  BlacklistFindOneType,
  BlacklistUpdateType,
} from '../types';
import { UpdateWriteOpResult } from 'mongoose';

export interface BlacklistRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: BlacklistFindOneType): Promise<BlacklistDocumentType>;

  updateOne({
    filter,
    update,
    options,
  }: BlacklistUpdateType): Promise<UpdateWriteOpResult>;

  find({
    filter,
    projection,
    options,
  }: BlacklistFindOneType): Promise<BlacklistDocumentType[]>;
}
