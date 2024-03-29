import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  GlobalReportOutDto,
  GuidePayablesOutDto,
  GuidePayablesUserOutDto,
  PayableWarningDto,
  SingleReportOutDto,
  UserReceivablesOutDto,
} from '../../../common/dto/payables/out';
import { PayablesService } from './payables.service';
import {
  GlobalReportInDto,
  GuidePayablesAllInDto,
  PayablesInDto,
  SingleReportInDto,
} from '../../../common/dto/payables/in';
import { PayablesControllerDoc } from './payables.controller.doc';
import { CustomHeaders } from '../../../common/decorators';
import { HostPipe } from '../../pipes/host.pipe';

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
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('guideName')
    guideName: string,
    @Param('userName')
    userName: string,
    @Query() query: PayablesInDto,
  ): Promise<GuidePayablesUserOutDto> {
    return this.payablesService.getGuidePaymentsByUser({
      guideName,
      userName,
      host,
      ...query,
    });
  }

  @Get('user/:userName')
  @PayablesControllerDoc.getUserReceivables()
  async getUserReceivables(
    @Param('userName')
    userName: string,
    @Query() query: GuidePayablesAllInDto,
  ): Promise<UserReceivablesOutDto> {
    return this.payablesService.getUserReceivables({ userName, ...query });
  }

  @Get('report')
  @PayablesControllerDoc.getSingleReport()
  async getSingleReport(
    @CustomHeaders(new HostPipe())
    host: string,
    @Query() query: SingleReportInDto,
  ): Promise<SingleReportOutDto> {
    return this.payablesService.getSingleReport({ host, ...query });
  }

  @Post('report/global')
  @PayablesControllerDoc.getSingleReport()
  async getGlobalReport(
    @CustomHeaders(new HostPipe())
    host: string,
    @Body() body: GlobalReportInDto,
  ): Promise<GlobalReportOutDto> {
    return this.payablesService.getGlobalReport({
      host,
      ...body,
    });
  }

  @Get('warning/:guideName')
  @PayablesControllerDoc.getPayableWarning()
  async getPayableWarning(
    @Param('guideName')
    guideName: string,
  ): Promise<PayableWarningDto> {
    return this.payablesService.payableWarning(guideName);
  }
}
