import { LitNodeClient } from './lit-node-client';
let client: LitNodeClient;

jest.setTimeout(60000);

describe('LitNodeClient static methods', () => {
  it('Should combine claim responses', () => {
    const nodeclaimResponses = [
      {
        foo: {
          keyId: 'abc1234',
          signature:
            'f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b',
        },
        bar: {
          keyId: 'xyz1234',
          signature:
            'f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b',
        },
      },
      {
        foo: {
          keyId: 'abc1234',
          signature:
            'f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b',
        },
        bar: {
          keyId: 'xyz1234',
          signature:
            'f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b',
        },
      },
      {
        foo: {
          keyId: 'abc1234',
          signature:
            'f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b',
        },
        bar: {
          keyId: 'xyz1234',
          signature:
            'f84ad3d3efa42abcae2b3567c836f1342552a75ed038e9403b77a7c47e3500242572c86ddee7f9af4994793a741111553ac7652897ee5447b143b8067557a3511b',
        },
      },
    ];

    const combinedClaims = LitNodeClient.getClaims(nodeclaimResponses);
    expect(Object.keys(combinedClaims).length).toEqual(2);
    expect(combinedClaims['foo'].signatures.length).toEqual(3);
  });
});
