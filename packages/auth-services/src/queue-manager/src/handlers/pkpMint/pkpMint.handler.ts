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
  };
}): Promise<any> {
  const result = await globalThis.systemContext.litClient.mintWithAuth({
    account: globalThis.systemContext.account,
    authData: globalThis.systemContext.authData,
    scopes: ['sign-anything'],
    overwrites: {
      authMethodType: Number(jobData.requestBody.authMethodType),
      authMethodId: jobData.requestBody.authMethodId,
      pubkey: jobData.requestBody.pubkey,
    },
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
