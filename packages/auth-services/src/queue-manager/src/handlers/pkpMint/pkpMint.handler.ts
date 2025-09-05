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
  if (
    // AUTH_METHOD_TYPE.WebAuthn = 3 (without importing the constants package)
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
