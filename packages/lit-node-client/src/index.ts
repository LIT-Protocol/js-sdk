import 'cross-fetch/dist/node-polyfill.js';

// ==================== Exports ====================
export * from './lib/lit-node-client';

export {
  hashResourceIdForSigning,
  humanizeAccessControlConditions,
} from '@lit-protocol/access-control-conditions';

export { validateSessionSig } from './lib/helpers/session-sigs-validator';
export { createRequestId } from './lib.v2/helper/createRequestId';
export { createRandomHexString } from './lib.v2/helper/createRandomHexString';
export * from './lib/core/index';

// --- Internal helper & Public API Methods ---
// export { sendNodeRequest } from './lib.v2/LitNodeApi/src/helper/sendNodeRequest';
// export { handshake } from './lib.v2/LitNodeApi/src/handshake';
// export type { RawHandshakeResponse } from './lib.v2/LitNodeApi/src/handshake';
// export { mostCommonValue } from './lib.v2/helper/most-common-value';
// export { resolveHandshakeResponse } from './lib.v2/LitNodeApi/src/handshake';
export * from './lib.v2/LitNodeApi';
