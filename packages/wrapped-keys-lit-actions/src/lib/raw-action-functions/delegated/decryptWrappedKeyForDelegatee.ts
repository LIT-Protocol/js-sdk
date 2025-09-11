import {
  getClient,
  type ValidateAbilityExecutionAndGetPoliciesResult,
} from '@lit-protocol/vincent-contracts-sdk';

import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';

export interface DecryptWrappedKeyForDelegateeParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
  agentWalletPkpEthAddress: string;
  abilityIpfsCid: string;
}

/**
 * Decrypts a wrapped key for a delegatee after validating permissions through Vincent Registry.
 * This function should only be called as a child Lit Action from a Vincent Ability.
 *
 * @param {object} params
 * @param {string} params.accessControlConditions - The delegated wrapped key access control conditions for decryption
 * @param {string} params.ciphertext - Ciphertext of the encrypted wrapped key
 * @param {string} params.dataToEncryptHash - DataToEncryptHash of the encrypted wrapped key
 * @param {string} params.agentWalletPkpEthAddress - The ETH address of the agent wallet that owns the wrapped key
 * @param {string} params.abilityIpfsCid - The IPFS CID of the vincent ability that making the wrapped key decryption request
 *
 * @returns { Promise<string> } - Returns a decrypted private key if validation passes
 */
export async function decryptWrappedKeyForDelegatee({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  agentWalletPkpEthAddress,
  abilityIpfsCid,
}: DecryptWrappedKeyForDelegateeParams): Promise<string> {
  const appDelegateeAddress = Lit.Auth.authSigAddress;

  const signer = ethers.Wallet.createRandom().connect(
    new ethers.providers.StaticJsonRpcProvider(
      await Lit.Actions.getRpcUrl({ chain: 'yellowstone' })
    )
  );

  const contractClient = getClient({
    signer,
  });

  const validationResult: ValidateAbilityExecutionAndGetPoliciesResult =
    await contractClient.validateAbilityExecutionAndGetPolicies({
      delegateeAddress: appDelegateeAddress,
      pkpEthAddress: agentWalletPkpEthAddress,
      abilityIpfsCid,
    });

  if (!validationResult.isPermitted) {
    throw new Error(
      `App Delegatee: ${appDelegateeAddress} is not permitted to execute Vincent Ability: ${abilityIpfsCid} for App ID: ${validationResult.appId} App Version: ${validationResult.appVersion} using Agent Wallet PKP Address: ${agentWalletPkpEthAddress}`
    );
  }

  return getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });
}
