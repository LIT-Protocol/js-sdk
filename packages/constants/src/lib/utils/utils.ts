import { EITHER_TYPE } from '../enums';
import { IEither, ILitError } from '../interfaces/i-errors';

/**
 *
 * This method should be used when there's an expected error
 *
 * @param errorMsg is the error message
 * @returns { IEither }
 */
export function ELeft<T>(errorMsg: ILitError): IEither<T> {
  return {
    type: EITHER_TYPE.ERROR,
    result: errorMsg,
  };
}

/**
 *
 * This method should be used when there's an expected success outcome
 *
 * @param result is the successful return value
 * @returns
 */
export function ERight<T>(result: T): IEither<T> {
  return {
    type: EITHER_TYPE.SUCCESS,
    result,
  };
}
