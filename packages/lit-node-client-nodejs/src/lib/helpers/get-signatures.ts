import {
  CURVE_GROUP_BY_CURVE_TYPE,
  LIT_CURVE_VALUES,
  NoValidShares,
  ParamNullError,
  UnknownSignatureType,
  CurveTypeNotFoundError,
} from '@lit-protocol/constants';
import { combineExecuteJsNodeShares, combinePKPSignNodeShares, combineEcdsaShares } from '@lit-protocol/crypto';
import { applyTransformations, cleanStringValues, hexifyStringValues, logErrorWithRequestId, mostCommonString } from '@lit-protocol/misc';
import {
  ExecuteJsValueResponse,
  LitNodeSignature,
  LitActionSignedData,
  PKPSignEndpointResponse,
  EcdsaSignedMessageShareParsed,
  SigResponse,
} from '@lit-protocol/types';

import { parsePkpSignResponse } from './parse-pkp-sign-response';

/**
 * Retrieves and combines signature shares from multiple nodes to generate the final signatures.
 *
 * @template T - The type of the final signatures. For `executeJs` endpoint, it returns as `signature`, and for `pkpSign` endpoint, it returns as `sig`.
 * @param {any} params.networkPubKeySet - The public key set of the network.
 * @param {number} params.minNodeCount - The threshold number of nodes
 * @param {any[]} params.nodeLitActionSignedData - The array of signature shares from each node.
 * @param {string} [params.requestId=''] - The optional request ID for logging purposes.
 * @returns {T | { signature: SigResponse; sig: SigResponse }} - The final signatures or an object containing the final signatures.
 *
 * @example
 *
 * executeJs: getSignatures<{ signature: SigResponse }>
 * pkpSign: getSignatures<{ sig: SigResponse }>
 */
export const getSignatures = async (params: {
  networkPubKeySet: string | null;
  threshold: number;
  signedMessageShares: EcdsaSignedMessageShareParsed[];
  requestId: string;
}): Promise<SigResponse> => {
  const { networkPubKeySet, threshold, signedMessageShares, requestId } =
    params;

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

  const _publicKey = mostCommonString(
    signedMessageShares.map((s) => s.publicKey)
  );
  const _dataSigned = mostCommonString(
    signedMessageShares.map((s) => s.dataSigned)
  );

  if (!_publicKey || !_dataSigned) {
    throw new Error('No valid publicKey or dataSigned found');
  }

  const sigResponse: SigResponse = {
    ...combinedSignature,
    publicKey: _publicKey,
    dataSigned: _dataSigned,
  };

  return sigResponse;
};

function assertThresholdShares(requestId: string, threshold: number, shares: { success: boolean }[]) {
  const successfulShares = shares.filter(
    (response) => response.success
  );

  if (successfulShares.length < threshold) {
    logErrorWithRequestId(
      requestId,
      `Not enough nodes to get the lit action signatures. Expected ${threshold}, got ${successfulShares.length}`
    );

    throw new NoValidShares(
      {
        info: {
          requestId,
          shares,
          threshold,
        },
      },
      `The total number of valid lit action signatures shares "${successfulShares.length}" does not meet the threshold of "${threshold}"`
    );
  }
}

/**
 * Combines signature shares from multiple nodes running a lit action to generate the final signatures.
 *
 * @param {number} params.threshold - The threshold number of nodes
 * @param {PKPSignEndpointResponse[]} params.nodesLitActionSignedData - The array of signature shares from each node.
 * @param {string} params.requestId - The request ID, for logging purposes.
 * @returns {LitNodeSignature} - The final signatures or an object containing the final signatures.
 */
export const combineExecuteJSSignatures = async (params: {
  nodesLitActionSignedData: ExecuteJsValueResponse[];
  requestId: string;
  threshold: number;
}): Promise<Record<string, LitNodeSignature>> => {
  const { threshold, requestId, nodesLitActionSignedData } = params;

  assertThresholdShares(requestId, threshold, nodesLitActionSignedData);

  const sigResponses = {} as Record<string, LitNodeSignature>;

  const keyedSignedData = nodesLitActionSignedData.reduce<Record<string, LitActionSignedData[]>>((acc, nodeLitActionSignedData) => {
    Object.keys(nodeLitActionSignedData.signedData).forEach((signedDataKey) => {
      if (!acc[signedDataKey]) {
        acc[signedDataKey] = [];
      }

      acc[signedDataKey].push(nodeLitActionSignedData.signedData[signedDataKey]);
    });

    return acc;
  }, {} as Record<string, LitActionSignedData[]>);

  const signatureKeys = Object.keys(keyedSignedData);
  await Promise.all(signatureKeys.map(async (signatureKey) => {
    const signatureShares = keyedSignedData[signatureKey];
    const publicKey = mostCommonString(
      signatureShares.map((s) => s.publicKey)
    );
    const sigType = mostCommonString(signatureShares.map((s) => s.sigType));

    if (!publicKey || !sigType) {
      throw new NoValidShares(
        {
          info: {
            requestId,
            publicKey,
            shares: nodesLitActionSignedData,
            sigType,
          },
        },
        'Could not get public key or sig type from lit action shares'
      );
    }

    // -- combine signature shares
    const combinedSignature = await combineExecuteJsNodeShares(signatureShares);

    const sigResponse = applyTransformations({
      ...combinedSignature,
      publicKey,
      sigType,
    },
    [
      cleanStringValues,
      hexifyStringValues,
    ]) as unknown as LitNodeSignature;

    sigResponses[signatureKey] = sigResponse;
  }));

  return sigResponses;
};

/**
 * Combines signature shares from multiple nodes running pkp sign to generate the final signature.
 *
 * @param {number} params.threshold - The threshold number of nodes
 * @param {PKPSignEndpointResponse[]} params.nodesLitActionSignedData - The array of signature shares from each node.
 * @param {string} params.requestId - The request ID, for logging purposes.
 * @returns {LitNodeSignature} - The final signatures or an object containing the final signatures.
 */
export const combinePKPSignSignatures = async (params: {
  nodesPkpSignResponseData: PKPSignEndpointResponse[];
  requestId: string;
  threshold: number;
}): Promise<LitNodeSignature> => {
  const { threshold, requestId, nodesPkpSignResponseData } = params;

  assertThresholdShares(requestId, threshold, nodesPkpSignResponseData);

  const parsedPkpSignResponse = parsePkpSignResponse(nodesPkpSignResponseData);
  const publicKey = mostCommonString(
    parsedPkpSignResponse.map((s) => s.publicKey)
  );
  const sigType = mostCommonString(parsedPkpSignResponse.map((s) => s.sigType));

  if (!publicKey || !sigType) {
    throw new NoValidShares(
      {
        info: {
          requestId,
          publicKey,
          shares: nodesPkpSignResponseData,
          sigType,
        },
      },
      'Could not get public key or sig type from pkp sign shares'
    );
  }

  // -- combine signature shares
  const combinedSignature = await combinePKPSignNodeShares(nodesPkpSignResponseData);

  const sigResponse = {
    ...combinedSignature,
    publicKey,
    sigType,
  };

  return sigResponse;
};
