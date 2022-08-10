import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuidePayablesOutDto } from '../../../common/dto/payables/out';

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
        summary: 'get main page payables',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: GuidePayablesOutDto,
      }),
    );
  }
}
