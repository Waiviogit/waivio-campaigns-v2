import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import * as _ from 'lodash';

import { Wobject } from './wobject.schema';
import {
  WobjectDocumentType,
  WobjectFindType,
  WobjectUpdateType,
} from './types';
import { WobjectRepositoryInterface } from './interface';
import { CAMPAIGN_STATUS, WOBJECT_STATUS } from '../../common/constants';

@Injectable()
export class WobjectRepository implements WobjectRepositoryInterface {
  private readonly logger = new Logger(WobjectRepository.name);
  constructor(
    @InjectModel(Wobject.name)
    private readonly model: Model<WobjectDocumentType>,
  ) {}

  async findOne({
    filter,
    projection,
    options,
  }: WobjectFindType): Promise<WobjectDocumentType> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter,
    projection,
    options,
  }: WobjectFindType): Promise<WobjectDocumentType[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async updateOne({
    filter,
    update,
    options,
  }: WobjectUpdateType): Promise<UpdateWriteOpResult> {
    try {
      return this.model.updateOne(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async updateMany({
    filter,
    update,
    options,
  }: WobjectUpdateType): Promise<UpdateWriteOpResult> {
    try {
      return this.model.updateMany(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  /*
  Domain
   */
  async findUnavailableByLink(
    author_permlink: string,
  ): Promise<WobjectDocumentType> {
    return this.findOne({
      filter: {
        author_permlink,
        'status.title': {
          $in: [WOBJECT_STATUS.UNAVAILABLE, WOBJECT_STATUS.RELISTED],
        },
      },
    });
  }

  async updateCampaignsCount(
    _id: string,
    status: string,
    links: string[],
  ): Promise<void> {
    const updateData =
      status === CAMPAIGN_STATUS.ACTIVE
        ? { $addToSet: { activeCampaigns: _id } }
        : { $pull: { activeCampaigns: _id } };

    await this.updateMany({
      filter: { author_permlink: { $in: links } },
      update: updateData,
    });

    const wobjects = await this.find({
      filter: { author_permlink: { $in: links } },
      projection: { activeCampaigns: 1 },
    });

    for (const wobject of wobjects) {
      await this.updateOne({
        filter: { _id: wobject._id },
        update: {
          activeCampaignsCount: _.get(wobject, 'activeCampaigns.length', 0),
        },
      });
    }
  }

  findOneByPermlink(author_permlink: string): Promise<WobjectDocumentType> {
    return this.findOne({
      filter: {
        author_permlink,
      },
    });
  }
}
