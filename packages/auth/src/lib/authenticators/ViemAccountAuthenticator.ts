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
import { AuthMethod, AuthSig, EthBlockhashInfo } from '@lit-protocol/types';
import { Account, getAddress, Hex, keccak256, stringToBytes } from 'viem';

const _logger = getChildLogger({
  module: 'ViemAccountAuthenticator',
});

const fetchBlockchainData = async () => {
  try {
    const resp = await fetch(
      'https://block-indexer.litgateway.com/get_most_recent_valid_block'
    );
    if (!resp.ok) {
      throw new Error(`Primary fetch failed with status: ${resp.status}`); // Or a custom error
    }

    const blockHashBody: EthBlockhashInfo = await resp.json();
    const { blockhash, timestamp } = blockHashBody;

    if (!blockhash || !timestamp) {
      throw new Error('Invalid data from primary blockhash source');
    }

    return blockhash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(String(error));
  }
};

export class ViemAccountAuthenticator {
  public readonly type = 'account';

  static async createAuthSig(
    account: Account,
    messageToSign: string
  ): Promise<AuthSig> {
    _logger.info('Generating auth sig for viem account (static)');
    if (!account.signMessage) {
      throw new WrongAccountType(
        {
          cause: account,
        },
        'The provided account does not support signing messages.'
      );
    }
    // Derive address directly from the account passed to the static method
    const address = account.address;
    return await generateAuthSigWithViem({
      account: account,
      toSign: messageToSign,
      address: address,
    });
  }

  static async authenticate(
    account: Account,
    messageToSign?: string
  ): Promise<AuthData> {
    let _toSign = messageToSign;

    if (!_toSign) {
      _toSign = await createSiweMessage({
        walletAddress: account.address,
        nonce: await fetchBlockchainData(),
      });
    }

    _logger.info('Authenticating with viem account (static)');
    const authSig = await ViemAccountAuthenticator.createAuthSig(
      account,
      _toSign
    );

    const authMethod: AuthMethod = {
      authMethodType: AUTH_METHOD_TYPE.EthWallet,
      accessToken: JSON.stringify(authSig),
    };

    const authMethodId = await ViemAccountAuthenticator.authMethodId(
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
