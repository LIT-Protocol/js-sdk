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
  // Validate and transform the request using the unified schema
  // This handles the WebAuthn pubkey validation internally
  const validatedRequest = await MintPKPRequestSchema.parseAsync(
    jobData.requestBody
  );

  const userAuthData: Optional<AuthData, 'accessToken'> = {
    authMethodId: validatedRequest.authMethodId,
    authMethodType: validatedRequest.authMethodType,
    publicKey: validatedRequest.pubkey,
  };

  const result = await globalThis.systemContext.litClient.mintWithAuth({
    account: globalThis.systemContext.account,
    authData: userAuthData,
    scopes: validatedRequest.scopes,
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
