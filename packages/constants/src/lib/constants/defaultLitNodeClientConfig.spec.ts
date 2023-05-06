// @ts-nocheck
import { defaultLitnodeClientConfig } from './defaultLitNodeClientConfig';

describe('default lit node client config', () => {
  const keys = Object.keys(defaultLitnodeClientConfig);

  it('has all the required properties', () => {
    expect(keys.length).toBeGreaterThanOrEqual(5);
  });

  it('has alertWhenUnauthorized property', () => {
    expect(keys.includes('alertWhenUnauthorized')).toBe(true);
  });
  it('has minNodeCount property', () => {
    expect(keys.includes('minNodeCount')).toBe(true);
  });
  it('has debug property', () => {
    expect(keys.includes('debug')).toBe(true);
  });
  it('has bootstrapUrls property', () => {
    expect(keys.includes('bootstrapUrls')).toBe(true);
  });
  it('has litNetwork property', () => {
    expect(keys.includes('litNetwork')).toBe(true);
  });
});
