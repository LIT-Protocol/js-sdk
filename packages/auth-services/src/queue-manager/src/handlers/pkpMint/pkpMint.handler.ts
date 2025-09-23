import {
  AuthData,
  MintPKPRequest,
  MintPKPRequestSchema,
} from '@lit-protocol/schemas';
import { Optional } from '@lit-protocol/types';

/**
 * Handles PKP minting tasks.
 * @param jobData The data for the job, expected to contain `requestBody`.
 * @returns The result of the PKP minting process.
 */
export async function handlePkpMintTask(jobData: {
  requestBody: MintPKPRequest;
  reqId?: string;
}): Promise<any> {
  const result = await globalThis.systemContext.litClient.mintWithAuth({
    account: globalThis.systemContext.account,
    authData: {
      authMethodId: jobData.requestBody.authMethodId,
      authMethodType: jobData.requestBody.authMethodType,
      publicKey: jobData.requestBody.pubkey,
    },
    scopes: jobData.requestBody.scopes,
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
