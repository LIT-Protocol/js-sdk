import { HexSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { GenericResponseSchema } from '../schemas';

// Wrapped response schema for the new API structure
export const RawHandshakeResponseSchema = GenericResponseSchema(
  z.object({
    serverPublicKey: z.string(),
    subnetPublicKey: z.string(),
    networkPublicKey: z.string(),
    networkPublicKeySet: z.string(),
    clientSdkVersion: z.string(),
    hdRootPubkeys: z.array(z.string()),
    attestation: z.any().optional(), // ❗️ Attestation data if provided by node. <network>-dev version will be null.
    latestBlockhash: HexSchema,
    nodeIdentityKey: z.string().optional(), // ❗️ Need to update this when NagaDev deploys the latest version
    nodeVersion: z.string(),
    epoch: z.number(),
  })
);
