import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';

import {
  CreateCampaignOutDto,
  DeleteCampaignOutDto,
  UpdateCampaignOutDto,
  ValidationResponseDto,
} from '../../common/dto/campaign/out';

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
        summary: 'endpoint for create campaign',
        description: 'campaign object',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'campaign',
        type: CreateCampaignOutDto,
      }),
    );
  }

  static updateCampaign(): MethodDecorator {
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
        summary: 'endpoint for update pending campaign',
        description: 'campaign object',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'campaign',
        type: UpdateCampaignOutDto,
      }),
    );
  }

  static deleteCampaign(): MethodDecorator {
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
        summary: 'endpoint for delete pending campaign',
        description: 'campaign object',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'campaign',
        type: DeleteCampaignOutDto,
      }),
    );
  }
  static validateActivation(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for validate activation pending campaign',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: ValidationResponseDto,
      }),
    );
  }

  static validateDeactivation(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for validate deactivation pending campaign',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: ValidationResponseDto,
      }),
    );
  }
}
