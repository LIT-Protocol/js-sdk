import { computeAddress } from 'ethers/lib/utils';
import { z } from 'zod';

// @deprecated - use the one in schemas package
export const PKPDataSchema = z
  .object({
    tokenId: z.bigint(),
    pubkey: z.string(),
  })
  .transform((data) => ({
    ...data,
    ethAddress: computeAddress(data.pubkey),
  }));

export type PKPData = z.infer<typeof PKPDataSchema>;
