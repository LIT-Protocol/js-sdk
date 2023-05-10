// @ts-nocheck
import { ELeft, ERight } from './utils';

describe('error handling utils ELeft/Right works', () => {
  const res = ELeft('ANSWER');
  const res2 = ERight('ANSWER');

  it('returns result on ELeft()', () => {
    expect(res.result).toBe('ANSWER');
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
