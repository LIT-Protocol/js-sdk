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
import { privateKeyToAccount } from 'viem/accounts';
// import { signatures } from '../../envs/naga-local/generated/naga-develop';
import { nagaDevSignatures } from '@lit-protocol/contracts';
import { INetworkConfig } from '../../interfaces/NetworkContext';

type Signatures = typeof nagaDevSignatures;

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
  // Check if accountOrWalletClient is null or undefined
  if (!accountOrWalletClient) {
    throw new Error('accountOrWalletClient is required but was not provided');
  }

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
  const dummyAccount = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  );
  return createContractsManager(networkConfig, dummyAccount);
};

// ❗️ WARNING! This is a hacky fix to bypass the type system. We automatically add "any" type
// before building the packages. When we develop, we will remove the : any to ensure type safety.
export const createContractsManager = <T, M>(
  networkConfig: INetworkConfig<T, M>,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): any => {
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
  const contractData = networkConfig.abiSignatures as Signatures;

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
      contractData.PKPNFT.methods.mintNext,
      contractData.PKPNFT.methods.safeTransferFrom,
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
      contractData.PKPPermissions.methods.addPermittedAuthMethodScope,
      contractData.PKPPermissions.methods.getPermittedActions,
      contractData.PKPPermissions.methods.getPermittedAddresses,
      contractData.PKPPermissions.methods.getPermittedAuthMethods,
      contractData.PKPPermissions.methods.getPermittedAuthMethodScopes,
      contractData.PKPPermissions.methods.removePermittedAction,
      contractData.PKPPermissions.methods.removePermittedAddress,
      contractData.PKPPermissions.methods.removePermittedAuthMethod,
      contractData.PKPPermissions.methods.isPermittedAction,
      contractData.PKPPermissions.methods.isPermittedAddress,
      contractData.PKPPermissions.methods.getTokenIdsForAuthMethod,
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

  const ledgerContract = getContract({
    address: contractData.Ledger.address,
    abi: [
      contractData.Ledger.methods.balance,
      contractData.Ledger.methods.deposit,
      contractData.Ledger.methods.depositForUser,
      contractData.Ledger.methods.latestWithdrawRequest,
      contractData.Ledger.methods.requestWithdraw,
      contractData.Ledger.methods.stableBalance,
      contractData.Ledger.methods.userWithdrawDelay,
      contractData.Ledger.methods.withdraw,
      ...contractData.Ledger.events,
    ],
    client: { public: publicClient, wallet: walletClient },
  });

  const paymentDelegationContract = getContract({
    address: contractData.PaymentDelegation.address,
    abi: [
      contractData.PaymentDelegation.methods.delegatePayments,
      contractData.PaymentDelegation.methods.delegatePaymentsBatch,
      contractData.PaymentDelegation.methods.getPayers,
      contractData.PaymentDelegation.methods.getPayersAndRestrictions,
      contractData.PaymentDelegation.methods.getRestriction,
      contractData.PaymentDelegation.methods.getUsers,
      contractData.PaymentDelegation.methods.setRestriction,
      contractData.PaymentDelegation.methods.undelegatePayments,
      contractData.PaymentDelegation.methods.undelegatePaymentsBatch,
      ...contractData.PaymentDelegation.events,
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
    ledgerContract,
    paymentDelegationContract,
    publicClient,
    walletClient,
  };
};
