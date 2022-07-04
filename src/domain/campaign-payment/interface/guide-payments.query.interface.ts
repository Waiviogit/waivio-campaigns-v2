import {
  GetGuidesTotalPayedType,
  GetPayableOutType,
  GetPayablesOutType,
  GetPayablesType,
  GetPayableType,
  GuidesTotalPayedType,
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

  getGuidesTotalPayed({
    guideNames,
    payoutToken,
  }: GetGuidesTotalPayedType): Promise<GuidesTotalPayedType[]>;
}
