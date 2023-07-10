// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { toB58 } from '@mysten/bcs';
import { hashTypedData } from './hash';


  /**
   * Generate transaction digest.
   *
   * @param bytes BCS serialized transaction data
   * @returns transaction digest.
   */
  export function getDigestFromBytes(bytes: Uint8Array) {
    const hash = hashTypedData('TransactionData', bytes);
    return toB58(hash);
  }
