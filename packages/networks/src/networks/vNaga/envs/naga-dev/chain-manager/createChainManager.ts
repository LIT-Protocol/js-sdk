import { api } from '../../../LitChainClient';
import { PkpIdentifierRaw } from '../../../LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { ExpectedAccountOrWalletClient } from '../../../LitChainClient/contract-manager/createContractsManager';
import { DefaultNetworkConfig } from '../../../interfaces/NetworkContext';
import { networkConfig } from '../naga-dev.config';
import { privateKeyToAccount } from 'viem/accounts';

// import { networkConfig as localConfig } from '../../naga-local/naga-local.config';

export type CreateChainManagerReturn = {
  api: {
    mintPKP: (
      req: Parameters<typeof api.mintPKP>[0]
    ) => ReturnType<typeof api.mintPKP>;
    pkpPermissionsManager: (
      pkpIdentifier: PkpIdentifierRaw
    ) => InstanceType<typeof api.PKPPermissionsManager>;
    pricing: {
      getPriceFeedInfo: (
        req: Parameters<typeof api.pricing.getPriceFeedInfo>[0]
      ) => ReturnType<typeof api.pricing.getPriceFeedInfo>;
      getNodePrices: (
        req: Parameters<typeof api.pricing.getNodePrices>[0]
      ) => ReturnType<typeof api.pricing.getNodePrices>;
    };
    connection: {
      getConnectionInfo: (args?: {
        nodeProtocol?: string | null;
      }) => ReturnType<typeof api.connection.getConnectionInfo>;
    };
  };
};

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
  // TODO: This ideally should set to NagaDevNetworkConfig.
  const _networkConfig = networkConfig as unknown as DefaultNetworkConfig;

  // Helper to bind the network context to an API function
  const bindContext = <ReqArgType, RetType>(
    fn: (
      req: ReqArgType,
      ctx: DefaultNetworkConfig,
      accountOrWalletClient: ExpectedAccountOrWalletClient
    ) => RetType
  ) => {
    return (req: ReqArgType): RetType =>
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
