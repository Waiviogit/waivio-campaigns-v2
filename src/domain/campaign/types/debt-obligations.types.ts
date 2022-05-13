export type ProcessPaymentType = {
  amount: string;
  payoutToken: string;
  guideName: string;
  userName: string;
  transactionId: string;
};

export type ProcessGuestPaymentType = Omit<ProcessPaymentType, 'userName'> & {
  memoJson: MemoJsonType;
  destination: string;
};

export type MemoJsonType = {
  app: string;
  id: string;
  to: string;
  message: string;
};
