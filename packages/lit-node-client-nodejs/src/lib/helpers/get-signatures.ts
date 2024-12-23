import { joinSignature } from 'ethers/lib/utils';

import {
  LIT_CURVE,
  NoValidShares,
  ParamNullError,
  UnknownSignatureError,
  UnknownSignatureType,
} from '@lit-protocol/constants';
import { combineEcdsaShares } from '@lit-protocol/crypto';
import {
  logErrorWithRequestId,
  logWithRequestId,
  mostCommonString,
} from '@lit-protocol/misc';
import { SigResponse, SigShare } from '@lit-protocol/types';

export const getFlattenShare = (share: any): SigShare => {
  // flatten the signature object so that the properties of the signature are top level
  const flattenObj = Object.values(share).map((item) => {
    if (item === null || item === undefined) {
      return null;
    }

    const typedItem = item as SigShare;

    const requiredShareProps = [
      'sigType',
      'dataSigned',
      'signatureShare',
      'shareIndex',
      'bigR',
      'publicKey',
    ];

    const requiredSessionSigsShareProps = [
      ...requiredShareProps,
      'siweMessage',
    ] as const;

    const requiredSignatureShareProps = [
      ...requiredShareProps,
      'sigName',
    ] as const;

    const hasProps = (props: readonly string[]) => {
      return props.every(
        (prop) =>
          typedItem[prop as keyof SigShare] !== undefined &&
          typedItem[prop as keyof SigShare] !== null
      );
    };

    if (
      hasProps(requiredSessionSigsShareProps) ||
      hasProps(requiredSignatureShareProps)
    ) {
      const bigR = typedItem.bigR ?? typedItem.bigr;

      typedItem.signatureShare = (typedItem.signatureShare ?? '').replaceAll(
        '"',
        ''
      );
      typedItem.bigR = (bigR ?? '').replaceAll('"', '');
      typedItem.publicKey = (typedItem.publicKey ?? '').replaceAll('"', '');
      typedItem.dataSigned = (typedItem.dataSigned ?? '').replaceAll('"', '');

      return typedItem;
    }

    return null;
  });

  // removed all null values and should only have one item
  const flattenShare = flattenObj.filter(
    (item) => item !== null
  )[0] as SigShare;

  if (flattenShare === null || flattenShare === undefined) {
    return share;
  }
  return flattenShare;
};

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
export const getSignatures = async <T>(params: {
  networkPubKeySet: any;
  minNodeCount: number;
  signedData: any[];
  requestId: string;
}): Promise<T | { signature: SigResponse; sig: SigResponse }> => {
  const { networkPubKeySet, minNodeCount, signedData, requestId } = params;

  const initialKeys = [...new Set(signedData.flatMap((i) => Object.keys(i)))];

  // processing signature shares for failed or invalid contents.  mutates the signedData object.
  for (const signatureResponse of signedData) {
    for (const sigName of Object.keys(signatureResponse)) {
      const requiredFields = ['signatureShare'];

      for (const field of requiredFields) {
        if (!signatureResponse[sigName][field]) {
          logWithRequestId(
            requestId,
            `invalid field ${field} in signature share: ${sigName}, continuing with share processing`
          );
          // destructive operation on the object to remove invalid shares inline, without a new collection.
          delete signatureResponse[sigName];
        } else {
          let share = getFlattenShare(signatureResponse[sigName]);

          share = {
            sigType: share.sigType,
            signatureShare: share.signatureShare,
            shareIndex: share.shareIndex,
            bigR: share.bigR,
            publicKey: share.publicKey,
            dataSigned: share.dataSigned,
            sigName: share.sigName ? share.sigName : 'sig',
          };
          signatureResponse[sigName] = share;
        }
      }
    }
  }

  const validatedSignedData = signedData;

  // -- prepare
  const signatures: any = {};

  // get all signature shares names from all node responses.
  // use a set to filter duplicates and copy into an array
  const allKeys = [
    ...new Set(validatedSignedData.flatMap((i) => Object.keys(i))),
  ];

  if (allKeys.length !== initialKeys.length) {
    throw new NoValidShares(
      {},
      'total number of valid signatures does not match requested'
    );
  }

  // -- combine
  for (const key of allKeys) {
    // here we use a map filter implementation to find common shares in each node response.
    // we then filter out undefined object from the key access.
    // currently we are unable to know the total signature count requested by the user.
    // but this allows for incomplete sets of signature shares to be aggregated
    // and then checked against threshold
    const shares = validatedSignedData
      .map((r) => r[key])
      .filter((r) => r !== undefined);

    shares.sort((a, b) => a.shareIndex - b.shareIndex);

    const sigName = shares[0].sigName;
    logWithRequestId(
      requestId,
      `starting signature combine for sig name: ${sigName}`,
      shares
    );
    logWithRequestId(
      requestId,
      `number of shares for ${sigName}:`,
      signedData.length
    );
    logWithRequestId(
      requestId,
      `validated length for signature: ${sigName}`,
      shares.length
    );
    logWithRequestId(
      requestId,
      'minimum required shares for threshold:',
      minNodeCount
    );

    if (shares.length < minNodeCount) {
      logErrorWithRequestId(
        requestId,
        `not enough nodes to get the signatures.  Expected ${minNodeCount}, got ${shares.length}`
      );

      throw new NoValidShares(
        {
          info: {
            requestId,
            shares: shares.length,
            minNodeCount,
          },
        },
        'The total number of valid signatures shares %s does not meet the threshold of %s',
        shares.length,
        minNodeCount
      );
    }

    const sigType = mostCommonString(shares.map((s) => s.sigType));

    // -- validate if this.networkPubKeySet is null
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

    // -- validate if signature type is ECDSA
    if (
      sigType !== LIT_CURVE.EcdsaCaitSith &&
      sigType !== LIT_CURVE.EcdsaK256 &&
      sigType !== LIT_CURVE.EcdsaCAITSITHP256
    ) {
      throw new UnknownSignatureType(
        {
          info: {
            requestId,
            signatureType: sigType,
          },
        },
        'signature type is %s which is invalid',
        sigType
      );
    }

    const signature = await combineEcdsaShares(shares);
    if (!signature.r) {
      throw new UnknownSignatureError(
        {
          info: {
            requestId,
            signature,
          },
        },
        'signature could not be combined'
      );
    }

    const encodedSig = joinSignature({
      r: '0x' + signature.r,
      s: '0x' + signature.s,
      v: signature.recid,
    });

    signatures[key] = {
      ...signature,
      signature: encodedSig,
      publicKey: mostCommonString(shares.map((s) => s.publicKey)),
      dataSigned: mostCommonString(shares.map((s) => s.dataSigned)),
    };
  }

  return signatures;
};
