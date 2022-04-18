export type EngineQueryType = {
  hostUrl?: string;
  method?: string;
  endpoint?: string;
  id?: string;
  params: EngineParamsType;
};

export type EngineParamsType = {
  contract: string;
  table: string;
  query?: object;
};

export type EngineProxyType = EngineQueryType & {
  attempts?: number;
};

export type MarketPoolType = {
  _id: string;
  tokenPair: string;
  baseQuantity: string;
  quoteQuantity: string;
  basePrice: string;
  quotePrice: string;
  baseVolume: string;
  quoteVolume: string;
  totalShares: string;
  precision: string;
  creator: string;
};
