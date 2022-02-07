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

  // async create(data: KekDto): Promise<Todo> {
  //   return await new this.model(data).save();
  // }
  //
  // async findOne(id: string): Promise<Todo> {
  //   return await this.model.findById(id).exec();
  // }
}
