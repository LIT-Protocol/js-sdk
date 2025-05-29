import { SigningSchemeSchema } from '@lit-protocol/constants';
import { z } from 'zod';
import { GenericResultSchemaBuilder } from '@lit-protocol/schemas';

// Define the schema for the EcdsaSignedMessageShare object
const EcdsaSignedMessageShareDataSchema = z.object({
  digest: z.string(),
  result: z.string(), // Or z.literal('success') if it's always "success"
  share_id: z.string(),
  peer_id: z.string(),
  signature_share: z.string(),
  big_r: z.string(),
  compressed_public_key: z.string(),
  public_key: z.string(),
  sig_type: SigningSchemeSchema, // Using the imported enum
});

// Define the schema for the FrostSignedMessageShare object
const FrostSignedMessageShareDataSchema = z.object({
  message: z.string(),
  result: z.string(), // Or z.literal('success')
  share_id: z.string(),
  peer_id: z.string(),
  signature_share: z.string(),
  signing_commitments: z.string(),
  verifying_share: z.string(),
  public_key: z.string(),
  sig_type: SigningSchemeSchema, // Using the imported enum
});

export const PKPSignEncryptedPayloadSchema = z.object({});

export const PKPSignResponseDataSchema = GenericResultSchemaBuilder(
  z.object({
    success: z.boolean(),
    signedData: z.array(z.number()),
    signatureShare: z.union([
      z.object({
        EcdsaSignedMessageShare: EcdsaSignedMessageShareDataSchema,
      }),
      z.object({
        FrostSignedMessageShare: FrostSignedMessageShareDataSchema,
      }),
      // Add other potential share types here if they exist
      // For example: z.object({ SomeOtherShareType: SomeOtherShareSchema })
    ]),
  })
);
