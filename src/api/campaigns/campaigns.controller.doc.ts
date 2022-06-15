import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';

import { GuideManageCampaignDto } from '../../common/dto/campaign/out';
import { GuideBalanceDto } from '../../common/dto/campaign/out/guide-balance.dto';
import { GuideHistoryCampaignDto } from '../../common/dto/campaign/out/guide-history-campaign.dto';

export class CampaignsControllerDocs {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('campaigns'),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
      }),
    );
  }

  static getActiveCampaigns(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for guide active campaigns',
        description: 'campaigns array',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'campaigns',
        type: [GuideManageCampaignDto],
      }),
    );
  }

  static getBalances(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for guide balance',
        description: 'endpoint for guide balance',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'campaigns',
        type: GuideBalanceDto,
      }),
    );
  }

  static getHistory(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for guide history campaigns',
        description: 'campaigns array',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'campaigns',
        type: GuideHistoryCampaignDto,
      }),
    );
  }
}
