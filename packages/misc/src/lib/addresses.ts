import {
  MultiError,
  NoWalletException,
  ParamsMissingError,
} from '@lit-protocol/constants';
import { TokenInfo } from '@lit-protocol/types';
import { bech32 } from 'bech32';
import { createHash } from 'crypto';
import { Contract, ethers } from 'ethers';
import { computeAddress } from 'ethers/lib/utils';

/**
 * Converts a public key between compressed and uncompressed formats.
 *
 * @param publicKey - Public key as a Buffer (33 bytes compressed or 65 bytes uncompressed)
 * @param compressed - Boolean flag indicating whether the output should be compressed
 * @returns Converted public key as a Buffer
 */
export function publicKeyConvert(
  publicKey: Buffer,
  compressed: boolean = true
): Buffer {
  if (compressed) {
    // Compress the public key (if it's not already compressed)
    if (publicKey.length === 65 && publicKey[0] === 0x04) {
      const x = publicKey.subarray(1, 33);
      const y = publicKey.subarray(33, 65);
      const prefix = y[y.length - 1] % 2 === 0 ? 0x02 : 0x03;
      return Buffer.concat([Buffer.from([prefix]), x]);
    }
  } else {
    // Decompress the public key
    if (
      publicKey.length === 33 &&
      (publicKey[0] === 0x02 || publicKey[0] === 0x03)
    ) {
      const x = publicKey.subarray(1);
      const y = decompressY(publicKey[0], x);
      return Buffer.concat([Buffer.from([0x04]), x, y]);
    }
  }
  // Return the original if no conversion is needed
  return publicKey;
}

/**
 * Decompresses the y-coordinate of a compressed public key.
 *
 * @param prefix - The first byte of the compressed public key (0x02 or 0x03)
 * @param x - The x-coordinate of the public key
 * @returns The decompressed y-coordinate as a Buffer
 */
function decompressY(prefix: number, x: Buffer): Buffer {
  const p = BigInt(
    '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F'
  );
  const a = BigInt('0');
  const b = BigInt('7');

  const xBigInt = BigInt('0x' + x.toString('hex'));
  const rhs = (xBigInt ** 3n + a * xBigInt + b) % p;
  const yBigInt = modSqrt(rhs, p);

  const isEven = yBigInt % 2n === 0n;
  const y = isEven === (prefix === 0x02) ? yBigInt : p - yBigInt;

  return Buffer.from(y.toString(16).padStart(64, '0'), 'hex');
}

/**
 * Computes the modular square root of a number.
 *
 * @param a - The number to find the square root of
 * @param p - The modulus
 * @returns The square root modulo p
 */
function modSqrt(a: bigint, p: bigint): bigint {
  return a ** ((p + 1n) / 4n) % p;
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
    .subarray(0, 4);

  // Concatenate the versioned payload and the checksum
  const binaryBitcoinAddress = Buffer.concat([versionedPayload, checksum]);

  // Encode the result with Base58 to get the final Bitcoin address and return it
  return ethers.utils.base58.encode(binaryBitcoinAddress);
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

type DerivedAddressesParams =
  | {
      publicKey: string;
      pkpTokenId?: never;
      pkpContractAddress?: never;
      defaultRPCUrl?: never;
      options?: never;
    }
  | {
      publicKey?: never;
      pkpTokenId: string;
      pkpContractAddress: string;
      defaultRPCUrl: string;
      options?: {
        cacheContractCall?: boolean;
      };
    };

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
}: DerivedAddressesParams): Promise<TokenInfo | any> => {
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

  // if pkpTokenId is provided, we must get the public key from it (in cache or from the contract)
  let isNewPKP = false;
  if (pkpTokenId) {
    // try to get the public key from 'lit-cached-pkps' local storage
    const CACHE_KEY = 'lit-cached-pkps';
    let cachedPkpJSON;
    try {
      const cachedPkp = localStorage.getItem(CACHE_KEY);
      if (cachedPkp) {
        cachedPkpJSON = JSON.parse(cachedPkp);
        publicKey = cachedPkpJSON[pkpTokenId];
      }
    } catch (e) {
      console.error(e);
    }

    if (!publicKey) {
      // Could not get the public key from the cache, so we need to get it from the contract
      if (!defaultRPCUrl || !pkpContractAddress) {
        throw new NoWalletException(
          {
            info: {
              publicKey,
              pkpTokenId,
              pkpContractAddress,
              defaultRPCUrl,
            },
          },
          'defaultRPCUrl or pkpContractAddress was not provided'
        );
      }

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

    if (options.cacheContractCall) {
      // trying to store key value pair in local storage
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

  if (!publicKey) {
    throw new NoWalletException(
      {
        info: {
          publicKey,
          pkpTokenId,
          pkpContractAddress,
          defaultRPCUrl,
        },
      },
      'publicKey was not provided or could not be obtained from the pkpTokenId'
    );
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
