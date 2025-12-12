import { NoValidShares } from '@lit-protocol/constants';
import {
  applyTransformations,
  cleanStringValues,
  combineExecuteJsNodeShares,
  combinePKPSignNodeShares,
  hexifyStringValues,
  logErrorWithRequestId,
  logWithRequestId,
  mostCommonString,
} from '@lit-protocol/crypto';
import {
  PKPSignEndpointResponse as CryptoPKPSignEndpointResponse,
  LitNodeSignature,
  SigType,
} from '@lit-protocol/types';
import { z } from 'zod';
import { PKPSignResponseDataSchema } from '../pkpSign/pkpSign.ResponseDataSchema';
import {
  ExecuteJsValueResponse,
  LitActionSignedData,
  PKPSignEndpointResponse as LocalPKPSignEndpointResponse,
} from '../types';
import { parsePkpSignResponse } from './parse-pkp-sign-response';

function assertThresholdShares(
  requestId: string,
  threshold: number,
  shares: { success: boolean }[]
) {
  const successfulShareSources = shares.filter((response) => response.success);

  if (successfulShareSources.length < threshold) {
    logErrorWithRequestId(
      requestId,
      `Not enough successful items. Expected ${threshold}, got ${successfulShareSources.length}`
    );
    throw new NoValidShares(
      {
        info: {
          requestId,
          itemCount: shares.length,
          successfulItems: successfulShareSources.length,
          threshold,
        },
      },
      `The total number of successful items "${successfulShareSources.length}" does not meet the threshold of "${threshold}"`
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

  // Group signature shares by signature name (e.g., "random-sig-name", "sig-identifier", etc.)
  const keyedSignedData = nodesLitActionSignedData.reduce<
    Record<string, LitActionSignedData[]>
  >((acc, nodeLitActionSignedData) => {
    Object.keys(nodeLitActionSignedData.signedData).forEach((signedDataKey) => {
      if (!acc[signedDataKey]) {
        acc[signedDataKey] = [];
      }

      acc[signedDataKey].push(
        nodeLitActionSignedData.signedData[signedDataKey]
      );
    });

    return acc;
  }, {} as Record<string, LitActionSignedData[]>);

  const signatureKeys = Object.keys(keyedSignedData);

  await Promise.all(
    signatureKeys.map(async (signatureKey) => {
      const signatureShares = keyedSignedData[signatureKey];

      // Parse signature shares similar to PKP sign process
      const preparedShares: Array<{
        originalShare: LitActionSignedData;
        parsedSignatureShareObject: any;
        publicKey?: string;
        sigType?: string;
      }> = [];

      for (const share of signatureShares) {
        try {
          // Parse the JSON string in signatureShare field
          let parsedSignatureShare;
          if (typeof share.signatureShare === 'string') {
            parsedSignatureShare = JSON.parse(share.signatureShare);
          } else {
            parsedSignatureShare = share.signatureShare;
          }

          // Extract publicKey and sigType from the share
          let publicKey = share.publicKey;
          let sigType = share.sigType;

          // If publicKey is a JSON string, parse it
          if (typeof publicKey === 'string' && publicKey.startsWith('"')) {
            publicKey = JSON.parse(publicKey);
          }

          preparedShares.push({
            originalShare: share,
            parsedSignatureShareObject: parsedSignatureShare,
            publicKey,
            sigType,
          });
        } catch (e) {
          logErrorWithRequestId(
            requestId,
            `Error parsing signature share for key ${signatureKey}: ${JSON.stringify(
              share.signatureShare
            )}`,
            e
          );
        }
      }

      /**
       * Recursively attempt to combine signature shares while tolerating a limited number
       * of faulty entries. If the crypto combine call throws (usually due to a corrupted
       * share), the helper drops one share at a time—up to `dropBudget` times—until the
       * combine step succeeds or the threshold can no longer be met.
       *
       * @param shares Prepared signature shares grouped for a single sig key.
       * @param dropBudget How many shares we are allowed to discard before giving up.
       * @returns The combined signature along with the final set of shares that produced it.
       */
      const attemptCombine = async (
        shares: typeof preparedShares,
        dropBudget: number
      ): Promise<{
        combined: Awaited<ReturnType<typeof combineExecuteJsNodeShares>>;
        remainingShares: typeof preparedShares;
      }> => {
        if (shares.length < threshold) {
          throw new NoValidShares(
            {
              info: {
                requestId,
                signatureKey,
                preparedSharesCount: shares.length,
                threshold,
              },
            },
            `Not enough valid signature shares for ${signatureKey}: ${shares.length} (expected ${threshold})`
          );
        }

        try {
          const sharesForCryptoLib: LitActionSignedData[] = shares.map(
            (ps) => ({
              publicKey: ps.publicKey!,
              signatureShare:
                typeof ps.originalShare.signatureShare === 'string'
                  ? ps.originalShare.signatureShare
                  : JSON.stringify(ps.originalShare.signatureShare),
              sigName: ps.originalShare.sigName,
              sigType: ps.sigType! as any,
            })
          );

          const combinedSignature = await combineExecuteJsNodeShares(
            sharesForCryptoLib
          );

          return {
            combined: combinedSignature,
            remainingShares: shares,
          };
        } catch (error) {
          if (dropBudget <= 0) {
            throw error;
          }

          let lastError: unknown = error;

          for (let index = 0; index < shares.length; index += 1) {
            const filteredShares = shares.filter((_, i) => i !== index);
            if (filteredShares.length < threshold) {
              continue;
            }

            logWithRequestId(
              requestId,
              `[executeJs] dropping signature share ${index + 1}/${
                shares.length
              } for ${signatureKey}; drops left ${dropBudget - 1}`
            );

            try {
              return await attemptCombine(filteredShares, dropBudget - 1);
            } catch (nested) {
              lastError = nested;
            }
          }

          throw lastError;
        }
      };

      // We can only drop as many faulty shares as we have "spares" beyond the threshold.
      // e.g. 6 prepared shares with a threshold of 4 => maxDrops = 2; with exactly 4 shares => 0.
      const maxDrops = Math.max(0, preparedShares.length - threshold);

      const { combined: combinedSignature, remainingShares } =
        await attemptCombine(preparedShares, maxDrops);

      const publicKey = mostCommonString(
        remainingShares.map((s) => s.publicKey).filter(Boolean) as string[]
      );
      const sigType = mostCommonString(
        remainingShares.map((s) => s.sigType).filter(Boolean) as string[]
      );

      if (!publicKey || !sigType) {
        throw new NoValidShares(
          {
            info: {
              requestId,
              signatureKey,
              publicKey,
              sigType,
              shares: remainingShares,
            },
          },
          `Could not get public key or sig type from lit action shares for ${signatureKey}`
        );
      }

      const sigResponse = applyTransformations(
        {
          ...combinedSignature,
          publicKey,
          sigType: sigType as SigType,
        },
        [cleanStringValues, hexifyStringValues]
      ) as unknown as LitNodeSignature;

      sigResponses[signatureKey] = sigResponse;
    })
  );

  return sigResponses;
};

/**
 * Combines signature shares from multiple nodes running pkp sign to generate the final signature.
 *
 * @param {number} params.threshold - The threshold number of nodes
 * @param {PKPSignEndpointResponse[]} params.nodesPkpSignResponseData - The array of signature shares from each node.
 * @param {string} params.requestId - The request ID, for logging purposes.
 * @returns {LitNodeSignature} - The final signatures or an object containing the final signatures.
 */
export const combinePKPSignSignatures = async (params: {
  nodesPkpSignResponseData: z.infer<typeof PKPSignResponseDataSchema>['values'];
  requestId: string;
  threshold: number;
}): Promise<LitNodeSignature> => {
  const { threshold, requestId, nodesPkpSignResponseData } = params;

  // Note: nodesPkpSignResponseData items have optional fields, but this helper
  // expects an array of objects with a required `success: boolean`. Map to the
  // narrow shape to avoid widening the type and keep the check simple.
  assertThresholdShares(
    requestId,
    threshold,
    nodesPkpSignResponseData.map((s) => ({ success: !!s.success }))
  );

  const sharesAfterInitialFilter = nodesPkpSignResponseData
    .filter((share) => share.success)
    .filter(Boolean);

  const rawShares = sharesAfterInitialFilter.filter((share) => {
    const sigShareType = typeof share.signatureShare;
    const sigShareIsNull = share.signatureShare === null;
    const sigShareIsObjectNonNull =
      sigShareType === 'object' && !sigShareIsNull;
    return sigShareIsObjectNonNull;
  });

  if (rawShares.length < threshold) {
    throw new NoValidShares(
      { info: { requestId, rawSharesCount: rawShares.length, threshold } },
      `Not enough processable signature shares after initial filtering: ${rawShares.length} (expected ${threshold})`
    );
  }

  const preparedShares: Array<{
    originalRawShare: z.infer<
      typeof PKPSignResponseDataSchema
    >['values'][number];
    parsedSignatureShareObject: any;
    localPSEInput: LocalPKPSignEndpointResponse;
    publicKey?: string;
    sigType?: string;
  }> = [];

  for (const rawShare of rawShares) {
    try {
      const signatureShareObject = rawShare.signatureShare;
      preparedShares.push({
        originalRawShare: rawShare,
        parsedSignatureShareObject: signatureShareObject,
        localPSEInput: {
          success: rawShare.success,
          signedData: rawShare.signedData,
          // The /web/pkp/sign response may nest the share under different keys
          // and with optional fields. Assert to the local `SignatureShare` union
          // so downstream parsing has a stable type to work with.
          signatureShare:
            signatureShareObject as LocalPKPSignEndpointResponse['signatureShare'],
        },
      });
    } catch (e) {
      logErrorWithRequestId(
        requestId,
        `Error processing rawShare (should be object): ${JSON.stringify(
          rawShare.signatureShare
        )}`,
        e
      );
    }
  }

  if (preparedShares.length < threshold) {
    throw new NoValidShares(
      {
        info: {
          requestId,
          sharesAfterParsingAttempt: preparedShares.length,
          threshold,
        },
      },
      `Not enough shares after object preparation: ${preparedShares.length}`
    );
  }

  const parsingResults = parsePkpSignResponse(
    preparedShares.map((p) => p.localPSEInput)
  );

  if (preparedShares.length !== parsingResults.length) {
    logErrorWithRequestId(
      requestId,
      `Mismatch in length between prepared shares (${preparedShares.length}) and parsing results (${parsingResults.length})`
    );
    throw new Error(
      'Share processing length mismatch after parsePkpSignResponse'
    );
  }
  preparedShares.forEach((ps, index) => {
    const result = parsingResults[index];
    if (result) {
      ps.publicKey = result.publicKey;
      ps.sigType = result.sigType;
    } else {
      logErrorWithRequestId(
        requestId,
        `No parsing result for prepared share at index ${index}`
      );
    }
  });

  const sharesForCryptoLib: CryptoPKPSignEndpointResponse[] = preparedShares
    .filter((ps) => ps.publicKey && ps.sigType)
    .map((ps) => ({
      success: ps.originalRawShare.success,
      signedData: new Uint8Array(ps.originalRawShare.signedData as number[]),
      signatureShare: ps.parsedSignatureShareObject,
    }));

  if (sharesForCryptoLib.length < threshold) {
    throw new NoValidShares(
      {
        info: {
          requestId,
          sharesForCryptoCount: sharesForCryptoLib.length,
          threshold,
        },
      },
      `Not enough shares for crypto lib: ${sharesForCryptoLib.length}`
    );
  }

  const combinedSignature = await combinePKPSignNodeShares(sharesForCryptoLib);

  const successfullyProcessedShares = preparedShares.filter(
    (ps) => ps.publicKey && ps.sigType
  );

  const finalPublicKey = mostCommonString(
    successfullyProcessedShares
      .map((p) => p.publicKey)
      .filter(Boolean) as string[]
  );
  const finalSigType = mostCommonString(
    successfullyProcessedShares
      .map((p) => p.sigType)
      .filter(Boolean) as string[]
  );

  if (!finalPublicKey || !finalSigType) {
    throw new NoValidShares(
      {
        info: {
          requestId,
          finalPublicKey,
          finalSigType,
          pkSigPairsCount: successfullyProcessedShares.length,
        },
      },
      'Could not determine final public key or sig type from parsed shares'
    );
  }

  const sigResponse = {
    ...combinedSignature,
    publicKey: finalPublicKey,
    sigType: finalSigType as SigType,
  };

  return sigResponse as LitNodeSignature;
};
