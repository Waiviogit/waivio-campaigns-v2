import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ValidateRequestType } from './types/auth.guard.types';
import { CAMPAIGN_PROVIDE, CAMPAIGN_STATUS } from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';

@Injectable()
export class ChangeCampaignGuard implements CanActivate {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }
  async validateRequest({
    headers,
    body,
  }: ValidateRequestType): Promise<boolean> {
    if (!headers?.account || !body?._id) return false;
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id: body._id,
        status: CAMPAIGN_STATUS.PENDING,
        guideName: headers?.account,
      },
      projection: { _id: 1 },
    });
    return !!campaign;
  }
}
