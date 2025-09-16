import { privateKeyToAccount } from 'viem/accounts';
import { api } from '../managers/LitChainClient';
import { getPKPsByAddress } from '../managers/LitChainClient/apis/highLevelApis/PKPPermissionsManager/handlers/getPKPsByAddress';
import { PkpIdentifierRaw } from '../managers/LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { ExpectedAccountOrWalletClient } from '../managers/contract-manager/createContractsManager';
import {
  DefaultNetworkConfig,
  INetworkConfig,
} from '../interfaces/NetworkContext';
import type { PKPStorageProvider } from '../../../../storage/types';
import { DEV_PRIVATE_KEY } from '@lit-protocol/constants';
import { AuthData, StrictAuthData } from '@lit-protocol/schemas';

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
      authData: Partial<StrictAuthData> | Partial<AuthData>,
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

/**
 * Factory function that creates a chain manager for any environment
 * This eliminates code duplication by providing a single implementation
 * that can be configured with different network configurations
 */
export const createChainManagerFactory = <T, M>(
  networkConfig: INetworkConfig<T, M>,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
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

  const bindAccount = <ReqArgType, RetType>(
    fn: (
      req: ReqArgType,
      accountOrWalletClient: ExpectedAccountOrWalletClient
    ) => RetType
  ) => {
    return (req: ReqArgType): RetType => fn(req, accountOrWalletClient);
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
        return new api.PaymentManager(_networkConfig, accountOrWalletClient);
      },
      getPKPsByAuthData: (
        authData: Partial<StrictAuthData> | Partial<AuthData>,
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
        getPriceFeedInfo: bindAccount(api.pricing.getPriceFeedInfo),
        getNodePrices: bindAccount(api.pricing.getNodePrices),
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

/**
 * Creates a read-only chain manager using the factory pattern
 * This is used for operations that don't require a specific user account
 */
export const createReadOnlyChainManagerFactory = (networkConfig: any) => {
  return () => {
    // dummy private key for read actions
    const dummyAccount = privateKeyToAccount(DEV_PRIVATE_KEY);
    return createChainManagerFactory(networkConfig, dummyAccount);
  };
};
