import { MintPKPRequest } from '@lit-protocol/schemas';
import { getChildLogger } from '@lit-protocol/logger';

const logger = getChildLogger({ name: 'PkpMintHandler' });

/**
 * Handles PKP minting tasks.
 * @param jobData The data for the job, expected to contain `requestBody`.
 * @returns The result of the PKP minting process.
 */
export async function handlePkpMintTask(jobData: {
  requestBody: MintPKPRequest;
  reqId?: string;
}): Promise<any> {
  const mintParams = {
    account: globalThis.systemContext.account,
    authData: {
      authMethodId: jobData.requestBody.authMethodId,
      authMethodType: jobData.requestBody.authMethodType,
      publicKey: jobData.requestBody.pubkey,
    },
    scopes: jobData.requestBody.scopes,
  };

  const result = await globalThis.systemContext.litClient.mintWithAuth(
    mintParams
  );

  logger.info(
    {
      tokenId: result.data.tokenId.toString(),
      authMethodId: jobData.requestBody.authMethodId,
      authMethodType: jobData.requestBody.authMethodType,
      scopes: jobData.requestBody.scopes,
    },
    '[PkpMintHandler] PKP mint successful'
  );

  logger.debug({ result }, '[PkpMintHandler] raw mint result');

  const processedResult = {
    hash: result._raw.hash,
    data: {
      ...result.data,
      tokenId: result.data.tokenId.toString(),
    },
  };
  return processedResult;
}
