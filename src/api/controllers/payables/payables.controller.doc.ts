import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GuidePayablesOutDto,
  GuidePayablesUserOutDto,
} from '../../../common/dto/payables/out';

export class PayablesControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('payables'),
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

  static getGuidePayments(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get guide main page payables',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: GuidePayablesOutDto,
      }),
    );
  }

  static getGuidePaymentsByUser(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get guide payables by user',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: GuidePayablesUserOutDto,
      }),
    );
  }
}
