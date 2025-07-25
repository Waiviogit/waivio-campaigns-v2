import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import { Wobject } from './wobject.schema';
import { WobjectDocumentType } from './types';
import { WobjectRepositoryInterface } from './interface';
import { CAMPAIGN_STATUS, WOBJECT_STATUS } from '../../common/constants';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class WobjectRepository
  extends MongoRepository<WobjectDocumentType>
  implements WobjectRepositoryInterface
{
  constructor(
    @InjectModel(Wobject.name)
    readonly model: Model<WobjectDocumentType>,
  ) {
    super(model, new Logger(WobjectRepository.name));
  }

  async findUnavailableByLink(
    author_permlink: string,
  ): Promise<WobjectDocumentType> {
    return this.findOne({
      filter: {
        $and: [
          { author_permlink },
          {
            'status.title': {
              $in: [WOBJECT_STATUS.UNAVAILABLE, WOBJECT_STATUS.RELISTED],
            },
          },
        ],
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
