import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';

import {
  ValidationResponseDto,
} from '../../common/dto/campaign/out';

export class ReservationControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('reservation'),
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

  static getValidateAssign(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for validate campaign assign',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: ValidationResponseDto,
      }),
    );
  }
  static getValidateReject(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for validate reservation reject',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: ValidationResponseDto,
      }),
    );
  }
}
