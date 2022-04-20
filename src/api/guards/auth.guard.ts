import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import axios from 'axios';

// @ts-ignore
import * as sc2 from 'sc2-sdk';

import { configService } from '../../common/config';
import { ValidateRequestType } from './types/auth.guard.types';
import { HIVE_SIGNER_URL } from '../../common/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest({ headers }: ValidateRequestType): Promise<boolean> {
    const account = headers.account;
    const token = headers['access-token'];

    if (!account || !token) return false;

    if (headers['waivio-auth']) {
      return this.validateGuestUser(account, token);
    }
    return this.validateHiveSigner(account, token);
  }

  async validateGuestUser(account: string, token: string): Promise<boolean> {
    try {
      const response = await axios.post(
        configService.getGuestValidationURL(),
        {},
        { headers: { 'access-token': token } },
      );

      if (response?.data) {
        return response?.data?.user?.name === account;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async validateHiveSigner(account: string, token: string): Promise<boolean> {
    try {
      const api = sc2.Initialize({
        baseURL: HIVE_SIGNER_URL,
        accessToken: token,
      });
      const user = await api.me();
      return user._id === account;
    } catch (error) {
      return false;
    }
  }
}
