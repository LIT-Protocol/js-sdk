import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
  LitRLIResource,
  parseLitResource,
} from './resources';

const testVectors = [
  {
    resourceKey: 'lit-accesscontrolcondition://someResource',
    expectedLitResource: new LitAccessControlConditionResource('someResource'),
  },
  {
    resourceKey: 'lit-pkp://someResource',
    expectedLitResource: new LitPKPResource('someResource'),
  },
  {
    resourceKey: 'lit-ratelimitincrease://someResource',
    expectedLitResource: new LitRLIResource('someResource'),
  },
  {
    resourceKey: 'lit-litaction://someResource',
    expectedLitResource: new LitActionResource('someResource'),
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
