import { Test, TestingModule } from '@nestjs/testing';
import { MessageOnReview } from '../src/domain/campaign/review/message-on-review';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  GIVEAWAY_PARTICIPANTS_PROVIDE,
  HIVE_PROVIDE,
  PAYOUT_TOKEN_PRECISION,
  REDIS_PROVIDE,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../src/common/constants';
import { ContestWinnerType } from '../src/domain/campaign/review/types';

describe('MessageOnReview - contestWinMessage', () => {
  let messageOnReview: MessageOnReview;
  let mockCampaignRedisClient: any;
  let mockHiveClient: any;
  let mockWobjectHelper: any;
  let mockUserRepository: any;
  let mockCampaignRepository: any;
  let mockGiveawayParticipantsRepository: any;
  let mockCampaignHelper: any;
  let mockPaymentReport: any;

  const mockCampaign = {
    _id: 'campaign-id',
    guideName: 'test-guide',
    name: 'Test Contest',
    type: CAMPAIGN_TYPE.CONTESTS_OBJECT,
    status: CAMPAIGN_STATUS.ACTIVE,
    activationPermlink: 'test-activation',
    payoutToken: 'WAIV',
  } as any;

  const mockWinners: ContestWinnerType[] = [
    {
      place: 1,
      reward: 100,
      post: { author: 'winner1', permlink: 'post1' },
      votePercentage: 80,
    },
    {
      place: 2,
      reward: 50,
      post: { author: 'winner2', permlink: 'post2' },
      votePercentage: 60,
    },
    {
      place: 3,
      reward: 25,
      post: { author: 'winner3', permlink: 'post3' },
      votePercentage: 40,
    },
  ];

  beforeEach(async () => {
    mockCampaignRedisClient = {
      setex: jest.fn(),
    };

    mockHiveClient = {
      createComment: jest.fn().mockResolvedValue(true),
      getState: jest.fn(),
      getContent: jest.fn(),
    };

    mockWobjectHelper = {
      getWobjectName: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        name: 'test-guide',
        alias: 'Test Guide',
      }),
    };

    mockCampaignRepository = {
      findOne: jest.fn().mockResolvedValue(mockCampaign),
    };

    mockGiveawayParticipantsRepository = {
      getByNamesByActivationPermlink: jest
        .fn()
        .mockResolvedValue([
          'participant1',
          'participant2',
          'participant3',
          'winner1',
          'winner2',
          'winner3',
        ]),
    };

    mockCampaignHelper = {
      getPayoutTokenRateUSD: jest.fn().mockResolvedValue(1),
    };

    mockPaymentReport = {
      getSingleReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageOnReview,
        {
          provide: REDIS_PROVIDE.CAMPAIGN_CLIENT,
          useValue: mockCampaignRedisClient,
        },
        {
          provide: HIVE_PROVIDE.CLIENT,
          useValue: mockHiveClient,
        },
        {
          provide: WOBJECT_PROVIDE.HELPER,
          useValue: mockWobjectHelper,
        },
        {
          provide: USER_PROVIDE.REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: CAMPAIGN_PROVIDE.REPOSITORY,
          useValue: mockCampaignRepository,
        },
        {
          provide: GIVEAWAY_PARTICIPANTS_PROVIDE.REPOSITORY,
          useValue: mockGiveawayParticipantsRepository,
        },
        {
          provide: CAMPAIGN_PROVIDE.CAMPAIGN_HELPER,
          useValue: mockCampaignHelper,
        },
        {
          provide: CAMPAIGN_PAYMENT_PROVIDE.PAYMENT_REPORT,
          useValue: mockPaymentReport,
        },
      ],
    }).compile();

    messageOnReview = module.get<MessageOnReview>(MessageOnReview);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('contestWinMessage', () => {
    it('should filter winners from participants list', async () => {
      await messageOnReview.contestWinMessage(
        'campaign-id',
        'event-id',
        mockWinners,
      );

      // Verify that getByNamesByActivationPermlink was called
      expect(
        mockGiveawayParticipantsRepository.getByNamesByActivationPermlink,
      ).toHaveBeenCalledWith(mockCampaign.activationPermlink);

      // Verify that createComment was called 3 times (once for each winner)
      expect(mockHiveClient.createComment).toHaveBeenCalledTimes(3);

      // Verify the first call (general message for 1st place)
      const firstCall = mockHiveClient.createComment.mock.calls[0];
      expect(firstCall[0].parent_author).toBe('winner1');
      expect(firstCall[0].parent_permlink).toBe('post1');
      expect(firstCall[0].body).toContain(
        'Thanks to everyone who participated',
      );
      expect(firstCall[0].body).toContain('1st place: @winner1');
      expect(firstCall[0].body).toContain('2nd place: @winner2');
      expect(firstCall[0].body).toContain('3rd place: @winner3');
      // Should contain participants but not winners
      expect(firstCall[0].body).toContain('@participant1');
      expect(firstCall[0].body).toContain('@participant2');
      expect(firstCall[0].body).toContain('@participant3');
      expect(firstCall[0].body).not.toContain('@winner1, @winner2, @winner3');

      // Verify the second call (individual message for 2nd place)
      const secondCall = mockHiveClient.createComment.mock.calls[1];
      expect(secondCall[0].parent_author).toBe('winner2');
      expect(secondCall[0].parent_permlink).toBe('post2');
      expect(secondCall[0].body).toContain('Congratulations @winner2');
      expect(secondCall[0].body).toContain('2nd place');

      // Verify the third call (individual message for 3rd place)
      const thirdCall = mockHiveClient.createComment.mock.calls[2];
      expect(thirdCall[0].parent_author).toBe('winner3');
      expect(thirdCall[0].parent_permlink).toBe('post3');
      expect(thirdCall[0].body).toContain('Congratulations @winner3');
      expect(thirdCall[0].body).toContain('3rd place');
    });

    it('should handle empty participants list', async () => {
      mockGiveawayParticipantsRepository.getByNamesByActivationPermlink.mockResolvedValue(
        [],
      );

      await messageOnReview.contestWinMessage(
        'campaign-id',
        'event-id',
        mockWinners,
      );

      expect(mockHiveClient.createComment).toHaveBeenCalledTimes(3);

      // First message should still mention participants section but with empty list
      const firstCall = mockHiveClient.createComment.mock.calls[0];
      expect(firstCall[0].body).toContain(
        'Big thanks to all participants for joining and supporting the campaign:',
      );
      expect(firstCall[0].body).toContain(
        'We loved seeing your insights and enthusiasm',
      );
    });

    it('should handle campaign not found', async () => {
      mockCampaignRepository.findOne.mockResolvedValue(null);

      await messageOnReview.contestWinMessage(
        'campaign-id',
        'event-id',
        mockWinners,
      );

      expect(mockHiveClient.createComment).not.toHaveBeenCalled();
    });
  });
});
