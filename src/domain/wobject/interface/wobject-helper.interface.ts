import {
  ProcessedWobjectType,
  ProcessWobjectsManyType,
  ProcessWobjectsSingleType,
} from '../types';

export interface WobjectHelperInterface {
  processWobjects(params: ProcessWobjectsSingleType): ProcessedWobjectType;
  processWobjects(params: ProcessWobjectsManyType): ProcessedWobjectType[];

  getWobjectName(permlink: string): Promise<string>;
}
