// ----- autogen:polyfills:start  -----
//
// ----- autogen:polyfills:end  -----

import { PKPEthersWallet } from './lib/pkp-ethers';

import {
  methodHandlers,
  ethRequestHandler,
  getTypedDataVersionInfo,
  validateSignature,
  validateAddressesMatch,
  signHandler,
  personalSignHandler,
  signTypedDataHandler,
  signTypedData,
  signTypedDataLegacy,
  sendTransactionHandler,
  sendRawTransactionHandler,
  isEthRequest,
} from './lib/handler';

// import { SupportedETHSigningMethods } from './lib/pkp-ethers-types';
export type SupportedETHSigningMethods =
  | 'eth_sign'
  | 'personal_sign'
  | 'eth_signTransaction'
  | 'eth_signTypedData'
  | 'eth_signTypedData_v1'
  | 'eth_signTypedData_v3'
  | 'eth_signTypedData_v4'
  | 'eth_sendTransaction'
  | 'eth_sendRawTransaction';

export {
  PKPEthersWallet,
  methodHandlers,
  ethRequestHandler,
  getTypedDataVersionInfo,
  validateSignature,
  validateAddressesMatch,
  signHandler,
  personalSignHandler,
  signTypedDataHandler,
  signTypedData,
  signTypedDataLegacy,
  sendTransactionHandler,
  sendRawTransactionHandler,
  isEthRequest,
};
