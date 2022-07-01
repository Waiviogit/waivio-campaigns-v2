import {
  BlacklistDocumentType,
  BlacklistFindOneType,
  BlacklistFindOneTypeOut,
  BlacklistUpdateType,
} from '../types';
import { UpdateWriteOpResult } from 'mongoose';

export interface BlacklistRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: BlacklistFindOneType): Promise<BlacklistFindOneTypeOut>;

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
