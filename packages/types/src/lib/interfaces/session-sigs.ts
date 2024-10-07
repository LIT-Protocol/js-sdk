import { z } from 'zod';

import {
  CapabilitySchema,
  ParsedSessionMessageSchema,
  ParsedSignedMessageSchema,
} from '@lit-protocol/schemas';

export type ParsedSignedMessage = z.infer<typeof ParsedSignedMessageSchema>;

export type Capability = z.infer<typeof CapabilitySchema>;

export type ParsedSessionMessage = z.infer<typeof ParsedSessionMessageSchema>;
