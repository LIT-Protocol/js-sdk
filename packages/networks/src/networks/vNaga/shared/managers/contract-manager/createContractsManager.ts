import type { Account, Chain, WalletClient, Client } from 'viem';
import { createPublicClient, createWalletClient, getContract, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { INetworkConfig } from '../../interfaces/NetworkContext';
import { DEV_PRIVATE_KEY } from '@lit-protocol/constants';
import type { LocalAccount } from 'viem/accounts';

// ❗️ NOTE: This could be any network's signatures assuming they all have the same ABI signatures
// import { signatures } from '../../envs/naga-local/generated/naga-develop';
import { nagaDevSignatures } from '@lit-protocol/contracts';
type Signatures = typeof nagaDevSignatures;

export type ExpectedAccountOrWalletClient = Account | WalletClient;

function _resolveAccount({
  accountOrWalletClient,
  chainConfig,
  rpcUrl,
}: {
  accountOrWalletClient: ExpectedAccountOrWalletClient;
  chainConfig: Chain;
  rpcUrl: string;
}): WalletClient {
  if (!accountOrWalletClient)
    throw new Error('accountOrWalletClient is required');
  if (accountOrWalletClient.type === 'local') {
    const account = accountOrWalletClient as LocalAccount;
    const client = createWalletClient({
      account,
      chain: chainConfig,
      transport: http(rpcUrl),
    });
    return client;
  }
  return accountOrWalletClient as WalletClient;
}

export const createReadOnlyContractsManager = <T, M>(
  networkConfig: INetworkConfig<T, M>
) => {
  // dummy private key for read actions
  const dummyAccount = privateKeyToAccount(DEV_PRIVATE_KEY);
  return createContractsManager(networkConfig, dummyAccount);
};

// ❗️ WARNING! This is a hacky fix to bypass the type system. We automatically add "any" type
// before building the packages. When we develop, we will remove the : any to ensure type safety.
export const createContractsManager = <T, M>(
  networkConfig: INetworkConfig<T, M>,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): any => {
  // 2. Decide which publicClient to use
  const publicClient = createPublicClient({
    chain: networkConfig.chainConfig,
    transport: http(networkConfig.rpcUrl),
  });

  // 3. Decide which walletClient to use
  const walletClient = _resolveAccount({
    accountOrWalletClient,
    chainConfig: networkConfig.chainConfig,
    rpcUrl: networkConfig.rpcUrl,
  });

  // Normalise to base Client type for contract typing
  const publicClientForContract: Client = publicClient as unknown as Client;
  const walletClientForContract: Client = walletClient as unknown as Client;

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
    client: { wallet: walletClientForContract },
  });

  const pkpHelperContract = getContract({
    address: contractData.PKPHelper.address,
    abi: [
      contractData.PKPHelper.methods.claimAndMintNextAndAddAuthMethodsWithTypes,
      contractData.PKPHelper.methods.mintNextAndAddAuthMethods,
      ...contractData.PKPHelper.events,
    ],
    client: { wallet: walletClientForContract },
  });

  const stakingContract = getContract({
    address: contractData.Staking.address,
    abi: [
      contractData.Staking.methods.getActiveUnkickedValidatorStructsAndCounts,
      ...contractData.Staking.events,
    ],
    client: { public: publicClientForContract },
  });

  const priceFeed = getContract({
    address: contractData.PriceFeed.address,
    abi: [
      contractData.PriceFeed.methods.getNodesForRequest,
      ...contractData.PriceFeed.events,
    ],
    client: { public: publicClientForContract },
  });

  const pkpPermissionsContract = getContract({
    address: contractData.PKPPermissions.address,
    abi: [
      contractData.PKPPermissions.methods.addPermittedAction,
      contractData.PKPPermissions.methods.addPermittedAddress,
      contractData.PKPPermissions.methods.addPermittedAuthMethod,
      contractData.PKPPermissions.methods.addPermittedAuthMethodScope,
      contractData.PKPPermissions.methods.getPermittedActions,
      contractData.PKPPermissions.methods.getPermittedAddresses,
      contractData.PKPPermissions.methods.getPermittedAuthMethods,
      contractData.PKPPermissions.methods.getPermittedAuthMethodScopes,
      contractData.PKPPermissions.methods.removePermittedAction,
      contractData.PKPPermissions.methods.removePermittedAddress,
      contractData.PKPPermissions.methods.removePermittedAuthMethod,
      contractData.PKPPermissions.methods.removePermittedAuthMethodScope,
      contractData.PKPPermissions.methods.isPermittedAction,
      contractData.PKPPermissions.methods.isPermittedAddress,
      contractData.PKPPermissions.methods.getTokenIdsForAuthMethod,
      ...contractData.PKPPermissions.events,
    ],
    client: { wallet: walletClientForContract },
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
    client: { public: publicClientForContract },
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
    client: { wallet: walletClientForContract },
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
    client: { wallet: walletClientForContract },
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
