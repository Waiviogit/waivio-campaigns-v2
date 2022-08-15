import { Test, TestingModule } from '@nestjs/testing';
import { PersistenceModule } from '../../../src/persistance/persistence.module';
import { UserPaymentsQuery } from '../../../src/domain/campaign-payment/user-payments.query';
import { DatabaseModule } from '../../../src/database/database.module';
import { campaignPaymentFactory } from '../../factory/campaign-payment.factory';

describe('UserPaymentsQuery', () => {
  let service: UserPaymentsQuery;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPaymentsQuery],
      imports: [DatabaseModule, PersistenceModule],
    }).compile();

    service = module.get<UserPaymentsQuery>(UserPaymentsQuery);
    await campaignPaymentFactory.createPayment({});
  });

  it('ApiService - should be defined', async () => {
    const yo = await service.getReceivables({
      userName: 'ctrl-news',
      payoutToken: 'WAIV',
    });
    console.log();
  });
});
