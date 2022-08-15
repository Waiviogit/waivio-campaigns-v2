export interface UserPaymentsQueryInterface {
  getReceivables(params: GetReceivablesInterface);
}

export interface GetReceivablesInterface {
  userName: string;
  payoutToken: string;
  days?: number;
  payable?: number;
}
