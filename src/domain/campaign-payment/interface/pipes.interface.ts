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
