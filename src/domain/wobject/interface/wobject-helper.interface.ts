import {
  GetWobjectsForCampaignsType,
  ProcessedWobjectType,
  ProcessWobjectsManyType,
  ProcessWobjectsSingleType,
  RequiredSecondaryType,
} from '../types';
import { FilterQuery } from 'mongoose';
import { CampaignDocumentType } from '../../../persistance/campaign/types';

export interface WobjectHelperInterface {
  processWobjects(params: ProcessWobjectsSingleType): ProcessedWobjectType;
  processWobjects(params: ProcessWobjectsManyType): ProcessedWobjectType[];

  getWobjectName(permlink: string): Promise<string>;
  updateCampaignsCountForManyCampaigns(
    filter: FilterQuery<CampaignDocumentType>,
    status: string,
  ): Promise<void>;
  getWobjectsForCampaigns({
    links,
    host,
  }: GetWobjectsForCampaignsType): Promise<ProcessedWobjectType[]>;
  getRequiredAndSecondaryObjects(
    params: GetRequiredAndSecondaryObjectsInterface,
  ): Promise<RequiredSecondaryType>;
}

export interface GetRequiredAndSecondaryObjectsInterface {
  requiredPermlink: string;
  secondaryPermlink: string;
  host: string;
}
