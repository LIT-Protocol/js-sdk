import { LIT_NETWORK } from '@lit-protocol/constants';

import { SupportedNetworks } from './types';

type NETWORK_TYPES = 'TestNetworks' | 'Production';
const SERVICE_URL_BY_NETWORKTYPE: Record<NETWORK_TYPES, string> = {
  TestNetworks: 'https://test.wrapped.litprotocol.com/encrypted',
  Production: 'https://wrapped.litprotocol.com/encrypted',
};

export const SERVICE_URL_BY_LIT_NETWORK: Record<SupportedNetworks, string> = {
  [LIT_NETWORK.NagaDev]: SERVICE_URL_BY_NETWORKTYPE.TestNetworks,
  [LIT_NETWORK.NagaTest]: SERVICE_URL_BY_NETWORKTYPE.TestNetworks,
};

export const LIT_SESSIONSIG_AUTHORIZATION_SCHEMA_PREFIX = 'LitSessionSig:';
