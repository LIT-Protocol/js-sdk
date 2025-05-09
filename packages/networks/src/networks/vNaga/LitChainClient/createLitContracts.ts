import {
  createPublicClient,
  createWalletClient,
  getContract,
  http,
  PublicClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { signatures } from '../envs/naga-local/generated/naga-develop';
import { INetworkConfig } from '../interfaces/NetworkContext';
interface CreateLitContractsOptions {
  publicClient?: PublicClient;
}

// ❗️ WARNING! This is a hacky fix to bypass the type system. We automatically add "any" type
// before building the packages. When we develop, we will remove the : any to ensure type safety.
export const createLitContracts = (
  networkCtx: INetworkConfig<typeof signatures, any>,
  opts?: CreateLitContractsOptions
): any => {
  // 1. Fallback to env-based private key if user doesn't supply a wagmi walletClient
  const fallbackTransport = http(networkCtx.rpcUrl);
  const fallbackAccount = privateKeyToAccount(
    networkCtx.networkSpecificConfigs.privateKey as `0x${string}`
  );

  // 2. Decide which publicClient to use
  const publicClient =
    opts?.publicClient ??
    createPublicClient({
      chain: networkCtx.chainConfig,
      transport: fallbackTransport,
    });

  // 3. Decide which walletClient to use
  const walletClient =
    // networkCtx?.walletClient ??
    createWalletClient({
      chain: networkCtx.chainConfig,
      transport: fallbackTransport,
      account: fallbackAccount,
    });

  // 4. Get the contract data
  const contractData = networkCtx.abiSignatures;

  if (!contractData) {
    throw new Error(
      `Contract data not found for network: ${networkCtx.network}`
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
