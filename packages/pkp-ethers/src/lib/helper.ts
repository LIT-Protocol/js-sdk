import { ethers } from 'ethers';

/**
 * Convert a hexadecimal value to its UTF-8 string representation.
 * If the input value is not a valid hexadecimal string, it will return the original value.
 *
 * @param {any} value - The hexadecimal value to convert.
 * @returns {string} The converted UTF-8 string or the original value if it is not a valid hex string.
 */
export function convertHexToUtf8(value: string): string {
  try {
    if (ethers.utils.isHexString(value)) {
      return ethers.utils.toUtf8String(value);
    }
    return value;
  } catch (e) {
    return value;
  }
}

/**
 * Get a transaction object to sign by removing 'gas' and 'from' fields from the input transaction parameters.
 *
 * @param {any} txParams - The original transaction parameters.
 * @returns {any} The transaction object with 'gas' and 'from' fields removed.
 */
export const getTransactionToSign = (txParams: any): any => {
  let formattedTx = Object.assign({}, txParams);

  if (formattedTx.gas) {
    delete formattedTx.gas;
  }

  if (formattedTx.from) {
    delete formattedTx.from;
  }

  return formattedTx;
};

export function isSignedTransaction(tx: any): boolean {
  try {
    const parsedTx = ethers.utils.parseTransaction(tx);
    return !!parsedTx.v && !!parsedTx.r && !!parsedTx.s;
  } catch (err) {
    return false;
  }
}
