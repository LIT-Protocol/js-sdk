import { LitNetwork } from '@lit-protocol/constants';

import { SupportedNetworks } from './types';

type NETWORK_TYPES = 'TestNetworks' | 'Production';
const SERVICE_URL_BY_NETWORKTYPE: Record<NETWORK_TYPES, string> = {
  TestNetworks: 'https://test.wrapped.litprotocol.com/encrypted',
  Production: 'https://wrapped.litprotocol.com/encrypted',
};

export const SERVICE_URL_BY_LIT_NETWORK: Record<SupportedNetworks, string> = {
  [LitNetwork.Cayenne]: SERVICE_URL_BY_NETWORKTYPE.TestNetworks,
  [LitNetwork.Manzano]: SERVICE_URL_BY_NETWORKTYPE.TestNetworks,
  [LitNetwork.Habanero]: SERVICE_URL_BY_NETWORKTYPE.Production,
};

export const LIT_SESSIONSIG_AUTHORIZATION_SCHEMA_PREFIX = 'LitSessionSig:';
