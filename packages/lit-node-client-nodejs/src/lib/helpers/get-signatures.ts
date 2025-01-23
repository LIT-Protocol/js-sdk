import { joinSignature } from 'ethers/lib/utils';

import {
  CURVE_GROUP_BY_CURVE_TYPE,
  LIT_CURVE_VALUES,
  NoValidShares,
  ParamNullError,
  UnknownSignatureError,
  UnknownSignatureType,
  CurveTypeNotFoundError,
} from '@lit-protocol/constants';
import { combineEcdsaShares } from '@lit-protocol/crypto';
import {
  logErrorWithRequestId,
  logWithRequestId,
  mostCommonString,
} from '@lit-protocol/misc';
import {
  EcdsaSignedMessageShareParsed,
  SigResponse,
  SigShare,
} from '@lit-protocol/types';

/**
 * Retrieves and combines signature shares from multiple nodes to generate the final signatures.
 *
 * @template T - The type of the final signatures. For `executeJs` endpoint, it returns as `signature`, and for `pkpSign` endpoint, it returns as `sig`.
 * @param {any} params.networkPubKeySet - The public key set of the network.
 * @param {number} params.minNodeCount - The threshold number of nodes
 * @param {any[]} params.signedData - The array of signature shares from each node.
 * @param {string} [params.requestId=''] - The optional request ID for logging purposes.
 * @returns {T | { signature: SigResponse; sig: SigResponse }} - The final signatures or an object containing the final signatures.
 *
 * @example
 *
 * executeJs: getSignatures<{ signature: SigResponse }>
 * pkpSign: getSignatures<{ sig: SigResponse }>
 */
export const getSignatures = async (params: {
  networkPubKeySet: any;
  threshold: number;
  signedMessageShares: EcdsaSignedMessageShareParsed[];
  requestId: string;
}): Promise<SigResponse> => {
  let { networkPubKeySet, threshold, signedMessageShares, requestId } = params;

  if (networkPubKeySet === null) {
    throw new ParamNullError(
      {
        info: {
          requestId,
        },
      },
      'networkPubKeySet cannot be null'
    );
  }

  if (signedMessageShares.length < threshold) {
    logErrorWithRequestId(
      requestId,
      `not enough nodes to get the signatures. Expected ${threshold}, got ${signedMessageShares.length}`
    );

    throw new NoValidShares(
      {
        info: {
          requestId,
          shares: signedMessageShares.length,
          threshold,
        },
      },
      `The total number of valid signatures shares "${signedMessageShares.length}" does not meet the threshold of "${threshold}"`
    );
  }

  const curveType = signedMessageShares[0].sigType;

  if (!curveType) {
    throw new CurveTypeNotFoundError(
      {
        info: {
          requestId,
        },
      },
      'No curve type "%s" found',
      curveType
    );
  }

  const curveGroup = CURVE_GROUP_BY_CURVE_TYPE[curveType as LIT_CURVE_VALUES];

  if (curveGroup !== 'ECDSA') {
    throw new UnknownSignatureType(
      {
        info: {
          requestId,
          signatureType: curveType,
        },
      },
      'signature type is %s which is invalid',
      curveType
    );
  }

  // -- combine
  const combinedSignature = await combineEcdsaShares(signedMessageShares);

  const sigResponse: SigResponse = {
    ...combinedSignature,
    publicKey:
      mostCommonString(signedMessageShares.map((s) => s.publicKey)) ?? '',
    dataSigned:
      mostCommonString(signedMessageShares.map((s) => s.dataSigned)) ?? '',
  };

  return sigResponse;
};
