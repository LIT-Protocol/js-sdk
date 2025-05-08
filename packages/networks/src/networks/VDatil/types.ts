import { DatilDevNetworkContext } from './datil-dev/networkContext';
import { DatilMainnetNetworkContext } from './datil-mainnet/networkContext';
import { DatilTestNetworkContext } from './datil-test/networkContext';

/**
 * Union type representing all supported Datil network contexts.
 *
 * @remarks
 * When using this union type, TypeScript will only allow access to properties/methods
 * that exist in both network contexts. If you attempt to use a method that exists
 * in only one of the network contexts (Dev or Test), TypeScript will throw a
 * compilation error.
 *
 * @example
 * ```typescript
 * function example(networkCtx: DatilContext) {
 *   networkCtx.sharedMethod();    // ✅ OK - exists in both contexts
 *   networkCtx.devOnlyMethod();   // ❌ Error - only exists in DevNetwork
 * }
 * ```
 */
export type DatilContext =
  | DatilDevNetworkContext
  | DatilTestNetworkContext
  | DatilMainnetNetworkContext;
