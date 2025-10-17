import {
  createSiweMessage,
  generateAuthSigWithViem,
} from '@lit-protocol/auth-helpers';
import {
  AUTH_METHOD_TYPE,
  WrongAccountType,
  WrongParamFormat,
} from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import { AuthData } from '@lit-protocol/schemas';
import {
  AuthMethod,
  AuthSig,
  BaseSiweMessage,
} from '@lit-protocol/types';
import { GetWalletClientReturnType } from '@wagmi/core';
import { getAddress, Hex, keccak256, stringToBytes, WalletClient } from 'viem';
import { fetchBlockchainData } from './helper/fetchBlockchainData';

const _logger = getChildLogger({
  module: 'WalletClientAuthenticator',
});

export type WalletClientAuthenticateOverrides = Partial<
  Omit<BaseSiweMessage, 'walletAddress' | 'nonce'>
>;

export class WalletClientAuthenticator {
  public readonly type = 'walletClient';

  static async createAuthSig(
    account: GetWalletClientReturnType | WalletClient,
    messageToSign: string
  ): Promise<AuthSig> {
    if (!account.signMessage) {
      throw new WrongAccountType(
        {
          cause: account,
        },
        'The provided account does not support signing messages.'
      );
    }
    // Derive address directly from the account passed to the static method
    const address = account.account!.address;
    return await generateAuthSigWithViem({
      account: account,
      toSign: messageToSign,
      address: address, // Use derived address
    });
  }

  /**
   * Generate an AuthSig for the connected wallet. Provide a full message to sign via `messageToSign`,
   * or let the helper build one while overriding specific SIWE fields with `siweMessageOverrides`.
   */
  static async authenticate(
    account: GetWalletClientReturnType | WalletClient,
    messageToSign?: string,
    siweMessageOverrides?: WalletClientAuthenticateOverrides
  ): Promise<AuthData> {
    let _toSign = messageToSign;

    if (!_toSign) {
      const restOverrides = siweMessageOverrides ?? {};

      const nonce = await fetchBlockchainData();

      const siweParams: BaseSiweMessage = {
        walletAddress: account.account!.address,
        nonce,
        ...restOverrides,
      };

      _toSign = await createSiweMessage({
        ...siweParams,
      });
    }

    _logger.info('Authenticating with wallet client (static)');
    const authSig = await WalletClientAuthenticator.createAuthSig(
      account,
      _toSign
    );

    const authMethod: AuthMethod = {
      authMethodType: AUTH_METHOD_TYPE.EthWallet,
      accessToken: JSON.stringify(authSig),
    };

    const authMethodId = await WalletClientAuthenticator.authMethodId(
      authMethod
    );

    const authData: AuthData = {
      ...authMethod,
      authMethodId,
    };

    return authData;
  }

  public static async authMethodId(authMethod: AuthMethod): Promise<Hex> {
    _logger.info('Generating auth method ID for viem account');
    let address: string;

    try {
      const authSig: AuthSig = JSON.parse(authMethod.accessToken);
      if (!authSig.address) {
        throw new Error('Address not found in AuthSig.');
      }
      address = authSig.address;
    } catch (err) {
      throw new WrongParamFormat(
        {
          info: { authMethod },
          cause: err,
        },
        'Error when parsing auth method to generate auth method ID. Expected accessToken to be a JSON string of AuthSig.'
      );
    }

    const checksumAddress = getAddress(address);
    const messageBytes = stringToBytes(`${checksumAddress}:lit`);
    return keccak256(messageBytes) as Hex;
  }
}
