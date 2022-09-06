import { GlobalReportType, SingleReportType } from '../types';

export interface PaymentReportInterface {
  getSingleReport(params: GetSingleReportInterface): Promise<SingleReportType>;
  getGlobalReport(params: GetGlobalReportInterface): Promise<GlobalReportType>;
}

export interface GetSingleReportInterface {
  guideName: string;
  userName: string;
  reviewPermlink: string;
  host: string;
  payoutToken: string;
}

export interface GetGlobalReportInterface {
  guideName: string;
  host: string;
  processingFees?: boolean;
  payable?: number;
  startDate?: Date;
  endDate?: Date;
  objects?: string[];
  skip?: number;
  limit?: number;
  currency: string;
}
