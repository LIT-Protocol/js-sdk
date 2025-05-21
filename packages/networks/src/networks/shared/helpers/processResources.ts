import {
  isResourceShorthandInput,
  ResourceShorthandInput,
  transformShorthandResources,
} from '@lit-protocol/auth-helpers';
import { AuthConfigSchema } from '@lit-protocol/schemas';
import { LitResourceAbilityRequest } from '@lit-protocol/types';
import { z } from 'zod';

export type ShorthandResources =
  | z.infer<typeof AuthConfigSchema>['resources']
  | ResourceShorthandInput;

export type AuthConfigV2 = Omit<
  z.infer<typeof AuthConfigSchema>,
  'resources'
> & {
  resources: ShorthandResources;
};

export const processResources = (
  resources: ShorthandResources
): LitResourceAbilityRequest[] => {
  let processedResources: LitResourceAbilityRequest[];

  // Transform resources if they are in shorthand format
  if (isResourceShorthandInput(resources)) {
    processedResources = transformShorthandResources(resources);
  } else {
    // Type assertion: Assuming if not shorthand, it's already the correct full format.
    processedResources = resources as LitResourceAbilityRequest[];
  }

  return processedResources;
};
