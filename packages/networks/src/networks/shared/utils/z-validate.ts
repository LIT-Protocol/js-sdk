import { z } from 'zod';

export const isEthAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// To check if it's IPFS CIDv0
export const isIpfsCidV0 = z.string().regex(/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/);
