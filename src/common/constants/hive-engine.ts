export const HIVE_ENGINE_NODES = [
  'https://api.hive-engine.com/rpc', // Germany
  'https://api2.hive-engine.com/rpc', // Finland
  'https://herpc.dtools.dev', // Miami
  'https://us.engine.rishipanthee.com', // Finland
  'https://ha.herpc.dtools.dev', // New Jersey
];

export const ENGINE_METHOD = Object.freeze({
  FIND: 'find',
  FIND_ONE: 'findOne',
  GET_BLOCK_INFO: 'getBlockInfo',
});

export const ENGINE_ENDPOINT = Object.freeze({
  CONTRACTS: '/contracts',
  BLOCKCHAIN: '/blockchain',
});

export const ENGINE_ID = Object.freeze({
  MAIN_NET: 'ssc-mainnet-hive',
});

export const ENGINE_CONTRACT = Object.freeze({
  MARKETPOOLS: {
    NAME: 'marketpools',
    TABLE: {
      POOLS: 'pools',
    },
  },
  COMMENTS: {
    NAME: 'comments',
    TABLE: {
      VOTING_POWER: 'votingPower',
      REWARD_POOLS: 'rewardPools',
    },
  },
  TOKENS: {
    NAME: 'tokens',
    TABLE: {
      BALANCES: 'balances',
    },
  },
});

export const ENGINE_MARKETPOOLS = Object.freeze({
  WAIV: 'SWAP.HIVE:WAIV',
});

export const MAX_VOTING_POWER = 10000;

export const VOTE_REGENERATION_DAYS = 5;

export const DOWNVOTE_REGENERATION_DAYS = 5;

export const REWARD_POOL_ID = Object.freeze({
  WAIV: 13,
});
