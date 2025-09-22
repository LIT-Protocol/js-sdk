import { AuthContextSchema2, HexPrefixedSchema } from '@lit-protocol/schemas';
import { SigResponse } from '@lit-protocol/types';
import {
  concatHex,
  createPublicClient,
  hashTypedData,
  Hex,
  http,
  keccak256,
  recoverAddress,
  serializeTransaction,
  toBytes,
  toHex,
  TransactionSerializable,
  type Chain,
  type TypedDataDefinition,
} from 'viem';
import { publicKeyToAddress, toAccount } from 'viem/accounts';

import { getChildLogger } from '@lit-protocol/logger';

const _logger = getChildLogger({
  module: 'createPkpViemAccount',
});

export async function createPKPViemAccount({
  pkpPublicKey,
  sign,
  chainConfig,
}: {
  authContext: AuthContextSchema2;
  pkpPublicKey: string;
  sign: (data: any, options?: { bypassAutoHashing?: boolean }) => Promise<Hex>;
  chainConfig?: Chain;
}) {
  const uncompressedPubKey = HexPrefixedSchema.parse(pkpPublicKey) as Hex;

  const address = publicKeyToAddress(uncompressedPubKey);

  _logger.info({ uncompressedPubKey }, 'uncompressedPubKey');
  _logger.info({ address }, 'address');

  const formatSignature = (signature: SigResponse): Hex => {
    const r = `0x${signature.r.padStart(64, '0')}` as Hex;
    const s = `0x${signature.s.padStart(64, '0')}` as Hex;

    // Convert recid to v value (27 + recid for Ethereum)
    const v = toHex(27 + signature.recid) as Hex;

    // Concatenate the components
    return concatHex([r, s, v]) as Hex;
  };

  /**
   * Signs raw bytes with PKP and recovers the correct signature components
   * @param bytesToSign - Raw bytes to sign
   * @param expectedAddress - Expected PKP address for signature validation
   * @returns Signature components (r, s, recoveryId) and full signature hex
   */
  const signAndRecover = async (
    bytesToSign: Uint8Array,
    expectedAddress: `0x${string}`
  ): Promise<{
    r: Hex;
    s: Hex;
    recoveryId: number;
    signature: Hex;
  }> => {
    // Pass raw bytes to PKP - PKP will apply keccak256 internally
    const signature = await sign(bytesToSign);
    _logger.info({ signature }, '🔍 Raw signature from PKP:');

    // Parse signature components
    const r = `0x${signature.slice(2, 66).padStart(64, '0')}` as Hex;
    const s = `0x${signature.slice(66, 130).padStart(64, '0')}` as Hex;
    _logger.info({ r }, '🔍 Parsed r:');
    _logger.info({ s }, '🔍 Parsed s:');

    let recovered: string | undefined;
    let recoveryId: number | undefined;

    // PKP applies keccak256 to raw bytes, so we recover using the same hash
    const hashForRecovery = keccak256(bytesToSign);
    _logger.info(
      { hashForRecovery },
      '🔍 Hash for recovery (keccak256 of bytes):'
    );

    for (let recId = 0; recId <= 1; recId++) {
      const v = BigInt(27 + recId);

      const maybe = await recoverAddress({
        hash: hashForRecovery,
        signature: { r, s, v },
      });

      _logger.info(
        {},
        `🔍 Recovery attempt ${recId}: recovered=${maybe}, expected=${expectedAddress}`
      );

      if (maybe.toLowerCase() === expectedAddress.toLowerCase()) {
        recovered = maybe;
        recoveryId = recId;
        break;
      }
    }

    if (recovered === undefined || recoveryId === undefined) {
      throw new Error('Failed to recover address from signature');
    }

    return { r, s, recoveryId, signature };
  };

  /**
   * Populates missing transaction fields by querying the blockchain
   */
  async function populateTxFields({
    tx,
    address,
    chain,
  }: {
    tx: Partial<TransactionSerializable>;
    address: `0x${string}`;
    chain: Chain;
  }): Promise<TransactionSerializable> {
    const client = createPublicClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });

    try {
      if (tx.nonce === undefined) {
        tx.nonce = await client.getTransactionCount({ address });
        _logger.info({ nonce: tx.nonce }, 'viem => nonce:');
      }

      if (tx.chainId === undefined) {
        tx.chainId = await client.getChainId();
        _logger.info({ chainId: tx.chainId }, 'viem => chainId:');
      }

      if (tx.gasPrice === undefined && tx.maxFeePerGas === undefined) {
        // Implement EIP-1559 fee estimation
        const latestBlock = await client.getBlock({ blockTag: 'latest' });
        const baseFeePerGas = latestBlock.baseFeePerGas;

        if (baseFeePerGas) {
          // Network supports EIP-1559
          const priorityFee = 1500000000n; // 1.5 gwei default priority fee
          tx.maxPriorityFeePerGas = priorityFee;
          tx.maxFeePerGas = baseFeePerGas * 2n + priorityFee; // 2x base fee + priority
          tx.type = 'eip1559';
          _logger.info('viem => using EIP-1559 fees');
          _logger.info({ baseFeePerGas }, 'viem => baseFeePerGas:');
          _logger.info(
            { maxPriorityFeePerGas: tx.maxPriorityFeePerGas },
            'viem => maxPriorityFeePerGas:'
          );
          _logger.info(
            { maxFeePerGas: tx.maxFeePerGas },
            'viem => maxFeePerGas:'
          );
        } else {
          // Fallback to legacy for networks that don't support EIP-1559
          tx.gasPrice = await client.getGasPrice();
          tx.type = 'legacy';
          _logger.info(
            { gasPrice: tx.gasPrice },
            'viem => using legacy gasPrice:'
          );
        }
      }

      if (tx.gas === undefined) {
        // Simple gas estimation for basic transactions
        try {
          const gasEstimate = await client.estimateGas({
            account: address,
            to: tx.to as `0x${string}`,
            value: tx.value || 0n,
            data: tx.data,
          } as any);
          tx.gas = gasEstimate;
          _logger.info({ gas: tx.gas }, 'viem => gas:');
        } catch (gasError) {
          _logger.warn(
            { gasError },
            'viem => gas estimation failed, using default:'
          );
          tx.gas = 21000n; // Default gas for simple transfers
        }
      }

      return tx as TransactionSerializable;
    } catch (err) {
      console.error('viem => failed to populate tx fields:', err);
      throw err;
    }
  }

  return toAccount({
    address,
    async signMessage({ message }) {
      // Pass raw message bytes to PKP - let the LitMessageSchema handle keccak256 hashing
      let messageBytes: Uint8Array;
      if (typeof message === 'string') {
        messageBytes = new TextEncoder().encode(message);
      } else {
        // For non-string messages, convert to bytes
        const messageStr =
          typeof message === 'object' && 'raw' in message
            ? message.raw
            : message;
        messageBytes = toBytes(messageStr as any);
      }

      const expectedAddress = publicKeyToAddress(uncompressedPubKey);

      const { r, s, recoveryId, signature } = await signAndRecover(
        messageBytes,
        expectedAddress
      );

      // Construct SigResponse object
      const sigResponse: SigResponse = {
        r: r.slice(2), // Remove 0x prefix
        s: s.slice(2), // Remove 0x prefix
        recid: recoveryId,
        signature: signature,
        publicKey: uncompressedPubKey.slice(2), // Remove 0x prefix
        dataSigned: toHex(messageBytes), // Raw message bytes that were signed
      };

      return formatSignature(sigResponse);
    },
    async signTransaction(txRequest: TransactionSerializable) {
      // Populate missing transaction fields if chainConfig is provided
      let populatedTx = txRequest;

      if (chainConfig) {
        populatedTx = await populateTxFields({
          tx: txRequest,
          address,
          chain: chainConfig,
        });
      } else {
        // Ensure minimum required fields for transaction type inference
        populatedTx = { ...txRequest };

        // If no gas price fields are set, default to legacy transaction with gasPrice
        if (!populatedTx.gasPrice && !populatedTx.maxFeePerGas) {
          // Default to EIP-1559 with reasonable estimates
          const priorityFee = 1500000000n; // 1.5 gwei default priority fee
          const baseFeeEstimate = 15000000000n; // 15 gwei base fee estimate

          populatedTx.maxPriorityFeePerGas = priorityFee;
          populatedTx.maxFeePerGas = baseFeeEstimate * 2n + priorityFee; // Conservative estimate
          populatedTx.type = 'eip1559';

          console.log('viem => defaulting to EIP-1559 fees');
          console.log(
            'viem => maxPriorityFeePerGas:',
            populatedTx.maxPriorityFeePerGas
          );
          console.log('viem => maxFeePerGas:', populatedTx.maxFeePerGas);
        }

        // Set default gas if not provided
        if (!populatedTx.gas) {
          populatedTx.gas = 21000n; // Default gas for simple transfers
          console.log('viem => defaulting gas to 21000');
        }

        // Ensure type is set for clarity
        if (!populatedTx.type) {
          if (populatedTx.maxFeePerGas || populatedTx.maxPriorityFeePerGas) {
            populatedTx.type = 'eip1559';
          } else if (populatedTx.gasPrice) {
            populatedTx.type = 'legacy';
          }
        }
      }

      // Serialize the unsigned transaction to get raw bytes for PKP signing
      const unsignedTxSerialized = serializeTransaction(populatedTx);
      const txBytes = toBytes(unsignedTxSerialized);

      const expectedAddress = publicKeyToAddress(uncompressedPubKey);

      const {
        r: txR,
        s: txS,
        recoveryId: txRecoveryId,
        signature: txSignature,
      } = await signAndRecover(txBytes, expectedAddress);

      // Convert recovery ID to v value for transaction
      const v = BigInt(27 + txRecoveryId);

      return serializeTransaction(populatedTx, { r: txR, s: txS, v });
    },

    /**
     * Signs EIP-712 typed data using PKP
     *
     * @param typedData - The EIP-712 typed data definition
     * @returns Hex-encoded signature
     */
    async signTypedData<
      const typedData extends Record<string, unknown>,
      primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData
    >(typedData: TypedDataDefinition<typedData, primaryType>) {
      // Compute the EIP-712 hash
      const digestHex = hashTypedData(typedData);
      const digestBytes = toBytes(digestHex);

      // Use the bypass option to skip LitMessageSchema transformation
      const signature = await sign(digestBytes, { bypassAutoHashing: true });
      _logger.info({ signature }, '🔍 Raw signature from PKP (EIP-712):');

      // Parse signature components
      const r = `0x${signature.slice(2, 66).padStart(64, '0')}` as Hex;
      const s = `0x${signature.slice(66, 130).padStart(64, '0')}` as Hex;
      _logger.info({ r }, '🔍 Parsed r:');
      _logger.info({ s }, '🔍 Parsed s:');

      // Find recovery ID by testing both possibilities
      let recoveryId: number | undefined;
      for (let recId = 0; recId <= 1; recId++) {
        const v = BigInt(27 + recId);

        try {
          const maybe = await recoverAddress({
            hash: digestHex,
            signature: { r, s, v },
          });

          _logger.info(
            `🔍 Recovery attempt ${recId}: recovered=${maybe}, expected=${address}`
          );

          if (maybe.toLowerCase() === address.toLowerCase()) {
            recoveryId = recId;
            break;
          }
        } catch (e) {
          _logger.info({ e }, `🔍 Recovery failed for recId ${recId}:`);
        }
      }

      if (recoveryId === undefined) {
        throw new Error('Failed to recover address from EIP-712 signature');
      }

      const vValue = toHex(27 + recoveryId) as Hex;
      return concatHex([r, s, vValue]) as Hex;
    },
  });
}
