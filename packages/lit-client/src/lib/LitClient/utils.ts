import { CustomAuthData } from '@lit-protocol/schemas';
import { hexToBigInt, keccak256, toBytes } from 'viem';

export const utils = {
  generateUniqueAuthMethodType: ({
    uniqueDappName,
  }: {
    uniqueDappName: string;
  }) => {
    const hex = keccak256(toBytes(uniqueDappName));
    const bigint = hexToBigInt(hex);

    return {
      hex,
      bigint,
    };
  },

  /**
   * Generates authentication data for a user within a specific dApp context.
   * Creates a unique auth method ID by hashing the combination of dApp name and user ID.
   *
   * @param params - The authentication data generation parameters
   * @param params.uniqueDappName - The unique name identifier for the dApp
   * @param params.uniqueAuthMethodType - The unique authentication method type (typically generated from generateUniqueAuthMethodType)
   * @param params.userId - The unique identifier for the user
   * @returns An object containing the auth method type and a unique auth method ID
   * @returns authMethodType - The authentication method type passed in
   * @returns authMethodId - A keccak256 hash of the combined dApp name and user ID
   *
   * @see https://v8-interactive-docs.getlit.dev/custom-auth For more information about custom authentication methods
   *
   * @example
   * ```typescript
   * const authMethodConfig = litUtils.generateUniqueAuthMethodType({
   *   uniqueDappName: 'web3-ecosystem-jawoot'
   * });
   *
   * const authData = litUtils.generateAuthData({
   *   uniqueDappName: 'web3-ecosystem-jawoot',
   *   uniqueAuthMethodType: authMethodConfig.bigint,
   *   userId: 'user123'
   * });
   *
   * console.log(authData);
   * // {
   * //   authMethodType: 12345678901234567890n,
   * //   authMethodId: '0x...'
   * // }
   * ```
   */
  generateAuthData: ({
    uniqueDappName,
    uniqueAuthMethodType,
    userId,
  }: {
    uniqueDappName: string;
    uniqueAuthMethodType: bigint;
    userId: string;
  }): CustomAuthData => {
    const uniqueUserId = `${uniqueDappName}-${userId}`;

    return {
      authMethodType: uniqueAuthMethodType,
      authMethodId: keccak256(toBytes(uniqueUserId)),
    };
  },
};
