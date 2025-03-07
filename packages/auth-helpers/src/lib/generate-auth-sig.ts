import { ethers } from 'ethers';

import { InvalidArgumentException } from '@lit-protocol/constants';
import { AuthSig, SignerLike } from '@lit-protocol/types';

/**
 * Generate an AuthSig object using the signer.
 *
 * For more context:
 * We are only using authSig to generate session sigs. In a newer version, we will stop accepting
 * authSig all together from the node and will only accept session sigs. The address being
 * used here will be checksummed.
 *
 * @param signer the signer must have a "signMessage" method
 * @param toSign - the message to sign
 * @param address - (optional) the address of the signer
 * @returns
 */
export const generateAuthSig = async ({
  signer,
  toSign,
  address,
  algo,
}: {
  signer: ethers.Wallet | ethers.Signer | SignerLike;
  toSign: string;
  address?: string;
  algo?: 'ed25519';
}): Promise<AuthSig> => {
  if (!signer?.signMessage) {
    throw new InvalidArgumentException(
      {
        info: {
          signer,
          address,
          algo,
        },
      },
      'signer does not have a signMessage method'
    );
  }

  const signature = await signer.signMessage(toSign);

  // If address is not provided, derive it from the signer
  if (!address) {
    address = await signer.getAddress();
  }

  // checksum the address
  address = ethers.utils.getAddress(address);

  // If address is still not available, throw an error
  if (!address) {
    throw new InvalidArgumentException(
      {
        info: {
          signer,
          address,
          algo,
        },
      },
      'address is required'
    );
  }

  return {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: toSign,
    address: address,
    ...(algo && { algo }),
  };
};
