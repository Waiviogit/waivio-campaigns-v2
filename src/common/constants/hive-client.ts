export const HIVE_RPC_NODES = [
  'https://api.hive.blog',
  'https://rpc.esteem.app',
  'https://hive-api.arcange.eu',
  'https://rpc.ausbit.dev',
  'https://hive.roelandp.nl',
  'https://hived.emre.sh',
];

const HIVE_API = Object.freeze({
  CONDENSER_API: 'condenser_api',
});

export const CONDENSER_API = Object.freeze({
  GET_BLOCK: `${HIVE_API.CONDENSER_API}.get_block`,
});

export const HIVE_SIGNER_URL = 'https://hivesigner.com';
