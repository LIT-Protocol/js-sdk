import { computeAddress } from 'ethers/lib/utils';
import { z } from 'zod';

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
