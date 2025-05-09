import { networkConfig } from '@nagaDev/config';
import { api } from '@vNaga/LitChainClient/apis';
import { PkpIdentifierRaw } from '@vNaga/LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { ExpectedAccountOrWalletClient } from '@vNaga/LitChainClient/ContractsManager';
import { DefaultNetworkConfig } from '../../../interfaces/NetworkContext';

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
) => {
  // TODO: This ideally should set to NagaDevNetworkConfig.
  const _networkConfig = networkConfig as unknown as DefaultNetworkConfig;

  // Helper to bind the network context to an API function
  const bindContext = <
    T extends (
      req: any,
      ctx: DefaultNetworkConfig,
      accountOrWalletClient: ExpectedAccountOrWalletClient
    ) => any
  >(
    fn: T
  ) => {
    return (req: Parameters<T>[0]): ReturnType<T> =>
      fn(req, _networkConfig, accountOrWalletClient);
  };

  return {
    api: {
      mintPKP: bindContext(api.mintPKP),
      pkpPermissionsManager: (pkpIdentifier: PkpIdentifierRaw) => {
        return new api.PKPPermissionsManager(
          pkpIdentifier,
          _networkConfig,
          accountOrWalletClient
        );
      },
      pricing: {
        getPriceFeedInfo: bindContext(api.pricing.getPriceFeedInfo),
        getNodePrices: bindContext(api.pricing.getNodePrices),
      },
    },
  };
};
