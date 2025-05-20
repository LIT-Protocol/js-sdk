import { MintRequestRaw } from '@lit-protocol/networks/src/networks/vNaga/LitChainClient/schemas/MintRequestSchema';

/**
 * Handles PKP minting tasks.
 * @param jobData The data for the job, expected to contain `requestBody`.
 * @returns The result of the PKP minting process.
 */
export async function handlePkpMintTask(jobData: {
  requestBody: MintRequestRaw;
}): Promise<any> {
  const result = await globalThis.systemContext.litClient.mintPkp({
    authContext: await globalThis.systemContext.createEoaAuthContext(),
    scopes: ['sign-anything'],
    // If you intend to use properties from jobData.requestBody directly for mintPkp,
    // ensure they are correctly mapped. For example:
    // keyType: jobData.requestBody.keyType,
    // permittedAuthMethodTypes: jobData.requestBody.permittedAuthMethodTypes,
    // ... and so on, if these are part of MintRequestRaw and expected by mintPkp.
  });

  console.log(
    `[PkpMintHandler] PKP Minting successful. Token ID: ${result.data.tokenId.toString()}`
  );

  const processedResult = {
    hash: result.hash,
    data: {
      ...result.data,
      tokenId: result.data.tokenId.toString(),
    },
  };
  return processedResult;
}
