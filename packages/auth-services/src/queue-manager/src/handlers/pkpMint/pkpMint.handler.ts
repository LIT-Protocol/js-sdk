import { AuthData } from '@lit-protocol/schemas';
import { Optional } from '@lit-protocol/types';
import { Hex } from 'viem';

/**
 * Handles PKP minting tasks.
 * @param jobData The data for the job, expected to contain `requestBody`.
 * @returns The result of the PKP minting process.
 */
export async function handlePkpMintTask(jobData: {
  requestBody: {
    authMethodType: string;
    authMethodId: Hex;
    pubkey: Hex;
    scopes?: ('sign-anything' | 'personal-sign' | 'no-permissions')[];
  };
  reqId?: string;
}): Promise<any> {
  // console.log('[PKP Mint][HANDLER][REQ]', {
  //   reqId: jobData.reqId,
  //   authMethodType: jobData.requestBody.authMethodType,
  //   authMethodId: jobData.requestBody.authMethodId,
  //   pubkey_len: jobData.requestBody.pubkey?.length ?? 0,
  //   pubkey_is_0x: jobData.requestBody.pubkey === '0x',
  //   pubkey_preview: (jobData.requestBody.pubkey ?? '').slice(0, 12),
  //   scopes: jobData.requestBody.scopes,
  // });

  if (
    // AUTH_METHOD_TYPE.WebAuthn = 3
    Number(jobData.requestBody.authMethodType) === 3 &&
    (!jobData.requestBody.pubkey || jobData.requestBody.pubkey === '0x')
  ) {
    throw new Error(
      `[PKP Mint][HANDLER] WebAuthn requires a non-empty COSE pubkey; got '${jobData.requestBody.pubkey}'. reqId=${jobData.reqId}`
    );
  }

  const userAuthData: Optional<AuthData, 'accessToken'> = {
    authMethodId: jobData.requestBody.authMethodId,
    authMethodType: Number(jobData.requestBody.authMethodType),
    publicKey: jobData.requestBody.pubkey,
  };

  // console.log('[PKP Mint][HANDLER][MAPPING]', {
  //   reqId: jobData.reqId,
  //   authMethodType: userAuthData.authMethodType,
  //   authMethodId: userAuthData.authMethodId,
  //   publicKey_len: userAuthData.publicKey?.length ?? 0,
  //   publicKey_preview: (userAuthData.publicKey ?? '').slice(0, 12),
  // });

  const result = await globalThis.systemContext.litClient.mintWithAuth({
    account: globalThis.systemContext.account,
    authData: userAuthData,
    scopes: jobData.requestBody.scopes || [],
  });

  console.log(
    `[PkpMintHandler] PKP Minting successful. Token ID: ${result.data.tokenId.toString()}`
  );

  const processedResult = {
    hash: result._raw.hash,
    data: {
      ...result.data,
      tokenId: result.data.tokenId.toString(),
    },
  };
  return processedResult;
}
