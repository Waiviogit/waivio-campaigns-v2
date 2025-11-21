export const HIVE_RPC_NODES = [
  'https://api.deathwing.me',
  'https://api.hive.blog',
  'https://api.openhive.network',
  'https://rpc.mahdiyari.info',
];

const HIVE_API = Object.freeze({
  CONDENSER_API: 'condenser_api',
  BRIDGE: 'bridge',
});

export const CONDENSER_API = Object.freeze({
  GET_BLOCK: `${HIVE_API.CONDENSER_API}.get_block`,
  GET_CONTENT: `${HIVE_API.CONDENSER_API}.get_content`,
  GET_ACTIVE_VOTES: `${HIVE_API.CONDENSER_API}.get_active_votes`,
});

export const BRIDGE = Object.freeze({
  GET_DISCUSSION: `${HIVE_API.BRIDGE}.get_discussion`,
});

export const HIVE_SIGNER_URL = 'https://hivesigner.com';
