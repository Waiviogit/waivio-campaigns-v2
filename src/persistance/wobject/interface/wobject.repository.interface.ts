import {
  WobjectDocumentType,
  WobjectFindType,
  WobjectUpdateType,
} from '../types';
import { UpdateWriteOpResult } from 'mongoose';

export interface WobjectRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: WobjectFindType): Promise<WobjectDocumentType>;
  find({
    filter,
    projection,
    options,
  }: WobjectFindType): Promise<WobjectDocumentType[]>;
  updateMany({
    filter,
    update,
    options,
  }: WobjectUpdateType): Promise<UpdateWriteOpResult>;
  updateOne({
    filter,
    update,
    options,
  }: WobjectUpdateType): Promise<UpdateWriteOpResult>;
  /*
  Domain
   */
  findUnavailableByLink(author_permlink: string): Promise<WobjectDocumentType>;
  updateCampaignsCount(
    _id: string,
    status: string,
    links: string[],
  ): Promise<void>;
  findOneByPermlink(author_permlink: string): Promise<WobjectDocumentType>;
}
