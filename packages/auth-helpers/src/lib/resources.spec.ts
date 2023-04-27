import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
  LitRLIResource,
  LitWildcardResource,
  parseLitResource,
} from './resources';

const testVectors = [
  {
    resourceKey: 'lit/acc/someResource',
    expectedLitResource: new LitAccessControlConditionResource('someResource'),
  },
  {
    resourceKey: 'lit/pkp/someResource',
    expectedLitResource: new LitPKPResource('someResource'),
  },
  {
    resourceKey: 'lit/rli/someResource',
    expectedLitResource: new LitRLIResource('someResource'),
  },
  {
    resourceKey: 'lit/la/someResource',
    expectedLitResource: new LitActionResource('someResource'),
  },
  {
    resourceKey: 'lit/*/*',
    expectedLitResource: new LitWildcardResource(),
  },
];

describe('parseLitResource', () => {
  it('should parse the Lit resource correctly', () => {
    for (const testVector of testVectors) {
      const parsedLitResource = parseLitResource(testVector.resourceKey);
      expect(parsedLitResource).toEqual(testVector.expectedLitResource);
    }
  });
});
