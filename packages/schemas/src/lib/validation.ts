import { z } from 'zod';
import { fromError, isZodErrorLike } from 'zod-validation-error';

import { InvalidArgumentException } from '@lit-protocol/constants';

export function throwFailedValidation(
  functionName: string,
  params: unknown,
  e: unknown
): never {
  throw new InvalidArgumentException(
    {
      info: {
        params,
        function: functionName,
      },
      cause: isZodErrorLike(e) ? fromError(e) : e,
    },
    `Invalid params for ${functionName}. Check error for details.`
  );
}

export function applySchemaWithValidation<T>(
  functionName: string,
  params: T,
  schema: z.ZodType<T>
): T {
  try {
    return schema.parse(params);
  } catch (e) {
    throwFailedValidation(functionName, params, e);
  }
}
