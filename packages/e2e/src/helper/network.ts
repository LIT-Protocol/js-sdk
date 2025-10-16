const NETWORK_IMPORT_MAP = {
  'naga-dev': 'nagaDev',
  'naga-test': 'nagaTest',
  'naga-local': 'nagaLocal',
  'naga-staging': 'nagaStaging',
} as const;

export type SupportedNetwork = keyof typeof NETWORK_IMPORT_MAP;

export function resolveNetworkImportName(
  network?: string
): (typeof NETWORK_IMPORT_MAP)[SupportedNetwork] {
  const key = (network as SupportedNetwork | undefined) ?? 'naga-dev';
  if (key in NETWORK_IMPORT_MAP) {
    return NETWORK_IMPORT_MAP[key];
  }

  throw new Error(
    `Unsupported network "${network}". Supported networks: ${Object.keys(
      NETWORK_IMPORT_MAP
    ).join(', ')}`
  );
}
