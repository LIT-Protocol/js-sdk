import type { SupportedNetworkName } from "@/lit-login-modal/types";

const KNOWN_NETWORKS = [
  "naga-dev",
  "naga-test",
  "naga-proto",
  "naga",
] as const;

const TESTNET_NETWORKS = new Set<SupportedNetworkName>([
  "naga-dev",
  "naga-test",
]);

const DEFAULT_CHAIN_BY_NETWORK: Record<SupportedNetworkName, string> = {
  "naga-dev": "yellowstone",
  "naga-test": "yellowstone",
  "naga-proto": "naga-proto",
  naga: "naga",
};

function isSupportedNetworkName(value: string): value is SupportedNetworkName {
  return (KNOWN_NETWORKS as readonly string[]).includes(value);
}

export function normalizeNetworkName(
  networkName?: string
): SupportedNetworkName {
  const candidate = (networkName?.toLowerCase() ?? "naga-dev") as string;
  return isSupportedNetworkName(candidate)
    ? (candidate as SupportedNetworkName)
    : "naga-dev";
}

export function getDefaultChainForNetwork(networkName?: string): string {
  const normalized = normalizeNetworkName(networkName);
  return DEFAULT_CHAIN_BY_NETWORK[normalized];
}

export function isTestnetNetwork(networkName?: string): boolean {
  const normalized = normalizeNetworkName(networkName);
  return TESTNET_NETWORKS.has(normalized);
}
