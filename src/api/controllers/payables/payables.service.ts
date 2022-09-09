import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_PAYMENT_PROVIDE } from '../../../common/constants';
import {
  GetGlobalReportApiInterface,
  GetSingleReportInterface,
  GuidePaymentsQueryInterface,
  PaymentReportInterface,
} from '../../../domain/campaign-payment/interface';
import {
  GetPayableOutType,
  GetPayablesOutType,
  GetPayablesType,
  GetPayableType,
  GlobalReportType,
  ReceivablesOutType,
  SingleReportType,
} from '../../../domain/campaign-payment/types';
import {
  GetReceivablesInterface,
  UserPaymentsQueryInterface,
} from '../../../domain/campaign-payment/interface/user-payments.query.interface';
import { CampaignCustomException } from '../../../common/exeptions';
import * as moment from 'moment';

@Injectable()
export class PayablesService {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q)
    private readonly guidePaymentsQueryInterface: GuidePaymentsQueryInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.USER_PAYMENTS_Q)
    private readonly userPaymentsQuery: UserPaymentsQueryInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.PAYMENT_REPORT)
    private readonly paymentReport: PaymentReportInterface,
  ) {}

  async getGuidePayments(params: GetPayablesType): Promise<GetPayablesOutType> {
    return this.guidePaymentsQueryInterface.getPayables(params);
  }

  async getGuidePaymentsByUser(
    params: GetPayableType,
  ): Promise<GetPayableOutType> {
    return this.guidePaymentsQueryInterface.getPayable(params);
  }

  async getUserReceivables(
    params: GetReceivablesInterface,
  ): Promise<ReceivablesOutType> {
    return this.userPaymentsQuery.getReceivables(params);
  }

  async getSingleReport(
    params: GetSingleReportInterface,
  ): Promise<SingleReportType> {
    const report = await this.paymentReport.getSingleReport(params);
    if (!report) {
      throw new CampaignCustomException(
        'report not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return report;
  }

  async getGlobalReport(
    params: GetGlobalReportApiInterface,
  ): Promise<GlobalReportType> {
    const formattedDateStart = params.startDate
      ? moment.unix(params.startDate).toDate()
      : moment('1-1-1970').toDate();
    const formattedDateEnd = params.endDate
      ? moment.unix(params.endDate).toDate()
      : moment().toDate();
    const report = await this.paymentReport.getGlobalReport({
      ...params,
      startDate: formattedDateStart,
      endDate: formattedDateEnd,
    });
    if (!report) {
      throw new CampaignCustomException(
        'report not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return report;
  }
}
