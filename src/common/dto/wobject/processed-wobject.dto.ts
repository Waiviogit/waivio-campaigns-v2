import { WobjectDto } from './wobject.dto';
import { Blog, NewsFilerType } from '../../../domain/wobject/types';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessedWobjectDto extends WobjectDto {
  sortCustom?: unknown;

  @ApiProperty({ type: String })
  defaultShowLink?: string;

  @ApiProperty({ type: [String] })
  topTags?: string[];

  newsFilter?: NewsFilerType[];

  blog?: Blog[];

  @ApiProperty({ type: String })
  name?: string;

  @ApiProperty({ type: String })
  map;
}
