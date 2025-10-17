import { buildSignaturesFromContext } from '@lit-protocol/contracts/custom-network-signatures';
import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManagerFactory } from '../../shared/factories/BaseChainManagerFactory';
import {
  NagaLocalEnvironment,
  nagaLocalEnvironment,
  type NagaLocalSignatures,
} from './naga-local.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

type NagaLocalContextOptions = {
  networkContextPath: string;
  networkName?: string;
  rpcUrlOverride?: string;
};

const createChainManager = (
  env: NagaLocalEnvironment,
  account: ExpectedAccountOrWalletClient
) => createChainManagerFactory(env.getConfig(), account);

const buildModule = (env: NagaLocalEnvironment) => {
  const base = createBaseModule({
    networkConfig: env.getConfig(),
    moduleName: env.getNetworkName(),
    createChainManager: (account: ExpectedAccountOrWalletClient) =>
      createChainManager(env, account),
  });

  const createWithEnv = (nextEnv: NagaLocalEnvironment) => buildModule(nextEnv);

  const withOverrides = (overrides: { rpcUrl?: string }) => {
    const resolvedRpc = overrides.rpcUrl ?? env.getConfig().rpcUrl;

    return createWithEnv(
      new NagaLocalEnvironment({
        rpcUrlOverride: resolvedRpc,
        signatures: env.getConfig().abiSignatures,
      })
    );
  };

  const withLocalContext = (options: NagaLocalContextOptions) => {
    const { networkContextPath, networkName, rpcUrlOverride } = options;

    const { signatures } = buildSignaturesFromContext({
      jsonFilePath: networkContextPath,
      networkName: networkName ?? 'naga-develop',
    });

    const resolvedSignatures = signatures as unknown as NagaLocalSignatures;

    return createWithEnv(
      new NagaLocalEnvironment({
        rpcUrlOverride: rpcUrlOverride ?? env.getConfig().rpcUrl,
        signatures: resolvedSignatures,
      })
    );
  };

  return {
    ...base,
    getPrivateKey: () => env.getPrivateKey(),
    withOverrides,
    withLocalContext,
  };
};

const nagaLocal = buildModule(nagaLocalEnvironment);

export type NagaLocal = ReturnType<typeof buildModule>;
export type { NagaLocalContextOptions };
export { nagaLocal };
