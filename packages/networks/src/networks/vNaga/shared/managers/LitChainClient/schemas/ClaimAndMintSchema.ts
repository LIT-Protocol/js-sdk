import { z } from 'zod';
import { SignatureDataSchema } from './shared/SignatureDataSchema';
import { toHexString } from '../../../../../shared/utils/z-transformers';

export const ClaimAndMintSchema = z.object({
  derivedKeyId: toHexString,
  signatures: z.array(SignatureDataSchema),
});

// ✨ Two types from the same schema:
// 1. User Input Type - this is the type that the user will input, eg. the API we expose for the user to call, could be a function of a request body from a POST request. (e.g., number, string, etc.)
// 2. Transformed/Validated Type - this is the type after the user input has been transformed and validated. Usually used for smart contract calls or external API calls (such as communication with nodes). (e.g., BigInt, etc.)
export type ClaimAndMintRaw = z.input<typeof ClaimAndMintSchema>;
export type ClaimAndMintTransformed = z.infer<typeof ClaimAndMintSchema>;
