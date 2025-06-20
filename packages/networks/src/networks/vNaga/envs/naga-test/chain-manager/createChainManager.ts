import { privateKeyToAccount } from 'viem/accounts';
import { api } from '../../../LitChainClient';
import { getPKPsByAddress } from '../../../LitChainClient/apis/highLevelApis/PKPPermissionsManager/handlers/getPKPsByAddress';
import { PkpIdentifierRaw } from '../../../LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { ExpectedAccountOrWalletClient } from '../../../LitChainClient/contract-manager/createContractsManager';
import { DefaultNetworkConfig } from '../../../interfaces/NetworkContext';
import { networkConfig } from '../naga-test.config';
import type { PKPStorageProvider } from '../../../../../storage/types';

export type CreateChainManagerReturn = {
  api: {
    mintWithEoa: (
      req?: Parameters<typeof api.mintWithEoa>[0]
    ) => ReturnType<typeof api.mintWithEoa>;
    mintPKP: (
      req: Parameters<typeof api.mintPKP>[0]
    ) => ReturnType<typeof api.mintPKP>;
    mintWithMultiAuths: (
      req: Parameters<typeof api.mintWithMultiAuths>[0]
    ) => ReturnType<typeof api.mintWithMultiAuths>;
    pkpPermissionsManager: (
      pkpIdentifier: PkpIdentifierRaw
    ) => InstanceType<typeof api.PKPPermissionsManager>;
    paymentManager: () => InstanceType<typeof api.PaymentManager>;
    getPKPsByAuthData: (
      authData: {
        authMethodType: number | bigint;
        authMethodId: string;
        accessToken?: string;
      },
      pagination?: { limit?: number; offset?: number },
      storageProvider?: PKPStorageProvider
    ) => ReturnType<typeof api.PKPPermissionsManager.getPKPsByAuthData>;
    getPKPsByAddress: (params: {
      ownerAddress: string;
      pagination?: { limit?: number; offset?: number };
      storageProvider?: PKPStorageProvider;
    }) => ReturnType<typeof getPKPsByAddress>;
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
  // TODO: This ideally should set to NagaLocalNetworkContext.
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
      mintWithEoa: bindContext(api.mintWithEoa),
      mintPKP: bindContext(api.mintPKP),
      mintWithMultiAuths: bindContext(api.mintWithMultiAuths),
      pkpPermissionsManager: (pkpIdentifier: PkpIdentifierRaw) => {
        return new api.PKPPermissionsManager(
          pkpIdentifier,
          _networkConfig,
          accountOrWalletClient
        );
      },
      paymentManager: () => {
        return new api.PaymentManager(
          _networkConfig,
          accountOrWalletClient
        );
      },
      getPKPsByAuthData: (
        authData: {
          authMethodType: number | bigint;
          authMethodId: string;
          accessToken?: string;
        },
        pagination?: { limit?: number; offset?: number },
        storageProvider?: PKPStorageProvider
      ) => {
        return api.PKPPermissionsManager.getPKPsByAuthData(
          authData,
          pagination,
          storageProvider,
          _networkConfig,
          accountOrWalletClient
        );
      },
      getPKPsByAddress: (params: {
        ownerAddress: string;
        pagination?: { limit?: number; offset?: number };
        storageProvider?: PKPStorageProvider;
      }) => {
        // Provide default pagination if not provided
        const defaultPagination = { limit: 10, offset: 0 };
        const finalPagination = params.pagination
          ? {
              limit: params.pagination.limit ?? defaultPagination.limit,
              offset: params.pagination.offset ?? defaultPagination.offset,
            }
          : defaultPagination;

        return getPKPsByAddress(
          {
            ownerAddress: params.ownerAddress,
            pagination: finalPagination,
            storageProvider: params.storageProvider,
          },
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
