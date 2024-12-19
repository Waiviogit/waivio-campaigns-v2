import { ApiProperty } from '@nestjs/swagger';
import { UserCampaignType } from '../../../../persistance/user/types';
import { ProcessedWobjectType } from '../../../../domain/wobject/types';
import {
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../../persistance/campaign/types';

export class CampaignReservationDetailsDto {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: Object })
  requiredObject: UserCampaignType | ProcessedWobjectType;

  @ApiProperty({ type: Object })
  secondaryObject: UserCampaignType | ProcessedWobjectType;

  @ApiProperty({ type: String })
  app: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  guideName: string;

  @ApiProperty({ type: Object })
  requirements: ReviewRequirementsType;

  @ApiProperty({ type: Object })
  userRequirements: UserRequirementsType;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: Boolean })
  qualifiedPayoutToken: boolean;
}
