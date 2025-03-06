import 'cross-fetch/dist/node-polyfill.js';

// ==================== Exports ====================
export * from './lib/lit-node-client';

export {
  hashResourceIdForSigning,
  humanizeAccessControlConditions,
} from '@lit-protocol/access-control-conditions';

export { validateSessionSig } from './lib/helpers/session-sigs-validator';
