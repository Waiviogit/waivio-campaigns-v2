export type ValidateRequestType = {
  headers: HeadersRequest;
};

type HeadersRequest = {
  'access-token'?: string;
  account?: string;
  'waivio-auth': string;
};
