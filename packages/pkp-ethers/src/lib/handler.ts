//
// Integrated from https://github.com/LIT-Protocol/lit-pkp-sdk/blob/main/examples/signTypedData.mjs
//

import { joinSignature } from '@ethersproject/bytes';
import { typedSignatureHash } from '@metamask/eth-sig-util';

import { PKPEthersWallet } from './pkp-ethers';
import {
  EIP712TypedData,
  ETHHandlerReq,
  ETHHandlerRes,
  ETHRequestHandler,
  ETHSignature,
  LitTypeDataSigner,
  UnknownETHMethod,
  ETHRequestSigningPayload,
  ETHTxRes,
} from './pkp-ethers-types';
import { ethers } from 'ethers';
import { convertHexToUtf8, getTransactionToSign } from './helper';

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

/**
 *  A utility function for signing EIP-712 typed data using an Ethereum wallet that does not support EIP-712.
 *  @template T - The type of the message parameters.
 *  @param {LitTypeDataSigner} signer - An Ethereum wallet signer that does not support EIP-712.
 *  @param {T | any} msgParams - The parameters of the EIP-712 message.
 *  @throws {Error} Throws an error if the runLitAction function is not found in the signer object.
 *  @returns {Promise<ETHSignature>} - The signature of the message.
 *  This function computes the message hash using the typedSignatureHash function from the eth-sig-util library. It then uses the runLitAction function of the signer object to sign the hash. The function returns the encoded signature.
 */
export const signTypedDataLegacy = async <T>(
  signer: LitTypeDataSigner,
  msgParams: T | any
): Promise<ETHSignature> => {
  // https://github.com/MetaMask/eth-sig-util/blob/9f01c9d7922b717ddda3aa894c38fbba623e8bdf/src/sign-typed-data.ts#L435
  const messageHash = typedSignatureHash(msgParams);

  let sig;

  if ((signer as PKPEthersWallet).runLitAction) {
    let _signer = signer as PKPEthersWallet;
    sig = await _signer.runLitAction(
      ethers.utils.arrayify(messageHash),
      'sig1'
    );
  } else {
    throw new Error(
      `Unabled to runLitAction. This signer is not a PKPEthersWallet`
    );
    // let _signer = signer as Signer;
    // sig = await _signer.signMessage(messageHash);
  }

  const encodedSig = joinSignature({
    r: '0x' + sig.r,
    s: '0x' + sig.s,
    v: sig.recid,
  });

  return encodedSig;
};

/**
 *  Validates if the signerAddress matches the requestAddress. The comparison is done in a case-insensitive manner.
 *  @param {string} signerAddress - The address of the signer.
 *  @param {string} requestAddress - The address of the requester.
 *  @throws {Error} Throws an error if the signerAddress does not match the requestAddress.
 *  @returns {void}
 *  This function can be used to ensure that the signer of a transaction is the same as the requester. It is useful in preventing unauthorized access to sensitive data or assets.
 *  Note: It is assumed that the addresses are in the correct format and have already been validated for length and character set.
 */
export const validateAddressesMatch = (
  signerAddress: string,
  requestAddress: string
) => {
  if (signerAddress.toLowerCase() !== requestAddress.toLowerCase()) {
    throw new Error('PKPWallet address does not match address requested');
  }
};

/**
 * Validate the input signature by checking if it is null, undefined, or an empty string.
 * If the signature is invalid, it throws an error.
 *
 * @param {string} signature - The signature to validate.
 * @throws {Error} If the signature is null, undefined, or an empty string.
 */
export const validateSignature = (signature: string) => {
  if (signature === null || signature === undefined || signature === '') {
    throw new Error('Signature is null or undefined');
  }
};

/**
 * Returns an object with version info based on isAddress boolean value.
 * If true, returns version 3 or 4 data properties.
 * If false, returns version 1 data properties.
 * @param { ETHRequestSigningPayload } payload
 */
export function getTypedDataVersionInfo({ signer, payload }: ETHHandlerReq) {
  if (!payload.params[0]) {
    throw new Error(`signTypedDataHandler: payload.params[0] is not defined`);
  }

  const ethersIsAddress = ethers.utils.isAddress(payload.params[0]);

  let info;

  if (ethersIsAddress) {
    info = {
      logMessage: 'RUNNING VERSION 3 or 4',
      addressIndex: 0,
      msgParamsIndex: 1,
      signTypedDataFn: signTypedData,
    };
  } else {
    info = {
      logMessage: 'RUNNING VERSION 1',
      addressIndex: 1,
      msgParamsIndex: 0,
      signTypedDataFn: signTypedDataLegacy,
    };
  }

  let addressRequested: string = payload.params[info.addressIndex];
  validateAddressesMatch((signer as PKPEthersWallet).address, addressRequested);
  let msgParams = payload.params[info.msgParamsIndex];

  return { addressRequested, msgParams, info };
}

/**
 *  An ETHRequestHandler function that signs EIP-712 typed data using an Ethereum wallet.
 *  @param {ETHHandlerReq} params - An object containing the signer and payload.
 *  @throws {Error} Throws an error if the signer or payload is not defined, or if the validation of the signer and requester addresses fails.
 *  @returns {Promise<ETHHandlerRes>} - An object containing the signature.
 *  This function validates the signer and payload, then determines the version of the EIP-712 message being signed. It then uses the appropriate method to sign the message and returns the signature. The function can handle both V1 and V3/V4 versions of EIP-712 messages.
 *  Note: It is assumed that the addresses are in the correct format and have already been validated for length and character set.
 */
export const signTypedDataHandler: ETHRequestHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHHandlerRes> => {
  // -- validate
  if (!signer || !payload) {
    throw new Error(`signer or payload is not defined`);
  }

  const { msgParams, info } = getTypedDataVersionInfo({
    signer,
    payload,
  });

  let signature = await info.signTypedDataFn(signer, msgParams);

  validateSignature(signature);

  return { signature };
};

/**
 * Handles signing a transaction using the provided signer and payload.
 *
 * @param {object} params - The input parameters.
 * @param {Wallet} params.signer - The signer (PKPEthersWallet) to be used for signing the transaction.
 * @param {object} params.payload - The payload containing the transaction information.
 * @returns {Promise<ETHSignature>} - A promise that resolves to an ETHSignature object containing the signed transaction signature.
 *
 * @throws {Error} - If the address in the payload does not match the signer's address, or if the signature is invalid.
 */
export const signTransactionHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHSignature> => {
  const unsignedTx = payload.params[0];
  const addressRequested = unsignedTx.from;

  const _signer = signer as PKPEthersWallet;

  validateAddressesMatch(_signer.address, addressRequested);

  const unsignedTxFormatted = getTransactionToSign(unsignedTx);

  const signedTxSignature = await _signer.signTransaction(unsignedTxFormatted);

  validateSignature(signedTxSignature);

  console.log("Got this signature!");

  return signedTxSignature;
};

/**
 * Handle sending a transaction by signing it with the provided signer.
 * Validate the address of the signer and the address requested from the transaction parameters.
 * If the signature is valid, it returns an object containing the signature.
 *
 * @param {ETHHandlerReq} { signer, payload } - The input object containing the signer and payload.
 * @returns {Promise<any>} A Promise that resolves to an object containing the signature.
 * @throws {Error} If the addresses do not match or if the signature is invalid.
 */
export const sendTransactionHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHTxRes> => {
  const unsignedTx = payload.params[0];
  const addressRequested = unsignedTx.from;

  const _signer = signer as PKPEthersWallet;

  validateAddressesMatch(_signer.address, addressRequested);

  const unsignedTxFormatted = getTransactionToSign(unsignedTx);

  const signedTxSignature = await _signer.signTransaction(unsignedTxFormatted);

  validateSignature(signedTxSignature);

  const txRes = await _signer.sendTransaction(signedTxSignature);

  return txRes;
};

/**
 * Handle sending a raw transaction by signing it with the provided signer.
 * If the signature is valid, it returns an object containing the signature.
 *
 * @param {ETHHandlerReq} { signer, payload } - The input object containing the signer and payload.
 * @returns {Promise<ETHHandlerRes>} A Promise that resolves to an object containing the signature.
 * @throws {Error} If the signature is invalid.
 */
export const sendRawTransactionHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHHandlerRes> => {
  const tx = getTransactionToSign(payload.params[0]);

  const signature = await (signer as PKPEthersWallet).sendTransaction(tx);

  validateSignature(signature);

  return { signature };
};

/**
 * Handle signing a message with the provided signer.
 * Validate the address of the signer and the address requested from the payload.
 * Convert the message from hex to UTF-8, if necessary, and sign it.
 * If the signature is valid, it returns an object containing the signature.
 *
 * @param {ETHHandlerReq} { signer, payload } - The input object containing the signer and payload.
 * @returns {Promise<ETHHandlerRes>} A Promise that resolves to an object containing the signature.
 * @throws {Error} If the addresses do not match or if the signature is invalid.
 */

export const signHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHHandlerRes> => {
  const addressRequested = payload.params[0];

  validateAddressesMatch((signer as PKPEthersWallet).address, addressRequested);

  const msg = convertHexToUtf8(payload.params[1]);
  const signature = await (signer as PKPEthersWallet).signMessage(msg);

  validateSignature(signature);

  return { signature };
};

/**
 * Handle signing a message with the provided signer using the 'personal_sign' method.
 * Validate the address of the signer and the address requested from the payload.
 * Convert the message from hex to UTF-8, if necessary, and sign it.
 * If the signature is valid, it returns an object containing the signature.
 *
 * @param {ETHHandlerReq} { signer, payload } - The input object containing the signer and payload.
 * @returns {Promise<ETHHandlerRes>} A Promise that resolves to an object containing the signature.
 * @throws {Error} If the addresses do not match or if the signature is invalid.
 */
export const personalSignHandler = async ({
  signer,
  payload,
}: ETHHandlerReq): Promise<ETHHandlerRes> => {
  const addressRequested = payload.params[1];

  validateAddressesMatch((signer as PKPEthersWallet).address, addressRequested);

  const msg = convertHexToUtf8(payload.params[0]);
  const signature = await (signer as PKPEthersWallet).signMessage(msg);

  validateSignature(signature);

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
  eth_signTypedData_v1: any;
} & UnknownETHMethod = {
  // signing
  eth_sign: signHandler,
  personal_sign: personalSignHandler,

  // signing typed data - the handler will choose the correct version to use
  eth_signTypedData: signTypedDataHandler,
  eth_signTypedData_v1: signTypedDataHandler,
  eth_signTypedData_v3: signTypedDataHandler,
  eth_signTypedData_v4: signTypedDataHandler,

  // sign tx
  eth_signTransaction: signTransactionHandler,

  // send tx
  eth_sendTransaction: sendTransactionHandler,
  eth_sendRawTransaction: sendRawTransactionHandler,
};

/**
 * Handles Ethereum JSON-RPC requests for the given method and payload.
 * Executes the appropriate signing function based on the method and
 * returns the signature or transaction response.
 * @param {ETHHandlerReq} { signer, payload } - Request object containing signer and payload data.
 * @returns {Promise<T>} - A Promise that resolves to the requested data type (ETHSignature or ETHTxRes).
 * @throws {Error} - Throws an error if the requested method is not supported or if there's an issue during execution.
 */
export const ethRequestHandler = async <T = ETHSignature>({
  signer,
  payload,
}: ETHHandlerReq): Promise<T> => {
  // -- validate if method exists
  if (!methodHandlers.hasOwnProperty(payload.method)) {
    throw new Error(
      `Ethereum JSON-RPC signing method "${payload.method}" is not supported`
    );
  }

  // -- run found function
  const fn = methodHandlers[payload.method] as ETHRequestHandler;

  const data: any = await fn({ signer, payload });

  try {
    if (data['signature']) {
      return data.signature;
    }

    if (data['txRes']) {
      return data.txRes;
    }

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};
