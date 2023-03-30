//
// Integrated from https://github.com/LIT-Protocol/lit-pkp-sdk/blob/main/examples/signTypedData.mjs
//

import { joinSignature } from '@ethersproject/bytes';
import { typedSignatureHash } from '@metamask/eth-sig-util';

// import { convertHexToUtf8, getTransactionToSign } from './helper';
import {
  ExternallyOwnedAccount,
  Signer,
  TypedDataDomain,
  TypedDataField,
  TypedDataSigner,
} from '@ethersproject/abstract-signer';
import { PKPEthersWallet } from './pkp-ethers';
import {
  EIP712TypedData,
  ETHHandlerReq,
  ETHHandlerRes,
  ETHRequestHandler,
  ETHSignature,
  LitTypeDataSigner,
  UnknownETHMethod,
} from './pkp-ethers-types';
import { ethers } from 'ethers';

/**
 * Signs an EIP-712 typed data object or a JSON string representation of the typed data object.
 *
 * @param {LitTypeDataSigner} signer - An instance of a LitTypeDataSigner, which is used for signing the typed data.
 * @param {T | string} msgParams - An EIP-712 typed data object that extends EIP712TypedData, or a JSON string representation of the typed data object.
 * @returns {Promise<string>} A promise that resolves to the signature of the typed data object.
 *
 * @template T - A generic type that extends the EIP712TypedData interface.
 *
 * @example
 * const signer = ... // Instance of a LitTypeDataSigner
 * const msgParams = ... // EIP-712 typed data object or its JSON string representation
 * const signature = await signTypedData(signer, msgParams);
 */
export const signTypedData = async <T extends EIP712TypedData>(
  signer: LitTypeDataSigner,
  msgParams: T | string
): Promise<ETHSignature> => {
  if (typeof msgParams === 'string') {
    msgParams = JSON.parse(msgParams);
  }

  const { types, domain, primaryType, message } = msgParams as T;

  if (types['EIP712Domain']) {
    delete types['EIP712Domain'];
  }

  const signature = await signer._signTypedData(domain, types, message);
  return signature;
};

export const signTypedDataHandler: ETHRequestHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHHandlerRes> => {
  // -- validate
  if (!signer || !payload) {
    throw new Error(`signer or payload is not defined`);
  }

  let addressRequested: string;
  let address = (signer as PKPEthersWallet).address;
  let msgParams: EIP712TypedData | string;
  let signature: ETHSignature = '';

  if (ethers.utils.isAddress(payload.params[0])) {
    // V3 or V4
    addressRequested = payload.params[0];

    if (address.toLowerCase() !== addressRequested.toLowerCase()) {
      throw new Error('PKPWallet address does not match address requested');
    }
    msgParams = payload.params[1];
    signature = await signTypedData(signer, msgParams);
  }

  if (signature === '') {
    throw new Error('signTypedDataHandler failed to sign');
  }

  return { signature };
};

/**
 * An object mapping Ethereum JSON-RPC signing methods to their respective
 * request handlers. The request handlers take an ETHHandlerReq object
 * as input and return a promise that resolves to the signature result.
 * Currently supported methods:
 * eth_signTypedData
 * @type {{ eth_signTypedData: ETHRequestHandler;} & UnknownETHMethod}
 */
export const methodHandlers: {
  eth_signTypedData: ETHRequestHandler;
} & UnknownETHMethod = {
  eth_signTypedData: signTypedDataHandler,
};

/**
 * Handles Ethereum JSON-RPC signing requests by dispatching them to the appropriate
 * signing function based on the provided method.
 *
 * @param {ETHHandlerReq} params - The request parameters, including the signer and the payload.
 * @param {LitTypeDataSigner} params.signer - The signer instance used for signing.
 * @param {ETHRequestSigningPayload} params.payload - The payload containing the method and necessary data.
 * @returns {Promise<ETHSignature>} A promise that resolves to the signature result.
 * @throws {Error} If the provided method is not supported or if an error occurs during signing.
 */
export const requestHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHSignature> => {
  // -- validate if method exists
  if (!methodHandlers.hasOwnProperty(payload.method)) {
    throw new Error(
      `Ethereum JSON-RPC signing method "${payload.method}" is not supported`
    );
  }

  // -- run found function
  const fn = methodHandlers[payload.method] as ETHRequestHandler;

  try {
    const data: ETHHandlerRes = await fn({ signer, payload });
    const sig: ETHSignature = data.signature;
    return sig;
  } catch (e: any) {
    throw new Error(e);
  }
};
