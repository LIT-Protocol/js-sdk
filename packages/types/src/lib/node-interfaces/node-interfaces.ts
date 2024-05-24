/**
 * This file serves as a central location for all Lit node endpoints and their request/response interfaces & types.
 */

import { AuthMethod } from '../interfaces';

// pub struct JsonPKPClaimKeyRequest {
//   pub auth_method: AuthMethod,
//   pub credential_public_key: Option<String>,
// }
export interface JsonPKPClaimKeyRequest {
  authMethod: AuthMethod;
  credentialPublicKey?: string | null;
}
