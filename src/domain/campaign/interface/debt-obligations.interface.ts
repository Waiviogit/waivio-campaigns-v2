import { ProcessPaymentType } from '../types/debt-obligations.types';

export interface DebtObligationsInterface {
  processPayment({
    amount,
    payoutToken,
    sponsor,
    userName,
    transactionId,
    isDemoAccount,
  }: ProcessPaymentType): Promise<void>;
}
