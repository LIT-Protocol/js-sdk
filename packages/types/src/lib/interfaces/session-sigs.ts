import { z } from 'zod';
import { AuthSigSchema } from '../interfaces';

export const ParsedSignedMessageSchema = z
  .object({
    // Known keys
    URI: z.string().optional(),
    Version: z.string().optional(),
    'Chain ID': z.string().optional(),
    Nonce: z.string().optional(),
    'Issued At': z.string().optional(),

    /**
     * Inner expiration
     */
    'Expiration Time': z.string().optional(),
    Resources: z.array(z.string()).optional(),

    /**
     * Outer expiration
     */
    expiration: z.string().optional(),
  })
  .catchall(z.unknown()); // Dynamic keys
export type ParsedSignedMessage = z.infer<typeof ParsedSignedMessageSchema>;

export const CapabilitySchema = AuthSigSchema.extend({
  parsedSignedMessage: ParsedSignedMessageSchema.optional(),
});
export type Capability = z.infer<typeof CapabilitySchema>;

export const ParsedSessionMessageSchema = ParsedSignedMessageSchema.extend({
  capabilities: z.array(CapabilitySchema).nonempty(),
});
export type ParsedSessionMessage = z.infer<typeof ParsedSessionMessageSchema>;
