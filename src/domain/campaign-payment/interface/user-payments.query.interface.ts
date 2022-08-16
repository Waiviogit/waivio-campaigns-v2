import { ReceivablesOutType } from '../types/user-payments.query.types';

export interface UserPaymentsQueryInterface {
  getReceivables(params: GetReceivablesInterface): Promise<ReceivablesOutType>;
}

export interface GetReceivablesInterface {
  userName: string;
  payoutToken: string;
  days?: number;
  payable?: number;
  skip?: number;
  limit?: number;
}
