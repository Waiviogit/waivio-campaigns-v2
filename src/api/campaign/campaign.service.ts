import { Injectable } from '@nestjs/common';
import { CreateCampaignDto } from './dto';

@Injectable()
export class CampaignService {
  constructor(
    // @InjectModel(Todo.name)
    // private readonly model: Model<TodoDocument>,
  ) {}

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    console.log('created _________');
  }
}
