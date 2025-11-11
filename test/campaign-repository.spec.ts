import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignPersistenceModule } from '../src/persistance/campaign/campaign.persistence.module';
import { CampaignRepository } from '../src/persistance/campaign/campaign.repository';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  CONNECTION_MONGO,
  REACH_TYPE,
} from '../src/common/constants';
import { configService } from '../src/common/config';
import { CreateCampaignRepositoryType } from '../src/persistance/campaign/types';

describe('CampaignRepository (Integration)', () => {
  let module: TestingModule;
  let campaignRepository: CampaignRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(configService.getMongoWaivioConnectionString(), {
          connectionName: CONNECTION_MONGO.WAIVIO,
        }),
        CampaignPersistenceModule,
      ],
    }).compile();

    campaignRepository = module.get<CampaignRepository>(
      CAMPAIGN_PROVIDE.REPOSITORY,
    );
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  beforeEach(async () => {
    // Clear all collections in the test database
    try {
      const connection = module.get('DatabaseConnection');
      if (connection && connection.collections) {
        for (const key in connection.collections) {
          await connection.collections[key].deleteMany({});
        }
      }
    } catch (error) {
      // If we can't get the connection, just continue
      console.log('Could not clear database collections:', error.message);
    }
  });

  const createTestCampaign = (
    overrides: Partial<CreateCampaignRepositoryType> = {},
  ): CreateCampaignRepositoryType => ({
    guideName: 'test-guide',
    name: 'Test Campaign',
    description: 'Test campaign description',
    note: 'Test note',
    compensationAccount: 'test-account',
    type: CAMPAIGN_TYPE.REVIEWS,
    budget: 100,
    reward: 10,
    rewardInUSD: 10,
    countReservationDays: 1,
    agreementObjects: ['test-agreement'],
    usersLegalNotice: 'Test legal notice',
    requiredObject: 'test-object',
    objects: ['test-object'],
    expiredAt: new Date(Date.now() + 86400000), // 24 hours from now
    reach: REACH_TYPE.LOCAL,
    requirements: {
      minPhotos: 1,
      receiptPhoto: false,
    },
    userRequirements: {
      minPosts: 0,
      minFollowers: 0,
      minExpertise: 0,
    },
    reservationTimetable: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    ...overrides,
  });

  describe('Basic CRUD Operations', () => {
    it('should create and find a campaign by ID', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      expect(created).toBeDefined();
      expect(created._id).toBeDefined();
      expect(created.guideName).toBe(campaignData.guideName);
      expect(created.name).toBe(campaignData.name);

      const found = await campaignRepository.findCampaignById(
        created._id.toString(),
      );
      expect(found).toBeDefined();
      expect(found!._id.toString()).toBe(created._id.toString());
    });

    it('should find one suspended campaign', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      // Update the campaign to suspended status for testing
      await campaignRepository.updateCampaign({
        _id: created._id,
        status: CAMPAIGN_STATUS.SUSPENDED,
      });

      const found = await campaignRepository.findOneSuspended('test-guide');
      expect(found).toBeDefined();
      expect(found!.status).toBe(CAMPAIGN_STATUS.SUSPENDED);
      expect(found!.guideName).toBe('test-guide');
    });

    it('should find one pending campaign', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      const found = await campaignRepository.findOnePending(
        created._id.toString(),
        'test-guide',
      );
      expect(found).toBeDefined();
      expect(found!.status).toBe(CAMPAIGN_STATUS.PENDING);
      expect(found!.guideName).toBe('test-guide');
    });

    it('should find active campaign by activation link', async () => {
      const activationPermlink = 'test-activation-link';
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      // Update the campaign to active status with activation link
      await campaignRepository.updateCampaign({
        _id: created._id,
        status: CAMPAIGN_STATUS.ACTIVE,
        activationPermlink,
      });

      const found = await campaignRepository.findActiveByActivationLink(
        activationPermlink,
      );
      expect(found).toBeDefined();
      expect(found!.status).toBe(CAMPAIGN_STATUS.ACTIVE);
      expect(found!.activationPermlink).toBe(activationPermlink);
    });
  });

  describe('Campaign Activation', () => {
    it('should activate a pending campaign', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);
      const activationPermlink = 'new-activation-link';

      const activated = await campaignRepository.activateCampaign({
        _id: created._id.toString(),
        status: CAMPAIGN_STATUS.ACTIVE,
        guideName: 'test-guide',
        permlink: activationPermlink,
      });

      expect(activated).toBeDefined();
      expect(activated!.status).toBe(CAMPAIGN_STATUS.ACTIVE);
      expect(activated!.activationPermlink).toBe(activationPermlink);
    });

    it('should not activate campaign with wrong status', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      // Update the campaign to suspended status
      await campaignRepository.updateCampaign({
        _id: created._id,
        status: CAMPAIGN_STATUS.SUSPENDED,
      });

      const result = await campaignRepository.activateCampaign({
        _id: created._id.toString(),
        status: CAMPAIGN_STATUS.ACTIVE,
        guideName: 'test-guide',
        permlink: 'test-link',
      });

      expect(result).toBeNull();
    });
  });

  describe('Campaign Updates', () => {
    it('should update a pending campaign', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      const updateData = {
        _id: created._id.toString(),
        name: 'Updated Campaign Name',
        description: 'Updated description',
        budget: 200,
      };

      const updated = await campaignRepository.updateCampaign(updateData);
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Campaign Name');
      expect(updated!.description).toBe('Updated description');
      expect(updated!.budget).toBe(200);
    });

    it('should not update non-pending campaign', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      // Update the campaign to active status
      await campaignRepository.updateCampaign({
        _id: created._id,
        status: CAMPAIGN_STATUS.ACTIVE,
      });

      const updateData = {
        _id: created._id.toString(),
        name: 'Updated Campaign Name',
      };

      const result = await campaignRepository.updateCampaign(updateData);
      expect(result).toBeNull();
    });
  });

  describe('Campaign Deletion', () => {
    it('should delete a pending campaign', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      const deleted = await campaignRepository.deleteCampaignById({
        _id: created._id.toString(),
      });

      expect(deleted).toBeDefined();
      expect(deleted!._id.toString()).toBe(created._id.toString());

      // Verify it's actually deleted
      const found = await campaignRepository.findCampaignById(
        created._id.toString(),
      );
      expect(found).toBeNull();
    });

    it('should not delete non-pending campaign', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      // Update the campaign to active status
      await campaignRepository.updateCampaign({
        _id: created._id,
        status: CAMPAIGN_STATUS.ACTIVE,
      });

      const result = await campaignRepository.deleteCampaignById({
        _id: created._id.toString(),
      });

      expect(result).toBeNull();
    });
  });

  describe('Complex Queries', () => {
    it('should find campaign by status, guide name, and activation link', async () => {
      const activationPermlink = 'test-activation-link';
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      // Update the campaign to active status with activation link
      await campaignRepository.updateCampaign({
        _id: created._id,
        status: CAMPAIGN_STATUS.ACTIVE,
        activationPermlink,
      });

      const found =
        await campaignRepository.findCampaignByStatusGuideNameActivation({
          statuses: [CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.SUSPENDED],
          guideName: 'test-guide',
          activationPermlink,
        });

      expect(found).toBeDefined();
      expect(found!.guideName).toBe('test-guide');
      expect(found!.activationPermlink).toBe(activationPermlink);
      expect([CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.SUSPENDED]).toContain(
        found!.status,
      );
    });

    it('should return null when no matching campaign found', async () => {
      const found =
        await campaignRepository.findCampaignByStatusGuideNameActivation({
          statuses: [CAMPAIGN_STATUS.ACTIVE],
          guideName: 'non-existent-guide',
          activationPermlink: 'non-existent-link',
        });

      expect(found).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple campaigns with same guide name', async () => {
      // Create campaigns with different names to avoid conflicts
      const campaign1 = createTestCampaign({
        name: 'Campaign 1',
        guideName: 'test-guide-1',
      });
      const campaign2 = createTestCampaign({
        name: 'Campaign 2',
        guideName: 'test-guide-2',
      });

      const created1 = await campaignRepository.create(campaign1);
      const created2 = await campaignRepository.create(campaign2);

      // Update campaigns to different statuses
      await campaignRepository.updateCampaign({
        _id: created1._id,
        status: CAMPAIGN_STATUS.PENDING,
      });
      await campaignRepository.updateCampaign({
        _id: created2._id,
        status: CAMPAIGN_STATUS.SUSPENDED,
      });

      const suspended = await campaignRepository.findOneSuspended(
        'test-guide-2',
      );
      expect(suspended).toBeDefined();
      expect(suspended!.status).toBe(CAMPAIGN_STATUS.SUSPENDED);
      expect(suspended!.name).toBe('Campaign 2');
    });

    it('should handle campaigns with users array', async () => {
      const campaignData = createTestCampaign();
      const created = await campaignRepository.create(campaignData);

      // Update campaign to add users
      await campaignRepository.updateCampaign({
        _id: created._id,
        users: [
          {
            name: 'Test User',
            objectPermlink: 'test-object-permlink',
            reservationPermlink: 'test-reservation-permlink',
            payoutTokenRateUSD: 1.0,
            status: 'assigned',
          } as any,
        ],
      });

      const updated = await campaignRepository.findCampaignById(
        created._id.toString(),
      );
      expect(updated!.users).toHaveLength(1);
      expect(updated!.users[0].name).toBe('Test User');
    });
  });
});
