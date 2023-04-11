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
} from './lib/handler';

import { SupportedETHSigningMethods } from './lib/pkp-ethers-types';

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
  SupportedETHSigningMethods,
};
