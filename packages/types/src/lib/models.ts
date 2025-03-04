import { z } from 'zod';

import {
  AttenuationsObjectSchema,
  ISessionCapabilityObjectSchema,
  LitResourceAbilityRequestSchema,
  ILitResourceSchema,
} from '@lit-protocol/schemas';

export type AttenuationsObject = z.infer<typeof AttenuationsObjectSchema>;

export type CID = string;

export type ISessionCapabilityObject = z.infer<
  typeof ISessionCapabilityObjectSchema
>;

export type ILitResource = z.infer<typeof ILitResourceSchema>;

export type LitResourceAbilityRequest = z.infer<
  typeof LitResourceAbilityRequestSchema
>;
