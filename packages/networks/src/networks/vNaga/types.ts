import { NagaLocalDevelopNetworkContext } from './envs/local-dev/networkContext';
// import { NagaDevNetworkContext } from "./naga-dev/networkContext";
// import { NagaTestNetworkContext } from "./naga-test/networkContext";
// import { NagaMainnetNetworkContext } from "./naga-mainnet/networkContext";

/**
 * Union type representing all supported Naga network contexts.
 *
 * @remarks
 * When using this union type, TypeScript will only allow access to properties/methods
 * that exist in both network contexts. If you attempt to use a method that exists
 * in only one of the network contexts (Dev or Test), TypeScript will throw a
 * compilation error.
 *
 * @example
 * ```typescript
 * function example(networkCtx: NagaContext) {
 *   networkCtx.sharedMethod();    // ✅ OK - exists in both contexts
 *   networkCtx.devOnlyMethod();   // ❌ Error - only exists in DevNetwork
 * }
 * ```
 */
export type NagaContext = NagaLocalDevelopNetworkContext;
// | NagaDevNetworkContext
// | NagaTestNetworkContext
// | NagaMainnetNetworkContext;
