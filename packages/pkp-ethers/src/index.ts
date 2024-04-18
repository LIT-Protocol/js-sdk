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
import { PKPEthersWallet } from './lib/pkp-ethers';
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
  isEthRequest,
  SupportedETHSigningMethods,
};
