import {
  createPublicClient,
  createWalletClient,
  getContract,
  Hex,
  http,
  PublicClient,
  WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { DatilContext } from '../../../../../VDatil/types';

interface CreateLitContractsOptions {
  publicClient?: PublicClient;
}

// =============================================================================================================================================
// ❗️ These types are required to fix the following error
// ERROR: The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed.ts(7056)
// If you could fix this WITHOUT breaking this code apart, or without setting the tsconfig's "declaration" to false, please do fix this. 🙏
// =============================================================================================================================================

// Import the network context to get the contract data type
import { datilDevNetworkContext } from '../../../../../VDatil/datil-dev/networkContext';

// Extract just the ContractData type, and you can use this type for variables that will eventually hold contract data
let futureContractData = datilDevNetworkContext.chainConfig.contractData;

const pkpNftContractType = getContract({
  address: undefined as unknown as Hex,
  abi: [
    futureContractData.PKPNFT.methods.claimAndMint,
    futureContractData.PKPNFT.methods.mintCost,
    futureContractData.PKPNFT.methods.tokenOfOwnerByIndex,
  ],
  client: {
    public: undefined as unknown as PublicClient,
    wallet: undefined as unknown as WalletClient,
  },
});

const pkpHelperContractType = getContract({
  address: undefined as unknown as Hex,
  abi: [
    futureContractData.PKPHelper.methods
      .claimAndMintNextAndAddAuthMethodsWithTypes,
    futureContractData.PKPHelper.methods.mintNextAndAddAuthMethods,
  ],
  client: {
    public: undefined as unknown as PublicClient,
    wallet: undefined as unknown as WalletClient,
  },
});

const stakingContractType = getContract({
  address: undefined as unknown as Hex,
  abi: [
    futureContractData.Staking.methods
      .getActiveUnkickedValidatorStructsAndCounts,
  ],
  client: {
    public: undefined as unknown as PublicClient,
    wallet: undefined as unknown as WalletClient,
  },
});

const pkpPermissionsContractType = getContract({
  address: undefined as unknown as Hex,
  abi: [
    futureContractData.PKPPermissions.methods.addPermittedAction,
    futureContractData.PKPPermissions.methods.addPermittedAddress,
    futureContractData.PKPPermissions.methods.getPermittedActions,
    futureContractData.PKPPermissions.methods.getPermittedAddresses,
    futureContractData.PKPPermissions.methods.getPermittedAuthMethods,
    futureContractData.PKPPermissions.methods.getPermittedAuthMethodScopes,
    futureContractData.PKPPermissions.methods.removePermittedAction,
    futureContractData.PKPPermissions.methods.removePermittedAddress,
    futureContractData.PKPPermissions.methods.isPermittedAction,
    futureContractData.PKPPermissions.methods.isPermittedAddress,
  ],
  client: {
    public: undefined as unknown as PublicClient,
    wallet: undefined as unknown as WalletClient,
  },
});

const pubkeyRouterContractType = getContract({
  address: undefined as unknown as Hex,
  abi: [
    futureContractData.PubkeyRouter.methods.deriveEthAddressFromPubkey,
    futureContractData.PubkeyRouter.methods.ethAddressToPkpId,
    futureContractData.PubkeyRouter.methods.getEthAddress,
    futureContractData.PubkeyRouter.methods.getPubkey,
  ],
  client: {
    public: undefined as unknown as PublicClient,
    wallet: undefined as unknown as WalletClient,
  },
});
// Hacky fix ends

export const createLitContracts = (
  networkCtx: DatilContext,
  opts?: CreateLitContractsOptions
) => {
  // 1. Fallback to env-based private key if user doesn't supply a wagmi walletClient
  const fallbackTransport = http(networkCtx.rpcUrl);
  const fallbackAccount = privateKeyToAccount(
    networkCtx.privateKey as `0x${string}`
  );

  // 2. Decide which publicClient to use
  const publicClient =
    opts?.publicClient ??
    createPublicClient({
      chain: networkCtx.chainConfig.chain,
      transport: fallbackTransport,
    });

  // 3. Decide which walletClient to use
  const walletClient =
    networkCtx?.walletClient ??
    createWalletClient({
      chain: networkCtx.chainConfig.chain,
      transport: fallbackTransport,
      account: fallbackAccount,
    });

  // 4. Get the contract data
  const contractData = networkCtx.chainConfig.contractData;

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
    pkpNftContract: pkpNftContract as unknown as typeof pkpNftContractType,
    pkpHelperContract:
      pkpHelperContract as unknown as typeof pkpHelperContractType,
    stakingContract: stakingContract as unknown as typeof stakingContractType,
    pkpPermissionsContract:
      pkpPermissionsContract as unknown as typeof pkpPermissionsContractType,
    publicClient,
    walletClient,
    pubkeyRouterContract:
      pubkeyRouterContract as unknown as typeof pubkeyRouterContractType,
  };
};
