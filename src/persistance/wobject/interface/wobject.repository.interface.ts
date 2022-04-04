import { WobjectFindType, WobjectUpdateType } from '../types';
import { Wobject } from '../wobject.schema';
import { UpdateWriteOpResult } from 'mongoose';

export interface WobjectRepositoryInterface {
  findOne({ filter, projection, options }: WobjectFindType): Promise<Wobject>;
  find({ filter, projection, options }: WobjectFindType): Promise<Wobject[]>;
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
  findUnavailableByLink(author_permlink: string): Promise<Wobject>;
  updateCampaignsCount(
      _id: string,
      status: string,
      links: string[],
  ): Promise<void>;
}
