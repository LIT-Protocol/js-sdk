import { api } from '@vNaga/LitChainClient';
import { PkpIdentifierRaw } from '@vNaga/LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { ExpectedAccountOrWalletClient } from '@vNaga/LitChainClient/contract-manager/createContractsManager';
import { DefaultNetworkConfig } from '../../../interfaces/NetworkContext';
import { networkConfig } from '../naga-dev.config';
import { privateKeyToAccount } from 'viem/accounts';

// import { networkConfig as localConfig } from '../../naga-local/naga-local.config';

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
      connection: {
        getConnectionInfo: (args?: {
          nodeProtocol?: string | null;
        }): ReturnType<typeof api.connection.getConnectionInfo> => {
          return api.connection.getConnectionInfo({
            networkCtx: _networkConfig,
            accountOrWalletClient: accountOrWalletClient,
            nodeProtocol: args?.nodeProtocol,
          });
        },
      },
    },
  };
};

export const createReadOnlyChainManager = () => {
  // dummy private key for read actions
  const dummyAccount = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  );
  const chainManager = createChainManager(dummyAccount);
  return createChainManager(chainManager);
};

// @ts-ignore
// if (import.meta.main) {
//   (async () => {
//     const { privateKeyToAccount } = await import('viem/accounts');

//     const viemAccount = privateKeyToAccount(process.env['PRIVATE_KEY'] as any);

//     const chainManager = createChainManager(viemAccount);

//     const connectionInfo =
//       await chainManager.api.connection.getConnectionInfo();

//     console.log(connectionInfo);
//   })();
// }
