import { Test, TestingModule } from '@nestjs/testing';
import { Contest } from '../src/domain/campaign/rewards/contest';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  GIVEAWAY_PARTICIPANTS_PROVIDE,
  POST_PROVIDE,
  REDIS_KEY,
  REDIS_PROVIDE,
  REVIEW_PROVIDE,
  USER_PROVIDE,
} from '../src/common/constants';
import * as moment from 'moment';

// Mock rrule module
jest.mock('rrule', () => ({
  rrulestr: jest.fn(),
}));

// Mock crypto module
jest.mock('node:crypto', () => ({
  default: {
    randomUUID: () => 'test-uuid',
    randomInt: () => 0,
  },
}));

describe('Contest', () => {
  let contest: Contest;
  let mockCampaignRedisClient: any;
  let mockCampaignRepository: any;
  let mockPostRepository: any;
  let mockCampaignHelper: any;
  let mockUserRepository: any;
  let mockCreateReview: any;
  let mockMessageOnReview: any;
  let mockGiveawayParticipantsRepository: any;

  const mockCampaign = {
    _id: 'campaign-id',
    guideName: 'test-guide',
    name: 'Test Contest',
    type: CAMPAIGN_TYPE.CONTESTS_OBJECT,
    status: CAMPAIGN_STATUS.ACTIVE,
    durationDays: 7,
    objects: ['object1', 'object2'],
    blacklistUsers: ['blacklisted-user'],
    whitelistUsers: ['whitelisted-user'],
    users: [
      { name: 'completed-user', status: 'completed', updatedAt: new Date() },
      { name: 'assigned-user', status: 'assigned' },
    ],
    frequencyAssign: 3,
    userRequirements: {
      minPosts: 10,
      minFollowers: 100,
      minExpertise: 50,
    },
    contestJudges: ['judge1', 'judge2'],
    contestRewards: [
      { place: 1, rewardInUSD: 100 },
      { place: 2, rewardInUSD: 50 },
    ],
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
  } as any;

  const mockPost = {
    _id: 'post-id',
    author: 'test-author',
    permlink: 'test-post',
    title: 'Test Post',
    json_metadata: {},
    beneficiaries: [],
    active_votes: [
      { voter: 'test-guide', percent: 100, weight: 100 },
      { voter: 'judge1', percent: 80, weight: 80 },
    ],
    createdAt: new Date(),
  } as any;

  beforeEach(async () => {
    mockCampaignRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      deleteKey: jest.fn(),
      hGetAll: jest.fn(),
      publish: jest.fn(),
      zadd: jest.fn(),
      zremrangebyscore: jest.fn(),
      zrem: jest.fn(),
    };

    mockCampaignRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      findOneSuspended: jest.fn(),
      findActiveByActivationLink: jest.fn(),
      activateCampaign: jest.fn(),
      findOnePending: jest.fn(),
      findCampaignById: jest.fn(),
      updateCampaign: jest.fn(),
      deleteCampaignById: jest.fn(),
      findCampaignByStatusGuideNameActivation: jest.fn(),
    };

    mockPostRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    mockCampaignHelper = {
      setExpireTTLCampaign: jest.fn(),
      deleteCampaignKey: jest.fn(),
      getCompletedUsersInSameCampaigns: jest.fn(),
      setExpireAssign: jest.fn(),
      getPayoutTokenRateUSD: jest.fn(),
      getCurrencyInUSD: jest.fn(),
      delExpireAssign: jest.fn(),
      checkOnHoldStatus: jest.fn(),
      setExpireCampaignPayment: jest.fn(),
      setExpireSuspendWarning: jest.fn(),
      incrReviewComment: jest.fn(),
      reCalcCampaignsRewardInUsd: jest.fn(),
      reachedLimitUpdateToActive: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    mockCreateReview = {
      parseReview: jest.fn(),
      restoreReview: jest.fn(),
      raiseReward: jest.fn(),
      reduceReward: jest.fn(),
      parseRestoreFromCustomJson: jest.fn(),
      createGiveawayPayables: jest.fn(),
      createContestPayables: jest.fn(),
    };

    mockMessageOnReview = {
      sendMessageSuccessReview: jest.fn(),
      rejectMentionMessage: jest.fn(),
      giveawayMessage: jest.fn(),
      giveawayObjectWinMessage: jest.fn(),
      contestWinMessage: jest.fn(),
    };

    mockGiveawayParticipantsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      insertMany: jest.fn(),
      getByNamesByActivationPermlink: jest.fn(),
      getByNamesByActivationPermlinkEventId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Contest,
        {
          provide: REDIS_PROVIDE.CAMPAIGN_CLIENT,
          useValue: mockCampaignRedisClient,
        },
        {
          provide: CAMPAIGN_PROVIDE.REPOSITORY,
          useValue: mockCampaignRepository,
        },
        {
          provide: POST_PROVIDE.REPOSITORY,
          useValue: mockPostRepository,
        },
        {
          provide: CAMPAIGN_PROVIDE.CAMPAIGN_HELPER,
          useValue: mockCampaignHelper,
        },
        {
          provide: USER_PROVIDE.REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: REVIEW_PROVIDE.CREATE,
          useValue: mockCreateReview,
        },
        {
          provide: REVIEW_PROVIDE.MESSAGE_ON_REVIEW,
          useValue: mockMessageOnReview,
        },
        {
          provide: GIVEAWAY_PARTICIPANTS_PROVIDE.REPOSITORY,
          useValue: mockGiveawayParticipantsRepository,
        },
      ],
    }).compile();

    contest = module.get<Contest>(Contest);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setNextRecurrentEvent', () => {
    it('should set next recurrent event with valid rrule', async () => {
      const rruleString = 'FREQ=WEEKLY;BYDAY=MO';
      const _id = 'campaign-id';
      const now = new Date();
      const next = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now

      const mockRrule = {
        after: jest.fn().mockReturnValue(next),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      mockCampaignRedisClient.setex.mockResolvedValue('OK');

      await contest.setNextRecurrentEvent(rruleString, _id);

      expect(mockCampaignRedisClient.setex).toHaveBeenCalledWith(
        `${REDIS_KEY.CONTEST_OBJECT_RECURRENT}${_id}`,
        expect.any(Number),
        '',
      );
    });

    it('should set TTL when no next occurrence', async () => {
      const rruleString = 'FREQ=WEEKLY;BYDAY=MO';
      const _id = 'campaign-id';

      const mockRrule = {
        after: jest.fn().mockReturnValue(null),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      mockCampaignHelper.setExpireTTLCampaign.mockResolvedValue();

      await contest.setNextRecurrentEvent(rruleString, _id);

      expect(mockCampaignHelper.setExpireTTLCampaign).toHaveBeenCalledWith(
        expect.any(Date),
        _id,
      );
    });
  });

  describe('getContestParticipants', () => {
    it('should return eligible participants', async () => {
      const posts = [
        { author: 'user1', permlink: 'post1' },
        { author: 'user2', permlink: 'post2' },
        { author: 'user1', permlink: 'post3' }, // Duplicate author
      ];
      const users = [
        {
          name: 'user1',
          count_posts: 20,
          followers_count: 200,
          wobjects_weight: 75,
        },
        {
          name: 'user2',
          count_posts: 15,
          followers_count: 150,
          wobjects_weight: 60,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(mockCampaign);

      expect(result).toEqual(['user1', 'user2']);
      expect(mockPostRepository.find).toHaveBeenCalledWith({
        filter: {
          createdAt: { $gte: expect.any(Date) },
          'wobjects.author_permlink': { $in: mockCampaign.objects },
        },
        projection: {
          author: 1,
          permlink: 1,
        },
      });
    });

    it('should filter out users who do not meet requirements', async () => {
      const posts = [{ author: 'user1', permlink: 'post1' }];
      const users = [
        {
          name: 'user1',
          count_posts: 5,
          followers_count: 50,
          wobjects_weight: 25,
        }, // Below requirements
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(mockCampaign);

      expect(result).toEqual([]);
    });

    it('should filter out blacklisted users', async () => {
      const posts = [{ author: 'blacklisted-user', permlink: 'post1' }];
      const users = [
        {
          name: 'blacklisted-user',
          count_posts: 20,
          followers_count: 200,
          wobjects_weight: 75,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(mockCampaign);

      expect(result).toEqual([]);
    });

    it('should filter out already assigned/completed users', async () => {
      const posts = [{ author: 'completed-user', permlink: 'post1' }];
      const users = [
        {
          name: 'completed-user',
          count_posts: 20,
          followers_count: 200,
          wobjects_weight: 75,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(mockCampaign);

      expect(result).toEqual([]);
    });

    it('should filter out users based on frequency', async () => {
      const campaignWithFrequency = {
        ...mockCampaign,
        users: [
          {
            name: 'frequent-user',
            status: 'completed',
            updatedAt: moment().subtract(1, 'day').toDate(),
          },
        ],
      };
      const posts = [{ author: 'frequent-user', permlink: 'post1' }];
      const users = [
        {
          name: 'frequent-user',
          count_posts: 20,
          followers_count: 200,
          wobjects_weight: 75,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(
        campaignWithFrequency,
      );

      expect(result).toEqual([]);
    });

    it('should return empty array when no posts found', async () => {
      mockPostRepository.find.mockResolvedValue([]);

      const result = await contest.getContestParticipants(mockCampaign);

      expect(result).toEqual([]);
    });
  });

  describe('getContestPosts', () => {
    it('should return posts within campaign duration and objects', async () => {
      const posts = [mockPost];
      mockPostRepository.find.mockResolvedValue(posts);

      const result = await contest.getContestPosts(mockCampaign);

      expect(result).toEqual(posts);
      expect(mockPostRepository.find).toHaveBeenCalledWith({
        filter: {
          createdAt: { $gte: expect.any(Date) },
          'wobjects.author_permlink': { $in: mockCampaign.objects },
        },
        projection: {
          author: 1,
          permlink: 1,
          title: 1,
          json_metadata: 1,
          beneficiaries: 1,
          active_votes: 1,
        },
      });
    });
  });

  describe('getJudgeVotes', () => {
    it('should calculate judge votes correctly', async () => {
      const posts = [
        {
          ...mockPost,
          active_votes: [
            { voter: 'test-guide', percent: 100, weight: 100 },
            { voter: 'judge1', percent: 80, weight: 80 },
            { voter: 'judge2', percent: 60, weight: 60 },
            { voter: 'non-judge', percent: 50, weight: 50 },
          ],
        },
      ];

      const result = await contest.getJudgeVotes(mockCampaign, posts);

      expect(result.get('test-author/test-post')).toBe(240); // 100 + 80 + 60
    });

    it('should handle posts without active_votes', async () => {
      const posts = [{ ...mockPost, active_votes: undefined }];

      const result = await contest.getJudgeVotes(mockCampaign, posts);

      expect(result.get('test-author/test-post')).toBe(0);
    });

    it('should handle empty active_votes array', async () => {
      const posts = [{ ...mockPost, active_votes: [] }];

      const result = await contest.getJudgeVotes(mockCampaign, posts);

      expect(result.get('test-author/test-post')).toBe(0);
    });

    it('should handle posts with non-judge votes only', async () => {
      const posts = [
        {
          ...mockPost,
          active_votes: [
            { voter: 'non-judge1', percent: 100, weight: 100 },
            { voter: 'non-judge2', percent: 80, weight: 80 },
          ],
        },
      ];

      const result = await contest.getJudgeVotes(mockCampaign, posts);

      expect(result.get('test-author/test-post')).toBe(0);
    });
  });

  describe('startContest', () => {
    it('should start contest successfully', async () => {
      const posts = [mockPost];
      const judgeVotes = new Map([['test-author/test-post', 180]]);

      mockCampaignRepository.findOne.mockResolvedValue(mockCampaign);
      jest.spyOn(contest, 'getContestPosts').mockResolvedValue(posts as any);
      jest.spyOn(contest, 'getJudgeVotes').mockResolvedValue(judgeVotes);
      jest.spyOn(contest, 'setNextRecurrentEvent').mockResolvedValue();
      mockCreateReview.createContestPayables.mockResolvedValue();
      mockMessageOnReview.contestWinMessage.mockResolvedValue();
      mockGiveawayParticipantsRepository.insertMany.mockResolvedValue();

      // Mock rrule to return a date within the window
      const mockRrule = {
        between: jest.fn().mockReturnValue([new Date()]),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      await contest.startContest('campaign-id');

      expect(mockCampaignRepository.findOne).toHaveBeenCalledWith({
        filter: {
          _id: 'campaign-id',
          status: CAMPAIGN_STATUS.ACTIVE,
          type: CAMPAIGN_TYPE.CONTESTS_OBJECT,
        },
      });
      expect(
        mockGiveawayParticipantsRepository.insertMany,
      ).toHaveBeenCalledWith([
        {
          userName: 'test-author',
          activationPermlink: mockCampaign.activationPermlink,
          eventId: 'test-uuid',
        },
      ]);
      expect(mockCreateReview.createContestPayables).toHaveBeenCalled();
      expect(mockMessageOnReview.contestWinMessage).toHaveBeenCalled();
    });

    it('should not start contest if campaign not found', async () => {
      mockCampaignRepository.findOne.mockResolvedValue(null);

      await contest.startContest('campaign-id');

      expect(mockCreateReview.createContestPayables).not.toHaveBeenCalled();
    });

    it('should not start contest if no recurrence rule', async () => {
      const campaignWithoutRule = {
        ...mockCampaign,
        recurrenceRule: undefined,
      };
      mockCampaignRepository.findOne.mockResolvedValue(campaignWithoutRule);

      await contest.startContest('campaign-id');

      expect(mockCreateReview.createContestPayables).not.toHaveBeenCalled();
    });

    it('should not start contest if not in recurrence window', async () => {
      mockCampaignRepository.findOne.mockResolvedValue(mockCampaign);
      const mockRrule = {
        between: jest.fn().mockReturnValue([]),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      await contest.startContest('campaign-id');

      expect(mockCreateReview.createContestPayables).not.toHaveBeenCalled();
    });

    it('should not start contest if no posts found', async () => {
      mockCampaignRepository.findOne.mockResolvedValue(mockCampaign);
      jest.spyOn(contest, 'getContestPosts').mockResolvedValue([]);
      const mockRrule = {
        between: jest.fn().mockReturnValue([new Date()]),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      await contest.startContest('campaign-id');

      expect(
        mockGiveawayParticipantsRepository.insertMany,
      ).not.toHaveBeenCalled();
      expect(mockCreateReview.createContestPayables).not.toHaveBeenCalled();
    });

    it('should handle random selection for posts with no votes', async () => {
      const posts = [
        { ...mockPost, author: 'author1', permlink: 'post1' },
        { ...mockPost, author: 'author2', permlink: 'post2' },
      ];
      const judgeVotes = new Map([
        ['author1/post1', 0],
        ['author2/post2', 0],
      ]);

      mockCampaignRepository.findOne.mockResolvedValue(mockCampaign);
      jest.spyOn(contest, 'getContestPosts').mockResolvedValue(posts as any);
      jest.spyOn(contest, 'getJudgeVotes').mockResolvedValue(judgeVotes);
      jest.spyOn(contest, 'setNextRecurrentEvent').mockResolvedValue();
      mockCreateReview.createContestPayables.mockResolvedValue();
      mockMessageOnReview.contestWinMessage.mockResolvedValue();
      mockGiveawayParticipantsRepository.insertMany.mockResolvedValue();
      const mockRrule = {
        between: jest.fn().mockReturnValue([new Date()]),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      await contest.startContest('campaign-id');

      expect(
        mockGiveawayParticipantsRepository.insertMany,
      ).toHaveBeenCalledWith([
        {
          userName: 'author1',
          activationPermlink: mockCampaign.activationPermlink,
          eventId: 'test-uuid',
        },
        {
          userName: 'author2',
          activationPermlink: mockCampaign.activationPermlink,
          eventId: 'test-uuid',
        },
      ]);
      expect(mockCreateReview.createContestPayables).toHaveBeenCalledTimes(2);
    });
  });

  describe('listener', () => {
    it('should handle contest recurrent type', async () => {
      const key = `expire:contest_recurrent:campaign-id`;
      jest.spyOn(contest, 'startContest').mockResolvedValue();

      await contest.listener(key);

      expect(contest.startContest).toHaveBeenCalledWith('campaign-id');
    });

    it('should handle unknown type', async () => {
      const key = 'unknown:type:id';
      jest.spyOn(contest, 'startContest').mockResolvedValue();

      await contest.listener(key);

      expect(contest.startContest).not.toHaveBeenCalled();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing user requirements gracefully', async () => {
      const campaignWithoutRequirements = {
        ...mockCampaign,
        userRequirements: undefined,
      };
      const posts = [{ author: 'user1', permlink: 'post1' }];
      const users = [
        {
          name: 'user1',
          count_posts: 20,
          followers_count: 200,
          wobjects_weight: 75,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(
        campaignWithoutRequirements,
      );

      expect(result).toEqual(['user1']);
    });

    it('should handle missing blacklist/whitelist gracefully', async () => {
      const campaignWithoutLists = {
        ...mockCampaign,
        blacklistUsers: undefined,
        whitelistUsers: undefined,
      };
      const posts = [{ author: 'user1', permlink: 'post1' }];
      const users = [
        {
          name: 'user1',
          count_posts: 20,
          followers_count: 200,
          wobjects_weight: 75,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(campaignWithoutLists);

      expect(result).toEqual(['user1']);
    });

    it('should handle missing users array gracefully', async () => {
      const campaignWithoutUsers = { ...mockCampaign, users: undefined };
      const posts = [{ author: 'user1', permlink: 'post1' }];
      const users = [
        {
          name: 'user1',
          count_posts: 20,
          followers_count: 200,
          wobjects_weight: 75,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await contest.getContestParticipants(campaignWithoutUsers);

      expect(result).toEqual(['user1']);
    });

    it('should handle missing contest judges gracefully', async () => {
      const campaignWithoutJudges = {
        ...mockCampaign,
        contestJudges: undefined,
      };
      const posts = [mockPost];
      const judgeVotes = new Map([['test-author/test-post', 100]]);

      mockCampaignRepository.findOne.mockResolvedValue(campaignWithoutJudges);
      jest.spyOn(contest, 'getContestPosts').mockResolvedValue(posts as any);
      jest.spyOn(contest, 'getJudgeVotes').mockResolvedValue(judgeVotes);
      jest.spyOn(contest, 'setNextRecurrentEvent').mockResolvedValue();
      mockCreateReview.createContestPayables.mockResolvedValue();
      mockMessageOnReview.contestWinMessage.mockResolvedValue();
      const mockRrule = {
        between: jest.fn().mockReturnValue([new Date()]),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      await contest.startContest('campaign-id');

      expect(mockCreateReview.createContestPayables).toHaveBeenCalled();
    });

    it('should handle missing contest rewards gracefully', async () => {
      const campaignWithoutRewards = {
        ...mockCampaign,
        contestRewards: undefined,
      };
      const posts = [mockPost];
      const judgeVotes = new Map([['test-author/test-post', 100]]);

      mockCampaignRepository.findOne.mockResolvedValue(campaignWithoutRewards);
      jest.spyOn(contest, 'getContestPosts').mockResolvedValue(posts as any);
      jest.spyOn(contest, 'getJudgeVotes').mockResolvedValue(judgeVotes);
      jest.spyOn(contest, 'setNextRecurrentEvent').mockResolvedValue();
      mockCreateReview.createContestPayables.mockResolvedValue();
      mockMessageOnReview.contestWinMessage.mockResolvedValue();
      const mockRrule = {
        between: jest.fn().mockReturnValue([new Date()]),
      };
      const { rrulestr } = require('rrule');
      rrulestr.mockReturnValue(mockRrule);

      await contest.startContest('campaign-id');

      expect(mockCreateReview.createContestPayables).not.toHaveBeenCalled();
    });
  });
});
