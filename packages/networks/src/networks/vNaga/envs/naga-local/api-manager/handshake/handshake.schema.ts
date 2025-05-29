import { GenericResultBuilder, HexSchema } from '@lit-protocol/schemas';
import { z } from 'zod';

export const RawHandshakeResponseSchema = GenericResultBuilder(
  z.object({
    serverPublicKey: z.string(),
    subnetPublicKey: z.string(),
    networkPublicKey: z.string(),
    networkPublicKeySet: z.string(),
    clientSdkVersion: z.string(),
    hdRootPubkeys: z.array(z.string()),
    attestation: z.any().optional(), // ❗️ Attestation data if provided by node. <network>-dev version will be null.
    latestBlockhash: HexSchema,
    nodeIdentityKey: z.string(),
    nodeVersion: z.string(),
    epoch: z.number(),
  })
);
