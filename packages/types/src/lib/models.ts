import { z } from 'zod';

import {
  ILitResourceSchema,
  ISessionCapabilityObjectSchema,
  LitResourceAbilityRequestSchema,
} from '@lit-protocol/schemas';

export type CID = string;

export type ISessionCapabilityObject = z.infer<
  typeof ISessionCapabilityObjectSchema
>;

export type ILitResource = z.infer<typeof ILitResourceSchema>;

export type LitResourceAbilityRequest = z.infer<
  typeof LitResourceAbilityRequestSchema
>;
