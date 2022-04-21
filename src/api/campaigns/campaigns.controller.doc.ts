import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';

import { GuideActiveCampaignDto } from '../../common/dto/campaign/out';

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
        type: [GuideActiveCampaignDto],
      }),
    );
  }
}
