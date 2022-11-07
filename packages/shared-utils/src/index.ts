import {
    fromString as uint8arrayFromString,
    toString as uint8arrayToString,
} from 'uint8arrays';

/** ----- Utils ----- */
export * from './lib/utils';

// -- browser
export * from './lib/browser';
export * from './lib/humanizer';
export * from './lib/crypto';

// -- browser/lit
export * from './lib/lit/lit';
export * from './lib/lit/session';

/** ----- Chains ----- */
export * as cosmos from './lib/chains/cosmos';
export * as eth from './lib/chains/eth';

/** ------ Access Control Conditions ----- */
export * from './lib/access-control-conditions/hashing';
export * from './lib/access-control-conditions/canonicalFormatter';

export {
    uint8arrayFromString,
    uint8arrayToString
}