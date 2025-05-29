// Generic response wrapper schema for all API responses in this network
// For this network, responses are plain (not wrapped), so this acts as a pass-through
// See Naga-Local for example

import { z } from 'zod';

// but adds parseData() method for API compatibility across networks
export const GenericResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) => {
  // Return the dataSchema with a transform that adds parseData() method
  return dataSchema.transform((parsed) => ({
    ...parsed,
    parseData: () => {
      return parsed;
    },
  }));
};
