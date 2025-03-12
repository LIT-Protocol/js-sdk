import { z } from "zod";

/**
 * Defines schemas for PKP permission scopes.
 * Handles both string inputs and bigint transformations for contract calls.
 */

// Valid scope values
export const SCOPE_VALUES = [
  "no-permissions",
  "sign-anything",
  "personal-sign",
] as const;
export type ScopeString = (typeof SCOPE_VALUES)[number];

// Mapping from string scopes to their bigint representation
export const SCOPE_MAPPING = {
  "no-permissions": 0n,
  "sign-anything": 1n,
  "personal-sign": 2n,
} as const;
export type ScopeBigInt = (typeof SCOPE_MAPPING)[ScopeString];

// Schema for string values (used in high-level APIs)
export const ScopeStringSchema = z.enum(SCOPE_VALUES);

// Schema that transforms strings to bigints (used in contract calls)
export const ScopeSchemaRaw = ScopeStringSchema.transform(
  (val) => SCOPE_MAPPING[val]
);
