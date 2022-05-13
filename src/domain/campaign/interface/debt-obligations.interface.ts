import {
  ProcessGuestPaymentType,
  ProcessPaymentType,
} from '../types/debt-obligations.types';

export interface DebtObligationsInterface {
  processPayment({
    amount,
    payoutToken,
    guideName,
    userName,
    transactionId,
  }: ProcessPaymentType): Promise<void>;
  processGuestPayment({
    amount,
    payoutToken,
    guideName,
    memoJson,
    transactionId,
    destination,
  }: ProcessGuestPaymentType): Promise<void>;
}
