import {
  GlobalReportType,
  SingleReportType,
  BeneficiaryVotesType,
} from '../types';

export interface PaymentReportInterface {
  getSingleReport(params: GetSingleReportInterface): Promise<SingleReportType>;
  getGlobalReport(params: GetGlobalReportInterface): Promise<GlobalReportType>;
  getBeneficiaryVotes(
    params: GetBeneficiaryVotesInterface,
  ): Promise<BeneficiaryVotesType>;
}

export interface GetSingleReportInterface {
  guideName: string;
  userName: string;
  reviewPermlink: string;
  reservationPermlink: string;
  host: string;
  payoutToken: string;
}

export interface GetGlobalReportInterface {
  guideName: string;
  payoutToken: string;
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

export interface GetGlobalReportApiInterface
  extends Omit<GetGlobalReportInterface, 'startDate' | 'endDate'> {
  startDate?: number;
  endDate?: number;
}

export interface GetBeneficiaryVotesInterface {
  campaignId: string;
  createdAt: string;
  skip: number;
  limit: number;
}
