import depd from 'depd';

import { LIT_NETWORK_VALUES } from './constants';

// Legacy root import that drags every network/ABI blob into bundles; keep commented as a warning.
// import { datil, datilDev, datilTest } from '@lit-protocol/contracts';

// @ts-ignore -- TypeScript can't resolve the subpath because this package compiles to CJS, but runtime bundlers can.
import { datil as datilContext } from '@lit-protocol/contracts/prod/datil.js';
// @ts-ignore -- see note above.
import { datilDev as datilDevContext } from '@lit-protocol/contracts/prod/datil-dev.js';
// @ts-ignore -- see note above.
import { datilTest as datilTestContext } from '@lit-protocol/contracts/prod/datil-test.js';

type DatilContext = typeof datilContext;
type DatilDevContext = typeof datilDevContext;
type DatilTestContext = typeof datilTestContext;

const datil: DatilContext = datilContext;
const datilDev: DatilDevContext = datilDevContext;
const datilTest: DatilTestContext = datilTestContext;

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
