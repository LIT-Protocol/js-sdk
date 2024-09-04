import {
  InvalidArgumentException,
  MultiError,
  NoWalletException,
  ParamsMissingError,
} from '@lit-protocol/constants';
import { bech32 } from 'bech32';
import bs58 from 'bs58';
import { createHash } from 'crypto';
import { Contract, ethers } from 'ethers';
import { computeAddress } from 'ethers/lib/utils';
import { publicKeyConvert } from 'secp256k1';

import { PKPNFTData } from '../abis/PKPNFT.sol/PKPNFTData';

export interface TokenInfo {
  tokenId: string;
  publicKey: string;
  publicKeyBuffer: Buffer;
  ethAddress: string;
  btcAddress: string;
  cosmosAddress: string;
  isNewPKP: boolean;
}

/**
 * Derives a Bitcoin address (P2PKH) from a public key.
 *
 * @param ethPubKey - Public key as a hex string (uncompressed or compressed)
 * @returns Bitcoin address as a Base58Check string
 */
function deriveBitcoinAddress(ethPubKey: string): string {
  // Remove the "0x" prefix if it exists and convert to a Buffer
  if (ethPubKey.startsWith('0x')) {
    ethPubKey = ethPubKey.slice(2);
  }

  const pubkeyBuffer = Buffer.from(ethPubKey, 'hex');

  // Perform SHA-256 hashing on the public key
  const sha256Hash = createHash('sha256').update(pubkeyBuffer).digest();

  // Perform RIPEMD-160 hashing on the result of SHA-256
  const ripemd160Hash = createHash('ripemd160').update(sha256Hash).digest();

  // Add version byte in front of RIPEMD-160 hash (0x00 for mainnet)
  const versionedPayload = Buffer.concat([Buffer.from([0x00]), ripemd160Hash]);

  // Create a checksum by hashing the versioned payload twice with SHA-256
  const checksum = createHash('sha256')
    .update(createHash('sha256').update(versionedPayload).digest())
    .digest()
    .slice(0, 4);

  // Concatenate the versioned payload and the checksum
  const binaryBitcoinAddress = Buffer.concat([versionedPayload, checksum]);

  // Encode the result with Base58 to get the final Bitcoin address and return it
  return bs58.encode(binaryBitcoinAddress);
}

/**
 * Derives a Cosmos address from an Ethereum public key.
 *
 * @param ethPubKey - Ethereum public key as a hex string (uncompressed, 130 characters long, or compressed, 66 characters long)
 * @param prefix - Cosmos address prefix (e.g., "cosmos")
 * @returns Cosmos address as a Bech32 string
 */
function deriveCosmosAddress(
  ethPubKey: string,
  prefix: string = 'cosmos'
): string {
  let pubKeyBuffer = Buffer.from(ethPubKey, 'hex');

  // If the Ethereum public key is uncompressed (130 characters), compress it
  if (pubKeyBuffer.length === 65 && pubKeyBuffer[0] === 0x04) {
    pubKeyBuffer = Buffer.from(publicKeyConvert(pubKeyBuffer, true));
  }

  // Hash the compressed public key with SHA-256
  const sha256Hash = createHash('sha256').update(pubKeyBuffer).digest();

  // Hash the SHA-256 hash with RIPEMD-160
  const ripemd160Hash = createHash('ripemd160').update(sha256Hash).digest();

  // Encode the RIPEMD-160 hash with Bech32 and return it
  return bech32.encode(prefix, bech32.toWords(ripemd160Hash));
}

/**
 * Derives multiple blockchain addresses (Ethereum, Bitcoin, and Cosmos) from a given uncompressed eth public key
 * or PKP token ID. If a PKP token ID is provided, it retrieves the public key from the PKP contract.
 *
 * @param params - The parameters for deriving addresses.
 * @param params.publicKey - The Ethereum public key as a hex string (optional). If not provided, pkpTokenId must be provided.
 * @param params.pkpTokenId - The PKP token ID (optional). If not provided, publicKey must be provided.
 * @param params.pkpContractAddress - The PKP contract address (optional). If not provided, a default address is used.
 * @param params.defaultRPCUrl - The default RPC URL for connecting to the Ethereum network.
 * @param params.options - Additional options (optional).
 * @param params.options.cacheContractCall - Whether to cache the contract call result in local storage (default: false).
 *
 * @returns A Promise that resolves to an object containing token information:
 *   @property {string} tokenId - The PKP token ID.
 *   @property {string} publicKey - The Ethereum public key as a hex string.
 *   @property {Buffer} publicKeyBuffer - The buffer representation of the public key.
 *   @property {string} ethAddress - The derived Ethereum address.
 *   @property {string} btcAddress - The derived Bitcoin address.
 *   @property {string} cosmosAddress - The derived Cosmos address.
 *   @property {boolean} isNewPKP - Whether a new PKP was created.
 *
 * @throws {InvalidArgumentException} If the defaultRPCUrl is not provided.
 * @throws {ParamsMissingError} If neither publicKey nor pkpTokenId is provided.
 * @throws {MultiError} If any of the derived addresses (btcAddress, ethAddress, cosmosAddress) are undefined.
 */
export const derivedAddresses = async ({
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
  defaultRPCUrl: string;
  options?: {
    cacheContractCall?: boolean;
  };
}): Promise<TokenInfo | any> => {
  if (!defaultRPCUrl) {
    throw new InvalidArgumentException(
      {
        info: {
          defaultRPCUrl,
        },
      },
      'defaultRPCUrl must be provided'
    );
  }

  // one of the two must be provided
  if (!publicKey && !pkpTokenId) {
    throw new ParamsMissingError(
      {
        info: {
          publicKey,
          pkpTokenId,
        },
      },
      'publicKey or pkpTokenId must be provided'
    );
  }

  // if pkp contract address is not provided, use the default one 0xF5cB699652cED3781Dd75575EDBe075d6212DF98
  if (!pkpContractAddress) {
    pkpContractAddress = PKPNFTData.address;
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
          const provider = new ethers.providers.StaticJsonRpcProvider(
            defaultRPCUrl
          );

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
          const cachedPkpJSON: Record<string, any> = {};
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
    return;
  }

  if (publicKey.startsWith('0x')) {
    publicKey = publicKey.slice(2);
  }
  const pubkeyBuffer = Buffer.from(publicKey, 'hex');

  // get the address from the public key
  const ethAddress = computeAddress(pubkeyBuffer);

  // get the btc address from the public key
  const btcAddress = deriveBitcoinAddress(publicKey);

  // get cosmos address from the public key
  const cosmosAddress = deriveCosmosAddress(publicKey);

  if (!btcAddress || !ethAddress || !cosmosAddress) {
    // push to error reporting service
    const errors = [];

    // if (!pkpTokenId) {
    //   errors.push("pkpTokenId is undefined");
    // }

    if (!btcAddress) {
      errors.push(
        new NoWalletException(
          {
            info: {
              publicKey,
            },
          },
          'btcAddress is undefined'
        )
      );
    }

    if (!ethAddress) {
      errors.push(
        new NoWalletException(
          {
            info: {
              publicKey,
            },
          },
          'ethAddress is undefined'
        )
      );
    }

    if (!cosmosAddress) {
      errors.push(
        new NoWalletException(
          {
            info: {
              publicKey,
            },
          },
          'cosmosAddress is undefined'
        )
      );
    }

    throw new MultiError(errors);
  }

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
