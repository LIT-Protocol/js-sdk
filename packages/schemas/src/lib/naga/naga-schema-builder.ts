import { z } from 'zod';

/**
 * Generic response means your schema is wrapped inside.
 *
 * eg. handshake response
 *
 * @example
 * {
 *   ok: boolean,
 *   error: string | null,
 *   errorObject: any | null,
 *   data: <YOUR_SCHEMA>
 * }
 */
export const GenericResultBuilder = <T extends z.ZodTypeAny>(dataSchema: T) => {
  const baseSchema = z.object({
    ok: z.boolean(),
    error: z.string().nullable(),
    errorObject: z.any().nullable(),
    data: dataSchema,
  });

  return baseSchema.extend({}).transform((parsed) => ({
    ...parsed,
    parseData: () => {
      // Check if the response is successful
      if (!parsed.ok) {
        // If there's an error object, throw that; otherwise throw the error message
        if (parsed.errorObject) {
          throw parsed.errorObject;
        } else if (parsed.error) {
          throw new Error(parsed.error);
        } else {
          throw new Error('Request failed but no error information provided');
        }
      }

      // Return only the data portion
      return parsed.data;
    },
  }));
};

/**
 * Generic result means your schema is wrapped inside:
 *
 * @example
 * {
 *   success: boolean,
 *   values: Array<YOUR_SCHEMA>
 */
export const GenericResultSchemaBuilder = <T extends z.ZodTypeAny>(
  dataSchema: T
) => {
  return z.object({
    success: z.literal(true),
    values: z.array(dataSchema),
  });
};

/**
 * Generic error result means your schema is wrapped inside:
 *
 * @example
 * {
 *   success: boolean,
 *   error: {
 *     name: string,
 *     message: string,
 *     details: any | null,
 *   }
 * }
 */
export const GenericErrorResultSchemaBuilder = () => {
  return z.object({
    success: z.literal(false),
    error: z.object({
      success: z.boolean().optional(),
      name: z.string().optional(),
      message: z.string(),
      details: z.any().optional(),
    }),
  });
};
