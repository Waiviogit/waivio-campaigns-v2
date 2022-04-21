import { HttpException, HttpStatus } from '@nestjs/common';

export class CampaignServerException extends HttpException {
  constructor() {
    super('internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class CampaignCustomException extends HttpException {
  constructor(response: string, status: number) {
    super(response, status);
  }
}
