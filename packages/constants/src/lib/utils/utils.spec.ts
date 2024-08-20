import { ELeft, ERight } from './utils';
import { UnknownError } from '../errors';

describe('error handling utils ELeft/Right works', () => {
  const unknownError = new UnknownError({}, 'ERROR');
  const res = ELeft(unknownError);
  const res2 = ERight('ANSWER');

  it('returns result on ELeft()', () => {
    expect(res.result).toBe(unknownError);
  });

  it('returns type on ELeft()', () => {
    expect(res.type).toBe('ERROR');
  });

  it('returns result on ERight()', () => {
    expect(res2.result).toBe('ANSWER');
  });

  it('returns type on ERight()', () => {
    expect(res2.type).toBe('SUCCESS');
  });
});
