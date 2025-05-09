import { api } from '../../../../vNaga/LitChainClient/apis';
import { PkpIdentifierRaw } from '../../../../vNaga/LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { ExpectedAccountOrWalletClient } from '../../../../vNaga/LitChainClient/contract-manager/createContractsManager';
import { DefaultNetworkConfig } from '../../../interfaces/NetworkContext';
import { networkConfig } from '../naga-dev.config';

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

// @ts-ignore
if (import.meta.main) {
  (async () => {
    const { privateKeyToAccount } = await import('viem/accounts');

    const viemAccount = privateKeyToAccount(process.env['PRIVATE_KEY'] as any);

    const chainManager = createChainManager(viemAccount);

    const result = await chainManager.api.mintPKP({
      scopes: ['sign-anything'],
      authMethod: {
        authMethodType: 1,
        accessToken: JSON.stringify({
          accessToken: '0x',
        }),
      },
    });

    console.log(result);
  })();
}
