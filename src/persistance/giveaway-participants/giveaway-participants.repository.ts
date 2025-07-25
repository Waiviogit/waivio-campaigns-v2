import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GiveawayParticipants } from './giveaway-participants.schema';
import { GiveawayParticipantsRepositoryInterface } from './interface';
import { GiveawayParticipantsDocumentType } from './types/giveaway-participants.types';
import { MongoRepository } from '../mongo.repository';

export class GiveawayParticipantsRepository
  extends MongoRepository<GiveawayParticipantsDocumentType>
  implements GiveawayParticipantsRepositoryInterface
{
  constructor(
    @InjectModel(GiveawayParticipants.name)
    protected readonly model: Model<GiveawayParticipantsDocumentType>,
  ) {
    super(model, new Logger(GiveawayParticipantsRepository.name));
  }

  async insertMany(
    docs: { userName: string; activationPermlink: string; eventId?: string }[],
  ): Promise<void> {
    try {
      await this.model.insertMany(docs);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async getByNamesByActivationPermlink(
    activationPermlink: string,
  ): Promise<string[]> {
    const users = await this.find({
      filter: { activationPermlink },
    });

    return (users || []).map((el) => el.userName);
  }

  async getByNamesByActivationPermlinkEventId(
    activationPermlink: string,
    eventId: string,
  ): Promise<string[]> {
    const users = await this.find({
      filter: { activationPermlink, eventId },
    });

    return (users || []).map((el) => el.userName);
  }
}
