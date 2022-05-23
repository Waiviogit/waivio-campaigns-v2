export type ParseHiveCustomJsonType = {
  id: string;
  authorizedUser: string;
  json: SponsorsBotJsonType;
};

export type SponsorsBotJsonType = {
  sponsor: string;
  votingPercent?: number;
  note?: string;
  enabled?: boolean;
  expiredAt?: string;
  votingPower?: number;
};
