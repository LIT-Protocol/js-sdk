import { EITHER_TYPE } from '../enums';
import { LitError } from '../errors';
import { IEitherSuccess, IEitherError } from '../interfaces/i-errors';

/**
 *
 * This method should be used when there's an expected error
 *
 * @param error is the error encountered
 * @returns { IEither }
 */
export function ELeft(error: LitError): IEitherError {
  return {
    type: EITHER_TYPE.ERROR,
    result: error,
  };
}

/**
 *
 * This method should be used when there's an expected success outcome
 *
 * @param result is the successful return value
 * @returns
 */
export function ERight<T>(result: T): IEitherSuccess<T> {
  return {
    type: EITHER_TYPE.SUCCESS,
    result,
  };
}
