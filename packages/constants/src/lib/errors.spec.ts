// @ts-nocheck
import { VError } from '@openagenda/verror';

import { LIT_ERROR, UnknownError, MultiError } from './errors';

describe('Lit Errors have correct format', () => {
  it('returns correct format', () => {
    Object.entries(LIT_ERROR).forEach((entry) => {
      const errorPropName = entry[0];
      const errorName = entry[1].name;
      const errorCode = entry[1].code;

      let expectedErrorName = errorPropName.toLowerCase();
      const expectedErrorCode = errorPropName.toLowerCase();

      expectedErrorName = expectedErrorName.split('_').map((section) => {
        const chars = [];

        section.split('').forEach((c, i) => {
          if (i == 0) {
            chars.push(c.toUpperCase());
          } else {
            chars.push(c);
          }
        });

        return chars.join('', '');
      });

      expectedErrorName = expectedErrorName.join('');

      expect(errorName).toBe(expectedErrorName);
      expect(errorCode).toBe(expectedErrorCode);
    });
  });

  it('Lit Custom Error has correct format', () => {
    const error = new UnknownError(
      {
        info: {
          foo: 'bar',
        },
        meta: {
          one: 'two',
        },
        cause: new Error('root cause'),
      },
      'unknown error'
    );

    expect(error.message).toBe('unknown error: root cause');
    expect(error.cause).toBeInstanceOf(Error);
    expect(error.cause.message).toBe('root cause');

    expect(VError.cause(error)).toBeInstanceOf(Error);
    expect(VError.cause(error).message).toBe('root cause');

    expect(VError.info(error)).toEqual({ foo: 'bar' });

    const unknownErrorMeta = {
      one: 'two',
      code: LIT_ERROR.UNKNOWN_ERROR.code,
      kind: LIT_ERROR.UNKNOWN_ERROR.kind,
    };
    expect(VError.meta(error)).toEqual(unknownErrorMeta);
  });

  it('MultiError has correct format', () => {
    const errors = [
      new UnknownError(
        {
          info: {
            foo: 'bar',
          },
          meta: {
            one: 'two',
          },
          cause: new Error('root cause'),
        },
        'unknown error'
      ),
      new UnknownError(
        {
          info: {
            foo: 'bar',
          },
          meta: {
            one: 'two',
          },
          cause: new Error('root cause'),
          name: 'UnknownError',
        },
        'unknown error'
      ),
    ];
    const multiError = new MultiError(errors);

    expect(multiError.errors).toEqual(errors);
  });
});
