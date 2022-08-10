import { Controller, Get, Param, Query } from '@nestjs/common';
import { GuidePayablesOutDto } from '../../../common/dto/payables/out';
import { PayablesService } from './payables.service';
import { PayablesInDto } from '../../../common/dto/payables/in';
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
    @Query() query: PayablesInDto,
  ): Promise<GuidePayablesOutDto> {
    return this.payablesService.getGuidePayments({ guideName, ...query });
  }
}
