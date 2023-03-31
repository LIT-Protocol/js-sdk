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
  ETHRequestSigningPayload,
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

  /**
   * Returns an object with version info based on isAddress boolean value.
   * If true, returns version 3 or 4 data properties.
   * If false, returns version 1 data properties.
   * @param { ETHRequestSigningPayload } payload
   */
  function getTypedDataVersionInfo(payload: ETHRequestSigningPayload) {
    if (!payload.params[0]) {
      throw new Error(`signTypedDataHandler: payload.params[0] is not defined`);
    }

    const ethersIsAddress = ethers.utils.isAddress(payload.params[0]);

    if (ethersIsAddress) {
      return {
        logMessage: 'RUNNING VERSION 3 or 4',
        addressIndex: 0,
        msgParamsIndex: 1,
        signTypedDataFn: signTypedData,
      };
    } else {
      return {
        logMessage: 'RUNNING VERSION 1',
        addressIndex: 1,
        msgParamsIndex: 0,
        signTypedDataFn: signTypedDataLegacy,
      };
    }
  }

  const versionInfo = getTypedDataVersionInfo(payload);

  console.log(versionInfo.logMessage);

  let addressRequested = payload.params[versionInfo.addressIndex];
  validateAddressesMatch((signer as PKPEthersWallet).address, addressRequested);
  let msgParams = payload.params[versionInfo.msgParamsIndex];
  let signature = await versionInfo.signTypedDataFn(signer, msgParams);

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
