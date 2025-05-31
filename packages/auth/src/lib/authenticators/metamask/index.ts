import { WrongParamFormat } from '@lit-protocol/constants';
import { AuthMethod } from '@lit-protocol/types';
import { ethers } from 'ethers';

export async function ethAuthMethodId(authMethod: AuthMethod): Promise<string> {
  let address: string;

  try {
    address = JSON.parse(authMethod.accessToken).address;
  } catch (err) {
    throw new WrongParamFormat(
      {
        info: {
          authMethod,
        },
        cause: err,
      },
      'Error when parsing auth method to generate auth method ID for Eth wallet'
    );
  }

  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${address}:lit`));
}
