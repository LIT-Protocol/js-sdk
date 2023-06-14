import { LitNodeClientConfig } from '@lit-protocol/types';

export const defaultLitnodeClientConfig: LitNodeClientConfig = {
  alertWhenUnauthorized: true,
  minNodeCount: 6,
  debug: true,
  bootstrapUrls: [
    'https://node2.litgateway.com:7370',
    'https://node2.litgateway.com:7371',
    'https://node2.litgateway.com:7372',
    'https://node2.litgateway.com:7373',
    'https://node2.litgateway.com:7374',
    'https://node2.litgateway.com:7375',
    'https://node2.litgateway.com:7376',
    'https://node2.litgateway.com:7377',
    'https://node2.litgateway.com:7378',
    'https://node2.litgateway.com:7379',
  ],
  litNetwork: 'serrano',
  connectTimeout: 20000,
};
