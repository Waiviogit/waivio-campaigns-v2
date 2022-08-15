import { Test, TestingModule } from '@nestjs/testing';
import { PersistenceModule } from '../../../src/persistance/persistence.module';
import { UserPaymentQProvider } from '../../../src/domain/campaign-payment/campain-payment.provider';
import { UserPaymentsQuery } from '../../../src/domain/campaign-payment/user-payments.query';
import * as dotenv from 'dotenv';

import { DatabaseModule } from '../../../src/database/database.module';
dotenv.config({ path: `env/${process.env.NODE_ENV || 'development'}.env` });

describe('ApiService', () => {
  let service: UserPaymentsQuery;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPaymentQProvider],
      imports: [DatabaseModule, PersistenceModule],
    }).compile();

    service = module.get<UserPaymentsQuery>(UserPaymentsQuery);
  });

  it('ApiService - should be defined', () => {
    expect(service).toBeDefined();
  });
});
