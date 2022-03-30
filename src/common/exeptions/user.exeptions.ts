import { HttpException, HttpStatus } from '@nestjs/common';

export class UserForbiddenException extends HttpException {
  constructor() {
    super('operation forbidden', HttpStatus.FORBIDDEN);
  }
}

export class UserNotFoundException extends HttpException {
  constructor() {
    super('user not found', HttpStatus.NOT_FOUND);
  }
}
