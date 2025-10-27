// List of methods to extract signatures for
export const METHODS_TO_EXTRACT = [
  // Permissions Read:
  'PKPPermissions.getPermittedActions',
  'PKPPermissions.getPermittedAddresses',
  'PKPPermissions.isPermittedAction',
  'PKPPermissions.isPermittedAddress',
  'PKPPermissions.getPermittedAuthMethods',
  'PKPPermissions.getPermittedAuthMethodScopes',

  // Permissions Write:
  'PKPPermissions.addPermittedAction',
  'PKPPermissions.addPermittedAddress',
  'PKPPermissions.addPermittedAuthMethodScope',
  'PKPPermissions.addPermittedAuthMethod',
  'PKPPermissions.removePermittedAction',
  'PKPPermissions.removePermittedAddress',
  'PKPPermissions.removePermittedAuthMethod',
  'PKPPermissions.removePermittedAuthMethodScope',
  'PKPPermissions.getTokenIdsForAuthMethod',

  // PKP Read:
  'PKPNFT.tokenOfOwnerByIndex',
  'PKPNFT.mintCost',

  // PKP Write:
  'PKPNFT.safeTransferFrom',
  'PKPNFT.mintNext',
  'PKPNFT.claimAndMint',
  'PKPHelper.claimAndMintNextAndAddAuthMethodsWithTypes',
  'PKPHelper.mintNextAndAddAuthMethods',

  // Staking:
  'Staking.getActiveUnkickedValidatorStructsAndCounts',

  // PriceFeed:
  'PriceFeed.getNodesForRequest',

  'PubkeyRouter.deriveEthAddressFromPubkey',
  'PubkeyRouter.ethAddressToPkpId',
  'PubkeyRouter.getPubkey',
  'PubkeyRouter.getEthAddress',
  'PubkeyRouter.getDerivedPubkey',

  // Ledger:
  'Ledger.deposit',
  'Ledger.depositForUser',
  'Ledger.balance',
  'Ledger.stableBalance',
  'Ledger.requestWithdraw',
  'Ledger.latestWithdrawRequest',
  'Ledger.userWithdrawDelay',
  'Ledger.withdraw',

  // Payment Delegation:
  'PaymentDelegation.getPayersAndRestrictions',
  'PaymentDelegation.getUsers',
  'PaymentDelegation.getRestriction',
  'PaymentDelegation.getPayers',
  'PaymentDelegation.delegatePayments',
  'PaymentDelegation.undelegatePayments',
  'PaymentDelegation.delegatePaymentsBatch',
  'PaymentDelegation.undelegatePaymentsBatch',
  'PaymentDelegation.setRestriction',
] as const;

// Type for contract names
export type ContractName =
  | 'PKPPermissions'
  | 'PKPNFT'
  | 'PKPHelper'
  | 'Staking'
  | 'PubkeyRouter';

// Helper type to extract method name from "ContractName.methodName" format
export type ExtractMethodName<T extends string> =
  T extends `${ContractName}.${infer Method}` ? Method : never;
