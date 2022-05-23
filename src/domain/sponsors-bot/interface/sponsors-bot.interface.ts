import { ParseHiveCustomJsonType } from '../type';

export interface SponsorsBotInterface {
  parseHiveCustomJson({
    id,
    authorizedUser,
    json,
  }: ParseHiveCustomJsonType): Promise<void>;
}
