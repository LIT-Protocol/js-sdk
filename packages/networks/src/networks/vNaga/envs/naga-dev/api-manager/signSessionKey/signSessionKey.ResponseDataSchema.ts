import { z } from 'zod';

export const SignSessionKeyResponseDataSchema = z.object({
  success: z.boolean(),
  values: z.array(
    z.object({
      result: z.string(),
      signatureShare: z.object({
        ProofOfPossession: z.object({
          identifier: z.string(),
          value: z.string(),
        }),
      }),
      shareId: z.string(),
      curveType: z.string(),
      siweMessage: z.string(),
      dataSigned: z.string(),
      blsRootPubkey: z.string(),
    })
  ),
});
