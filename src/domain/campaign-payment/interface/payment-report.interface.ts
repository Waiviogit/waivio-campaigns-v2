import { SingleReportType } from '../types/payment-report.types';

export interface PaymentReportInterface {
  getSingleReport(params: GetSingleReportInterface): Promise<SingleReportType>;
}

export interface GetSingleReportInterface {
  guideName: string;
  userName: string;
  reviewPermlink: string;
  host: string;
  payoutToken: string;
}
