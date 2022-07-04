import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetBlacklistsDto } from '../../../common/dto/blacklists/out/get-blacklists.dto';

export class BlacklistsControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('blacklists'),
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

  static getUserBlacklist(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for get blacklist',
        description: 'endpoint for get blacklist',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'blacklist',
        type: GetBlacklistsDto,
      }),
    );
  }
}
