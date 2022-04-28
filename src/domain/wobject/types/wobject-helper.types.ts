import {
  WobjectDocumentType,
  WobjectFieldsDocumentType,
} from '../../../persistance/wobject/types';
import { AppDocumentType } from '../../../persistance/app/types';

export type ProcessWobjectsType = {
  wobjects: ProcessedWobjectType | ProcessedWobjectType[];
  fields: string[];
  app?: AppDocumentType;
  locale?: string;
};

export type ProcessWobjectsSingleType = {
  wobjects: ProcessedWobjectType;
  fields: string[];
  app?: AppDocumentType;
  locale?: string;
};

export type ProcessWobjectsManyType = {
  wobjects: ProcessedWobjectType[];
  fields: string[];
  app?: AppDocumentType;
  locale?: string;
};

export type ProcessedWobjectType = WobjectDocumentType &
  ProcessedWobjectAddFieldsType;

export type ProcessedWobjectAddFieldsType = {
  sortCustom?: unknown;
  defaultShowLink?: string;
  topTags?: string[];
  newsFilter?: NewsFilerType[];
  blog?: Blog[];
  name?: string;
  map?: string;
};

export type NewsFilerType = {
  permlink: string;
};

export type Blog = {
  body: string;
};

export type AddDataToFieldsInType = {
  fields: ProcessedFieldType[];
  filter?: string[];
  admins: string[];
  ownership: string[];
  administrative: string[];
  owner: string[];
};

export type ProcessedFieldType = WobjectFieldsDocumentType &
  AdditionalFieldsType;

export type AdditionalFieldsType = {
  createdAt: number;
  approvePercent: number;
  adminVote: AdminVoteType;
  items: unknown[];
};

export type AdminVoteType = {
  role: string | null;
  status: string;
  name: string;
  timestamp: number;
};

export type FieldVoteType = {
  admin?: boolean;
  owner?: boolean;
  ownership?: boolean;
  administrative?: boolean;
  timestamp: number;
};

export type GetFieldsToDisplayInType = {
  fields: ProcessedFieldType[];
  filter?: string[];
  locale: string;
  permlink: string;
  ownership: boolean;
};

export type GetFilteredFieldsType = Omit<GetFieldsToDisplayInType, 'permlink'>;

export type FilterFieldValidationType = Omit<
  GetFieldsToDisplayInType,
  'permlink' | 'fields'
> & { field: ProcessedFieldType };

export type ArrayFieldFilterType = {
  idFields: ProcessedFieldType[];
  allFields: ProcessedFieldType[];
  filter: string[];
  id: string;
  permlink: string;
};

export type SpecialFieldFilterType = {
  field: ProcessedFieldType;
  allFields: ProcessedFieldType[];
  id: string;
};
