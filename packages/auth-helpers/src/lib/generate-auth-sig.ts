import { ethers } from 'ethers';

import { InvalidArgumentException } from '@lit-protocol/constants';
import { AuthSig, SignerLike } from '@lit-protocol/types';
import { Account, getAddress, Hex, WalletClient } from 'viem';
import { GetWalletClientReturnType } from '@wagmi/core';

type ExpectedAccountOrWalletClient =
  | Account
  | WalletClient
  | GetWalletClientReturnType;

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
  signer:
    | ethers.Wallet
    | ethers.Signer
    | SignerLike
    | {
        signMessage: (message: any) => Promise<string>;
        getAddress?: () => Promise<string>;
      };
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
    address = await (
      signer as { getAddress: () => Promise<string> }
    ).getAddress();
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

export const generateAuthSigWithViem = async ({
  account,
  toSign,
  algo,
  address,
}: {
  account: ExpectedAccountOrWalletClient;
  toSign: string | Hex;
  algo?: 'ed25519';
  address: string;
}): Promise<AuthSig> => {
  if (typeof account.signMessage !== 'function') {
    throw new InvalidArgumentException(
      { info: { account, algo } },
      'account does not have a signMessage method'
    );
  }

  // @ts-ignore - TODO: fix this.
  const signature = await account.signMessage({ message: toSign });
  // const _address = address || getAddress(account.address);
  if (!address) {
    throw new InvalidArgumentException(
      { info: { account, address, algo } },
      'address is required'
    );
  }

  return {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: toSign,
    address,
    ...(algo && { algo }),
  };

  // if ('account' in account && account.account?.type === 'json-rpc') {
  //   const walletClient = account as WalletClient;
  //   const signature = await walletClient.signMessage({ message: toSign, account: walletClient.account! });
  //   const address = getAddress(walletClient.account!.address);
  //   console.log("xxx address:", address);

  //   if (!address) {
  //     throw new InvalidArgumentException(
  //       { info: { account, address, algo } },
  //       'address is required'
  //     );
  //   }

  //   return {
  //     sig: signature,
  //     derivedVia: 'web3.eth.personal.sign',
  //     signedMessage: toSign,
  //     address,
  //     ...(algo && { algo }),
  //   };

  // } else {

  // }
};
