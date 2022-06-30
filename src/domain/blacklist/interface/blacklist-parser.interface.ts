import { BlacklistParseHiveCustomJson } from '../types';

export interface BlacklistParserInterface {
  parseHiveCustomJson({
    user,
    names,
    type,
  }: BlacklistParseHiveCustomJson): Promise<void>;
}
