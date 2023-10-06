import { LitNodeClientConfig } from '@lit-protocol/types';

export const defaultLitnodeClientConfig: LitNodeClientConfig = {
  alertWhenUnauthorized: false,
  minNodeCount: 2,
  debug: true,
  bootstrapUrls: [
    'https://cayenne.litgateway.com:7370',
    'https://cayenne.litgateway.com:7371',
    'https://cayenne.litgateway.com:7372',
  ],
  litNetwork: 'cayenne',
  connectTimeout: 20000,
};
