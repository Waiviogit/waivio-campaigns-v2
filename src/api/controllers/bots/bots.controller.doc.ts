import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SponsorsBotOutDto } from '../../../common/dto/bots/out';

export class BotsControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('bots'),
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

  static getSponsorsBot(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for get sponsors bot',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'sponsors bot',
        type: SponsorsBotOutDto,
      }),
    );
  }
}
