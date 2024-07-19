import { LIT_NETWORK_VALUES } from './constants';
import {
  cayenne,
  manzano,
  habanero,
  datilDev,
  datilTest,
  datil,
} from '@lit-protocol/contracts';

/**
 * Mapping of network context by network value.
 */
export const NETWORK_CONTEXT_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: any;
} = {
  cayenne: cayenne,
  manzano: manzano,
  habanero: habanero,
  'datil-dev': datilDev,
  'datil-test': datilTest,
  datil: datil,

  // just use datil dev abis for custom and localhost
  custom: datilDev,
  localhost: datilDev,
};
