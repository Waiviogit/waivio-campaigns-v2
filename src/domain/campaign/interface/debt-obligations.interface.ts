import { ProcessPaymentType } from '../types/debt-obligations.types';

export interface DebtObligationsInterface {
  processPayment({
    amount,
    payoutToken,
    guideName,
    userName,
    transactionId,
    isDemoAccount,
  }: ProcessPaymentType): Promise<void>;
}
