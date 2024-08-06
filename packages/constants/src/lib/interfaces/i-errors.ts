import { EITHER_TYPE_VALUES } from '../constants/constants';

export interface ILitError {
  message?: string;
  name?: string;
  errorCode?: string;
  errorKind?: string;
  error?: ILitErrorTypeParams;
}

export interface ILitErrorTypeParams {
  name: string;
  code: string;
}

/**
 * A standardized way to return either error or success
 */
export interface IEither<T> {
  type: EITHER_TYPE_VALUES;
  result: T | ILitError;
}
