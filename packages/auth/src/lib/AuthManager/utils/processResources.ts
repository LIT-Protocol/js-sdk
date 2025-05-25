import {
  isResourceShorthandInput,
  transformShorthandResources,
} from '@lit-protocol/auth-helpers';
import { LitResourceAbilityRequest } from '@lit-protocol/types';
import { ShorthandResources } from '../../authenticators/types';

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
