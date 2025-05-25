import { ResourceShorthandInput } from '@lit-protocol/auth-helpers';
import { AuthMethod } from '@lit-protocol/types';
import { Hex } from 'viem';
import { z } from 'zod';
import { AuthConfigSchema } from '../AuthManager/authContexts/BaseAuthContextType';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { AUTH_METHOD_TYPE_VALUES } from '@lit-protocol/constants';
// Interface for the job status response
export interface JobStatusResponse {
  jobId: string;
  name: string;
  state:
    | 'pending'
    | 'active'
    | 'completed'
    | 'failed'
    | 'delayed'
    | 'waiting'
    | 'error'
    | 'unknown'; // Added 'error' based on potential states
  progress: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  returnValue?: any;
  error?: any; // To capture any error messages from the job itself
}

// export const AuthDataSchema = z.object({
//   authMethodId: HexPrefixedSchema,
//   authMethodType: z.custom<AUTH_METHOD_TYPE_VALUES>(),
// });

// export type AuthData = z.infer<typeof AuthDataSchema>;

// export interface AuthData extends AuthMethod {
//   authMethodId: Hex;
// }

export type ShorthandResources =
  | z.infer<typeof AuthConfigSchema>['resources']
  | ResourceShorthandInput;

export type AuthConfigV2 = Partial<Omit<
  z.infer<typeof AuthConfigSchema>,
  'resources'
>> & {
  resources: ShorthandResources;
};
