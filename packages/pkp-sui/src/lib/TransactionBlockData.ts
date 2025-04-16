// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { hashTypedData } from './hash';
import { ethers } from 'ethers';

/**
 * Generate transaction digest.
 *
 * @param bytes BCS serialized transaction data
 * @returns transaction digest.
 */
export function getDigestFromBytes(bytes: Uint8Array) {
  const hash = hashTypedData('TransactionData', bytes);
  return ethers.utils.base58.encode(hash);
}
