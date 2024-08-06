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

/**
 * @deprecated Will be removed in version 7.x.
 */
export const GENERAL_WORKER_URL_BY_NETWORK: {
  [key in Exclude<LIT_NETWORK_VALUES, 'datil'>]: string;
} = {
  cayenne: 'https://apis.getlit.dev/cayenne/contracts',
  manzano: 'https://apis.getlit.dev/manzano/contracts',
  habanero: 'https://apis.getlit.dev/habanero/contracts',
  'datil-dev': 'https://apis.getlit.dev/datil-dev/contracts',
  'datil-test': 'https://apis.getlit.dev/datil-test/contracts',

  // just use cayenne abis for custom and localhost
  custom: 'https://apis.getlit.dev/cayenne/contracts',
  localhost: 'https://apis.getlit.dev/cayenne/contracts',
};
