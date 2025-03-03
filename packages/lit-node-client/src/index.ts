import 'cross-fetch/dist/node-polyfill.js';

// ==================== Exports ====================
export * from './lib/lit-node-client';

export {
  hashResourceIdForSigning,
  humanizeAccessControlConditions,
} from '@lit-protocol/access-control-conditions';

export {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

export { validateSessionSig } from './lib/helpers/session-sigs-validator';
