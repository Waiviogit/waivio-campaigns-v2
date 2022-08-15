import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GuidePayablesOutDto,
  GuidePayablesUserOutDto,
} from '../../../common/dto/payables/out';
import { PayablesService } from './payables.service';
import {
  GuidePayablesAllInDto,
  PayablesInDto,
} from '../../../common/dto/payables/in';
import { PayablesControllerDoc } from './payables.controller.doc';

@Controller('payables')
@PayablesControllerDoc.main()
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Get('guide/:guideName')
  @PayablesControllerDoc.getGuidePayments()
  async getGuidePayments(
    @Param('guideName')
    guideName: string,
    @Query() query: GuidePayablesAllInDto,
  ): Promise<GuidePayablesOutDto> {
    return this.payablesService.getGuidePayments({ guideName, ...query });
  }

  @Get('guide/:guideName/:userName')
  @PayablesControllerDoc.getGuidePaymentsByUser()
  async getGuidePaymentsByUser(
    @Param('guideName')
    guideName: string,
    @Param('userName')
    userName: string,
    @Query() query: PayablesInDto,
  ): Promise<GuidePayablesUserOutDto> {
    return this.payablesService.getGuidePaymentsByUser({
      guideName,
      userName,
      ...query,
    });
  }
}
