import depd from 'depd';

import { datilDev, datilTest, datil } from '@lit-protocol/contracts';

import { LIT_NETWORK_VALUES } from './constants';

const deprecated = depd('lit-js-sdk:constants:mappers');

/**
 * Mapping of network context by network value.
 */
export const NETWORK_CONTEXT_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]:
    | typeof datilDev
    | typeof datilTest
    | typeof datil;
} = {
  'datil-dev': datilDev,
  'datil-test': datilTest,
  datil: datil,

  // just use datil dev abis for custom
  custom: datilDev,
} as const;

export const GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: boolean;
} = {
  'datil-dev': false,
  'datil-test': false,
  datil: false,
  custom: false,
};
