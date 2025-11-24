import { SUPPORTED_NETWORKS, type SupportedNetwork } from '../createEnvVars';

export type ShivaEnvVars = {
  network: SupportedNetwork;
  shivaBaseUrl: string;
  litNodeBin: string;
  litActionsBin: string;
};

export const createShivaEnvVars = (): ShivaEnvVars => {
  const networkEnv = process.env['NETWORK'];
  if (
    !networkEnv ||
    !SUPPORTED_NETWORKS.includes(networkEnv as SupportedNetwork)
  ) {
    throw new Error(
      `Unsupported or missing NETWORK env var. Supported values: ${SUPPORTED_NETWORKS.join(
        ', '
      )}`
    );
  }

  const network = networkEnv as SupportedNetwork;

  const shivaBaseUrl = process.env['SHIVA_BASE_URL'];
  if (!shivaBaseUrl) {
    throw new Error('Missing SHIVA_BASE_URL env var.');
  }

  const litNodeBin = process.env['LIT_NODE_BIN'];
  if (!litNodeBin) {
    throw new Error('Missing LIT_NODE_BIN env var.');
  }

  const litActionsBin = process.env['LIT_ACTIONS_BIN'];
  if (!litActionsBin) {
    throw new Error('Missing LIT_ACTIONS_BIN env var.');
  }

  return {
    network,
    shivaBaseUrl,
    litNodeBin,
    litActionsBin,
  };
};
