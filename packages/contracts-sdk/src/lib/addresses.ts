import * as bitcoinjs from 'bitcoinjs-lib';
import { Contract, ethers } from 'ethers';
import { computeAddress } from 'ethers/lib/utils';
import { pkpNft } from '../abis/PKPNFT.data';
import { toBech32 } from '@cosmjs/encoding';
import { Secp256k1 } from '@cosmjs/crypto';

import { rawSecp256k1PubkeyToRawAddress } from '@cosmjs/amino';
export type TokenInfo = {
  tokenId: string;
  publicKey: string;
  publicKeyBuffer: Buffer;
  ethAddress: string;
  btcAddress: string;
  cosmosAddress: string;
  isNewPKP: boolean;
};

export const addresses = async ({
  publicKey,
  pkpTokenId,
  pkpContractAddress,
  defaultRPCUrl,
  options = {
    cacheContractCall: false,
  },
}: {
  publicKey?: string;
  pkpTokenId?: string;
  pkpContractAddress?: string;
  defaultRPCUrl?: string;
  options?: {
    cacheContractCall?: boolean;
  };
}): Promise<TokenInfo | any> => {
  let pubkeyBuffer: Buffer;

  // one of the two must be provided
  if (!publicKey && !pkpTokenId) {
    throw new Error('publicKey or pkpTokenId must be provided');
  }

  // if pkp contract address is not provided, use the default one 0xF5cB699652cED3781Dd75575EDBe075d6212DF98
  if (!pkpContractAddress) {
    pkpContractAddress = pkpNft.address;
  }

  // if default RPC url is not provided, use the default one https://endpoints.omniatech.io/v1/matic/mumbai/public
  if (!defaultRPCUrl) {
    defaultRPCUrl = 'https://chain-rpc.litprotocol.com/http';
  }

  // if pkpTokenId is provided, get the public key from it

  let isNewPKP = false;

  if (pkpTokenId) {
    // try to get the public key from 'lit-cached-pkps' local storage
    const CACHE_KEY = 'lit-cached-pkps';
    try {
      const cachedPkp = localStorage.getItem(CACHE_KEY);
      if (cachedPkp) {
        const cachedPkpJSON = JSON.parse(cachedPkp);
        if (cachedPkpJSON[pkpTokenId]) {
          publicKey = cachedPkpJSON[pkpTokenId];
        } else {
          const provider = new ethers.providers.JsonRpcProvider(defaultRPCUrl);

          const contract = new Contract(
            pkpContractAddress,
            ['function getPubkey(uint256 tokenId) view returns (bytes memory)'],
            provider
          );

          publicKey = await contract['getPubkey'](pkpTokenId);
          isNewPKP = true;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // trying to store key value pair in local storage
    if (options.cacheContractCall) {
      try {
        const cachedPkp = localStorage.getItem(CACHE_KEY);
        if (cachedPkp) {
          const cachedPkpJSON = JSON.parse(cachedPkp);
          cachedPkpJSON[pkpTokenId] = publicKey;
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachedPkpJSON));
        } else {
          const cachedPkpJSON: { [key: string]: any } = {};
          cachedPkpJSON[pkpTokenId] = publicKey;
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachedPkpJSON));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (publicKey === undefined) {
    console.warn('publicKey is undefined');
  }

  // if publicKey is provided, validate it
  if (!publicKey) {
    console.warn('publicKey or pubkeyBuffer is undefined');
    // throw new Error("publicKey or pubkeyBuffer is undefined");
    return;
  }

  if (publicKey.startsWith('0x')) {
    publicKey = publicKey.slice(2);
  }
  pubkeyBuffer = Buffer.from(publicKey, 'hex');

  // get the address from the public key
  const ethAddress = computeAddress(pubkeyBuffer);

  // get the btc address from the public key
  const btcAddress = bitcoinjs.payments.p2pkh({
    pubkey: pubkeyBuffer,
  }).address;

  if (!btcAddress || !ethAddress) {
    // push to error reporting service
    const errors = [];

    // if (!pkpTokenId) {
    //   errors.push("pkpTokenId is undefined");
    // }

    if (!btcAddress) {
      errors.push('btcAddress is undefined');
    }

    if (!ethAddress) {
      errors.push('ethAddress is undefined');
    }

    throw new Error(errors.join(', '));
  }

  // https://docs.cosmos.network/main/spec/addresses/bech32
  // To covert between other binary representation of addresses and keys,
  // it is important to first apply the Amino encoding process before Bech32 encoding.
  // PubKeySecp256k1	tendermint/PubKeySecp256k1	0xEB5AE987	0x21
  // https://github.com/tendermint/tendermint/blob/d419fffe18531317c28c29a292ad7d253f6cafdf/docs/spec/blockchain/encoding.md#public-key-cryptography
  function getCosmosAddress(pubkeyBuffer: Buffer) {
    return toBech32(
      'cosmos',
      rawSecp256k1PubkeyToRawAddress(Secp256k1.compressPubkey(pubkeyBuffer))
    );
  }

  // get cosmos address from the public key
  const cosmosAddress = getCosmosAddress(pubkeyBuffer);

  return {
    tokenId: pkpTokenId,
    publicKey: `0x${publicKey}`,
    publicKeyBuffer: pubkeyBuffer,
    ethAddress,
    btcAddress,
    cosmosAddress,
    isNewPKP,
  };
};
