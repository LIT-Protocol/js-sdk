import { generateAuthSigWithViem } from '@lit-protocol/auth-helpers';
import {
  AUTH_METHOD_TYPE,
  WrongAccountType,
  WrongParamFormat,
} from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import { AuthMethod, AuthSig } from '@lit-protocol/types';
import { GetWalletClientReturnType } from '@wagmi/core';
import {
  Account,
  getAddress,
  keccak256,
  stringToBytes,
  WalletClient,
} from 'viem';

const _logger = getChildLogger({
  module: 'WalletClientAuthenticator',
});

export const getWalletClientAuthenticator = (params: {
  account: WalletClient;
}) => {
  const _address = params.account.account!.address;

  const _createAuthSig = async (
    account: GetWalletClientReturnType | WalletClient,
    messageToSign: string
  ) => {
    if (!account.signMessage) {
      throw new WrongAccountType(
        {
          cause: account,
        },
        'The provided account does not support signing messages.'
      );
    }
    return await generateAuthSigWithViem({
      account: account,
      toSign: messageToSign,
      address: _address,
    });
  };

  return {
    type: 'walletClient',
    address: _address,
    getAuthSig: async (messageToSign: string) => {
      _logger.info('Generating auth sig for viem account');
      const authSig = await _createAuthSig(params.account, messageToSign);
      return authSig;
    },
    authenticate: async (messageToSign: string) => {
      _logger.info('authenticating with viem account');
      const authSig = await _createAuthSig(params.account, messageToSign);

      const authMethod = {
        authMethodType: AUTH_METHOD_TYPE.EthWallet,
        accessToken: JSON.stringify(authSig),
      };

      return authMethod;
    },
    getAuthMethodId: async (authMethod: AuthMethod) => {
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
      return keccak256(messageBytes);
    },
  };
};
