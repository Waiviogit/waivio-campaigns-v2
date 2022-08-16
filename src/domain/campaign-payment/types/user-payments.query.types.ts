import { PayablesAllType } from './guide-payements.query.types';

export type UserReceivablesType = Omit<PayablesAllType, 'userName'> & {
  guideName: string;
};

export type ReceivablesOutType = {
  histories: UserReceivablesType[];
  totalPayable: number;
};
