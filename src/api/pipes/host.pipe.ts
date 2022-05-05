import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { REPLACE_ORIGIN, REPLACE_REFERER } from '../../common/constants';
import { configService } from '../../common/config';

type HeadersType = {
  origin?: string;
  referer?: string;
};

@Injectable()
export class HostPipe implements PipeTransform {
  transform(headers: HeadersType, metadata: ArgumentMetadata): string {
    const origin = headers?.origin;
    const referer = headers?.referer;
    const host = origin
      ? origin.replace(REPLACE_ORIGIN, '')
      : referer && referer.replace(REPLACE_REFERER, '');

    return host || configService.getAppHost();
  }
}
