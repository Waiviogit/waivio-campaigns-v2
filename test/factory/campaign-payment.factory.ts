import { faker } from '@faker-js/faker';
import {
  CampaignPaymentBeneficiariesType,
  CampaignPaymentDocumentType,
} from '../../src/persistance/campaign-payment/types';
import { Test } from '@nestjs/testing';
import { DatabaseModule } from '../../src/database/database.module';
import { PersistenceModule } from '../../src/persistance/persistence.module';
import { CampaignPaymentRepository } from '../../src/persistance/campaign-payment/campaign-payment.repository';
import {
  CAMPAIGN_PAYMENT,
  COLLECTION,
  CONNECTION_MONGO,
  PAYOUT_TOKEN,
} from '../../src/common/constants';
import BigNumber from 'bignumber.js';
import { Types } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CampaignPayment,
  CampaignPaymentSchema,
} from '../../src/persistance/campaign-payment/campaign-payment.schema';

interface createPaymentType {
  userName?: string;
  payoutToken?: string;
  campaignId?: Types.ObjectId;
  app?: string;
  guideName?: string;
  beneficiaries?: CampaignPaymentBeneficiariesType[];
  commission?: BigNumber;
  amount?: BigNumber;
  isDemoAccount?: boolean;
  transactionId?: string;
  reviewObject?: string;
  mainObject?: string;
  title?: string;
  type?: string;
  parentAuthor?: string;
  parentPermlink?: string;
  memo?: string;
}

export class CampaignPaymentFactory {
  async createPayment({
    userName = faker.datatype.string(10),
    payoutToken = PAYOUT_TOKEN.WAIV,
    campaignId = new Types.ObjectId(),
    app = '',
    guideName = faker.datatype.string(10),
    beneficiaries = [
      {
        account: faker.datatype.string(10),
        weight: Number(faker.random.numeric(3)),
      },
    ],
    commission = new BigNumber(faker.random.numeric(3)),
    isDemoAccount = false,
    amount = new BigNumber(faker.random.numeric(3)),
    transactionId = faker.datatype.uuid(),
    reviewObject = faker.datatype.string(10),
    mainObject = faker.datatype.string(10),
    title = faker.datatype.string(10),
    type = CAMPAIGN_PAYMENT.REVIEW,
    parentAuthor = faker.datatype.string(10),
    parentPermlink = faker.datatype.string(10),
    memo = faker.datatype.string(10),
  }: createPaymentType): Promise<CampaignPaymentDocumentType> {
    const moduleRef = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        MongooseModule.forFeature(
          [
            {
              name: CampaignPayment.name,
              schema: CampaignPaymentSchema,
              collection: COLLECTION.CAMPAIGN_PAYMENT,
            },
          ],
          CONNECTION_MONGO.WAIVIO,
        ),
      ],
      providers: [CampaignPaymentRepository],
    }).compile();

    const paymentRepo = moduleRef.get(CampaignPaymentRepository);

    return paymentRepo.create({
      userName,
      payoutToken,
      campaignId,
      app,
      guideName,
      beneficiaries,
      commission,
      isDemoAccount,
      amount,
      transactionId,
      reviewObject,
      mainObject,
      title,
      type,
      parentAuthor,
      parentPermlink,
      memo,
    });
  }
}

export const campaignPaymentFactory = new CampaignPaymentFactory();
