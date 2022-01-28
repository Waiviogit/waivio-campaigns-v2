import { Controller, Post, Body, Get } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto';
import { CampaignControllerDocs } from './campaign.controller.doc';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { configService } from '../../common/config';

@Controller('campaign')
@CampaignControllerDocs.main()
export class CampaignController {
  client: ClientProxy;
  constructor(private readonly campaignService: CampaignService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [configService.getRabbitConnectionString()],
        queue: configService.getCampaignsQueue(),
        queueOptions: { durable: true },
        socketOptions: { noDelay: true },
      },
    });
  }

  @Post('create')
  @CampaignControllerDocs.createCampaign()
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return await this.campaignService.createCampaign(createCampaignDto);
  }

  @Get('send')
  async send() {
    console.log('sended -----------');
    return this.client.send<number>({ cmd: 'test' }, 1231);
  }
}
