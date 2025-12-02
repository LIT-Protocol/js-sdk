import { z } from 'zod';

/**
 * Canonical metadata for Lit e2e network targets.
 * - `importName` feeds `@lit-protocol/networks` dynamic imports.
 * - `type` lets higher level helpers branch on local vs live behaviour.
 *
 * @example
 * ```ts
 * NETWORKS['naga-dev'];
 * // { importName: 'nagaDev', type: 'live' }
 * ```
 */
export const NETWORKS = {
  'naga-dev': { importName: 'nagaDev', type: 'live' },
  'naga-test': { importName: 'nagaTest', type: 'live' },
  'naga-local': { importName: 'nagaLocal', type: 'local' },
  'naga-staging': { importName: 'nagaStaging', type: 'live' },
  'naga-proto': { importName: 'nagaProto', type: 'live' },
  naga: { importName: 'naga', type: 'live' },
} as const;

export type NetworkName = keyof typeof NETWORKS;

export type NetworkConfig = (typeof NETWORKS)[NetworkName];

export type NetworkType = NetworkConfig['type'];

export type NetworkImportName = NetworkConfig['importName'];

const NETWORK_NAME_VALUES = Object.keys(NETWORKS) as NetworkName[];

const NETWORK_NAME_TUPLE = NETWORK_NAME_VALUES as [
  NetworkName,
  ...NetworkName[]
];

/**
 * Shared schema so callers can parse env/config values consistently.
 *
 * @example
 * ```ts
 * NetworkNameSchema.parse('naga-local');
 * // 'naga-local'
 * ```
 */
export const NetworkNameSchema = z.enum(NETWORK_NAME_TUPLE);

export const DEFAULT_NETWORK_NAME: NetworkName = 'naga-dev';

/**
 * Ordered list of network identifiers. Useful when presenting choices to users.
 *
 * @example
 * ```ts
 * SUPPORTED_NETWORK_NAMES;
 * // ['naga-dev', 'naga-test', 'naga-local', 'naga-staging']
 * ```
 */
export const SUPPORTED_NETWORK_NAMES = [...NETWORK_NAME_VALUES] as const;

type NetworksModule = typeof import('@lit-protocol/networks');

export type LitNetworkModule = NetworksModule[NetworkImportName];

/**
 * Type guard used when consuming untyped sources such as env variables.
 *
 * @example
 * ```ts
 * isNetworkName('naga-test');
 * // true
 *
 * isNetworkName('unknown-network');
 * // false
 * ```
 */
export function isNetworkName(value: unknown): value is NetworkName {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(NETWORKS, value)
  );
}

/**
 * Normalises any caller-provided identifier to the canonical network tuple used
 * by init flows and tests. Always returns a full `NETWORKS` entry alongside the
 * resolved name, so callers can keep a single source of truth for network metadata.
 *
 * @example
 * ```ts
 * getNetworkConfig('naga-test');
 * // { name: 'naga-test', importName: 'nagaTest', type: 'live' }
 *
 * getNetworkConfig();
 * // { name: 'naga-dev', importName: 'nagaDev', type: 'live' }
 * ```
 */
export function getNetworkConfig(network?: string): {
  name: NetworkName;
  importName: NetworkImportName;
  type: NetworkType;
} {
  const candidate = (network ?? DEFAULT_NETWORK_NAME) as string;

  if (!isNetworkName(candidate)) {
    throw new Error(
      `Unsupported network "${network}". Supported networks: ${SUPPORTED_NETWORK_NAMES.join(
        ', '
      )}`
    );
  }

  const name: NetworkName = candidate;
  const { importName, type } = NETWORKS[name];

  return { name, importName, type };
}

/**
 * Convenience wrapper used where only the `importName` string matters.
 *
 * @example
 * ```ts
 * resolveNetworkImportName('naga-local');
 * // 'nagaLocal'
 * ```
 */
export function resolveNetworkImportName(network?: string): NetworkImportName {
  return getNetworkConfig(network).importName;
}

export type ResolveNetworkOptions = {
  network?: string;
  rpcUrlOverride?: string;
};

export type ResolvedNetwork = {
  name: NetworkName;
  importName: NetworkImportName;
  type: NetworkType;
  networkModule: LitNetworkModule;
};

/**
 * Fully resolves a Lit network by combining metadata with the backing module.
 *
 * @example
 * ```ts
 * const { name, networkModule } = await resolveNetwork({
 *   network: 'naga-local',
 *   rpcUrlOverride: 'http://127.0.0.1:8545',
 * });
 * // name === 'naga-local'
 * // networkModule is the hydrated Lit network module with overrides applied
 * ```
 */
export async function resolveNetwork(
  options: ResolveNetworkOptions = {}
): Promise<ResolvedNetwork> {
  const { network, rpcUrlOverride } = options;
  const { name, importName, type } = getNetworkConfig(network);

  const networksModule: NetworksModule = await import('@lit-protocol/networks');
  const baseNetworkModule = networksModule[importName];

  const networkModule =
    rpcUrlOverride && typeof baseNetworkModule.withOverrides === 'function'
      ? baseNetworkModule.withOverrides({ rpcUrl: rpcUrlOverride })
      : baseNetworkModule;

  return { name, importName, type, networkModule };
}
