import {
  GetPayableOutType,
  GetPayablesOutType,
  GetPayablesType,
  GetPayableType,
} from '../types';

export interface GuidePaymentsQueryInterface {
  getPayables({
    guideName,
    payoutToken,
  }: GetPayablesType): Promise<GetPayablesOutType>;
  getPayable({
    guideName,
    payoutToken,
    userName,
  }: GetPayableType): Promise<GetPayableOutType>;
}
