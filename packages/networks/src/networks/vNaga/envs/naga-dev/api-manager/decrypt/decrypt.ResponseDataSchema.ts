import { z } from 'zod';

export const DecryptResponseDataSchema = z.object({
  signatureShare: z.object({
    ProofOfPossession: z.object({
      identifier: z.string(),
      value: z.string(),
    }),
  }),
  shareId: z.string(),
  // Keep backward compatibility fields
  share_id: z.string().optional(),
  signature_share: z.string().optional(),
}); 