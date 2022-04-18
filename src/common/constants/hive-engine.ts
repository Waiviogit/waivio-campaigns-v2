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
});

export const ENGINE_ENDPOINT = Object.freeze({
  CONTRACTS: '/contracts',
  BLOCKS: '/blocks',
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
});

export const ENGINE_MARKETPOOLS = Object.freeze({
  WAIV: 'SWAP.HIVE:WAIV',
});
