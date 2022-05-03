export type TransferPayloadType = {
  symbol: string;
  to: string;
  quantity: string;
  memo: string;
  isSignedWithActiveKey: boolean;
};
