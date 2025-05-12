import { GetWalletClientReturnType } from '@wagmi/core';
import {
  Account,
  Chain,
  createPublicClient,
  createWalletClient,
  getContract,
  http,
  WalletClient,
} from 'viem';
import { signatures } from '../../envs/naga-local/generated/naga-develop';
import { INetworkConfig } from '../../interfaces/NetworkContext';
import { privateKeyToAccount } from 'viem/accounts';
export type ExpectedAccountOrWalletClient =
  | Account
  | WalletClient
  | GetWalletClientReturnType
  | any;

function _resolveAccount({
  accountOrWalletClient,
  chainConfig,
  rpcUrl,
}: {
  accountOrWalletClient: ExpectedAccountOrWalletClient;
  chainConfig: Chain;
  rpcUrl: string;
}) {
  // If a wallet client is already provided, use it directly
  if (accountOrWalletClient.type === 'local') {
    // If an account is provided, create a wallet client with it
    const walletClient = createWalletClient({
      account: accountOrWalletClient as Account,
      chain: chainConfig,
      transport: http(rpcUrl),
    });
    return walletClient;
  } else {
    return accountOrWalletClient as WalletClient;
  }
}

export const createReadOnlyContractsManager = <T, M>(
  networkConfig: INetworkConfig<T, M>
) => {
  // dummy private key for read actions
  const dummyAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  return createContractsManager(networkConfig, dummyAccount);
}

// ❗️ WARNING! This is a hacky fix to bypass the type system. We automatically add "any" type
// before building the packages. When we develop, we will remove the : any to ensure type safety.
export const createContractsManager = <T, M>(
  networkConfig: INetworkConfig<T, M>,
  accountOrWalletClient: ExpectedAccountOrWalletClient
) => {
  // 2. Decide which publicClient to use
  const publicClient =
    // opts?.publicClient ??
    createPublicClient({
      chain: networkConfig.chainConfig,
      transport: http(networkConfig.rpcUrl),
    });

  // 3. Decide which walletClient to use
  const walletClient = _resolveAccount({
    accountOrWalletClient,
    chainConfig: networkConfig.chainConfig,
    rpcUrl: networkConfig.rpcUrl,
  });

  // 4. Get the contract data (casting a default type to ensure type safety)
  const contractData = networkConfig.abiSignatures as typeof signatures;

  if (!contractData) {
    throw new Error(
      `Contract data not found for network: ${networkConfig.network}`
    );
  }

  // ---------- All your contracts ----------
  const pkpNftContract = getContract({
    address: contractData.PKPNFT.address,
    abi: [
      contractData.PKPNFT.methods.claimAndMint,
      contractData.PKPNFT.methods.mintCost,
      contractData.PKPNFT.methods.tokenOfOwnerByIndex,
      ...contractData.PKPNFT.events,
    ],
    client: { public: publicClient, wallet: walletClient },
  });

  const pkpHelperContract = getContract({
    address: contractData.PKPHelper.address,
    abi: [
      contractData.PKPHelper.methods.claimAndMintNextAndAddAuthMethodsWithTypes,
      contractData.PKPHelper.methods.mintNextAndAddAuthMethods,
      ...contractData.PKPHelper.events,
    ],
    client: { public: publicClient, wallet: walletClient },
  });

  const stakingContract = getContract({
    address: contractData.Staking.address,
    abi: [
      contractData.Staking.methods.getActiveUnkickedValidatorStructsAndCounts,
      ...contractData.Staking.events,
    ],
    client: { public: publicClient, wallet: walletClient },
  });

  const priceFeed = getContract({
    address: contractData.PriceFeed.address,
    abi: [
      contractData.PriceFeed.methods.getNodesForRequest,
      ...contractData.PriceFeed.events,
    ],
    client: { public: publicClient, wallet: walletClient },
  });

  const pkpPermissionsContract = getContract({
    address: contractData.PKPPermissions.address,
    abi: [
      contractData.PKPPermissions.methods.addPermittedAction,
      contractData.PKPPermissions.methods.addPermittedAddress,
      contractData.PKPPermissions.methods.getPermittedActions,
      contractData.PKPPermissions.methods.getPermittedAddresses,
      contractData.PKPPermissions.methods.getPermittedAuthMethods,
      contractData.PKPPermissions.methods.getPermittedAuthMethodScopes,
      contractData.PKPPermissions.methods.removePermittedAction,
      contractData.PKPPermissions.methods.removePermittedAddress,
      contractData.PKPPermissions.methods.isPermittedAction,
      contractData.PKPPermissions.methods.isPermittedAddress,
      ...contractData.PKPPermissions.events,
    ],
    client: { public: publicClient, wallet: walletClient },
  });

  const pubkeyRouterContract = getContract({
    address: contractData.PubkeyRouter.address,
    abi: [
      contractData.PubkeyRouter.methods.deriveEthAddressFromPubkey,
      contractData.PubkeyRouter.methods.ethAddressToPkpId,
      contractData.PubkeyRouter.methods.getEthAddress,
      contractData.PubkeyRouter.methods.getPubkey,
      ...contractData.PubkeyRouter.events,
    ],
    client: { public: publicClient, wallet: walletClient },
  });

  // ---------- End of all your contracts ----------
  return {
    pkpNftContract,
    pkpHelperContract,
    stakingContract,
    priceFeed,
    pkpPermissionsContract,
    pubkeyRouterContract,
    publicClient,
    walletClient,
  };
};
