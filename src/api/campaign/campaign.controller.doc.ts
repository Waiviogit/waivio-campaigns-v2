import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { Campaign } from '../../persistance/campaign/campaign.schema';

export class CampaignControllerDocs {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('campaign'),
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

  static createCampaign(): MethodDecorator {
    return applyDecorators(
      ApiHeader({
        name: 'access-token',
        required: true,
      }),
      ApiHeader({
        name: 'account',
        required: true,
        description: 'authorized account',
      }),
      ApiOperation({
        summary: 'request for create campaign',
        description: 'campaign object',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'campaign',
        type: Campaign,
      }),
    );
  }
}
