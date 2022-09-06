export interface GetPayablesPipeInterface {
  guideName: string;
  payoutToken: string;
  days?: number;
  payable?: number;
}

export interface GetTotalGuideTotalPayablePipeInterface {
  guideName: string;
  payoutToken: string;
}

export interface GetGuidesTotalPayedPipeInterface {
  guideNames: string[];
  payoutToken: string;
}

export interface GetPayableByUserPipeInterface {
  guideName: string;
  payoutToken: string;
  userName: string;
}

export type GetHistoriesByUserPipeInterface = GetPayableByUserPipeInterface;

export interface getUserPayablesPipeInterface {
  userName: string;
  payoutToken: string;
  days?: number;
  payable?: number;
}

export interface GetUserTotalPayablePipeInterface {
  userName: string;
  payoutToken: string;
}

export interface getGlobalReportPipeInterface {
  payoutToken: string;
  guideName: string;
  processingFees?: boolean;
  startDate?: Date;
  endDate?: Date;
  objects?: string[];
}
