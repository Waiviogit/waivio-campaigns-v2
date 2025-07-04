import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GiveawayParticipants } from './giveaway-participants.schema';
import { GiveawayParticipantsRepositoryInterface } from './interface';
import { GiveawayParticipantsDocumentType } from './types/giveaway-participants.types';
import { GiveawayParticipantsFindType } from './types/giveaway-participants.repository.type';

export class GiveawayParticipantsRepository
  implements GiveawayParticipantsRepositoryInterface
{
  private readonly logger = new Logger(GiveawayParticipantsRepository.name);
  constructor(
    @InjectModel(GiveawayParticipants.name)
    private readonly model: Model<GiveawayParticipantsDocumentType>,
  ) {}

  async find({
    filter,
    projection,
    options,
  }: GiveawayParticipantsFindType): Promise<
    GiveawayParticipantsDocumentType[]
  > {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async insertMany(
    docs: { userName: string; activationPermlink: string }[],
  ): Promise<void> {
    try {
      await this.model.insertMany(docs);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
