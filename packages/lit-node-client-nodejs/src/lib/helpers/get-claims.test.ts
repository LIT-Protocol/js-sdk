import { ClaimsList, Signature } from '@lit-protocol/types';

import { getClaims } from './get-claims';

describe('getClaims', () => {
  it('should return the correct claims object', () => {
    const claims: ClaimsList = [
      {
        claimKey: {
          signature:
            '09c8030422c182ff583005e1f28649f37543d6c7486a0b750a95e31b9b374ebe7d5636c962c493ef5caa2bbb0795f86668e4ffd1de3bea8606aefbc0d8e88bd31b',
          derivedKeyId:
            'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
        },
      },
      {
        claimKey: {
          signature:
            'c8395ddc0b3fd9de46e4342656eddf13750f34d8b062d32a31dfa15430d6c4d901245be4aaa17a316124057740f3166c249fae93a1fa826b7f60aea4783fc9ca1b',
          derivedKeyId:
            'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
        },
      },
      {
        claimKey: {
          signature:
            '96972387c7322f29172936baebd516461fff7e0dee7f378bb258d88bd0109e582425e0211db85fce47da34729bb70b8aed07b79d6be6b1553907e21069e4186e1b',
          derivedKeyId:
            'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
        },
      },
    ];

    const expectedClaims: Record<
      string,
      { signatures: Signature[]; derivedKeyId: string }
    > = {
      claimKey: {
        signatures: [
          {
            r: '0x09c8030422c182ff583005e1f28649f37543d6c7486a0b750a95e31b9b374ebe',
            s: '0x7d5636c962c493ef5caa2bbb0795f86668e4ffd1de3bea8606aefbc0d8e88bd3',
            v: 27,
          },
          {
            r: '0xc8395ddc0b3fd9de46e4342656eddf13750f34d8b062d32a31dfa15430d6c4d9',
            s: '0x01245be4aaa17a316124057740f3166c249fae93a1fa826b7f60aea4783fc9ca',
            v: 27,
          },
          {
            r: '0x96972387c7322f29172936baebd516461fff7e0dee7f378bb258d88bd0109e58',
            s: '0x2425e0211db85fce47da34729bb70b8aed07b79d6be6b1553907e21069e4186e',
            v: 27,
          },
        ],
        derivedKeyId:
          'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
      },
    };

    const result = getClaims(claims);

    expect(result).toEqual(expectedClaims);
  });

  it('should return the correct claims object with different claims', () => {
    const claims: ClaimsList = [
      {
        bar: {
          signature:
            '2e0ac9ccbb7bb72e626f6732c6b56cbc3382c2f091285c4a5ac68c22f7de08840e80e92924caa18e95fcd3bdfd6741f1b7e470b2d9300a0516100af5642f3df51b',
          derivedKeyId:
            '2bb0c99d5f677bb564a0a2f9228e2d69ec823df5c7b2b019507e3ac1c02c5ea2',
        },
        foo: {
          signature:
            '952714bafa338ab816152c26b4da10b4cbf28a8594ee061f4ba0f614269ffb233b5055723fe4f11e86e9cd3a09ad9d5ac827d5c19b29834e5ed871748f90462f1c',
          derivedKeyId:
            'fb8559bcf5e49b3d581c7108f7885922531bb82fafd319c988c00ca12399ac88',
        },
      },
      {
        bar: {
          signature:
            'be5f34b1e3ae79b93ae6c5f62e443b2fa29a3b8f9582bae6156badf7bb374b02113b0b053f2abf84d17b4beeefd4945b13636bd338df827487e2fad3bfd346021b',
          derivedKeyId:
            '2bb0c99d5f677bb564a0a2f9228e2d69ec823df5c7b2b019507e3ac1c02c5ea2',
        },
        foo: {
          signature:
            'b96f2ce3854705c6e24e76714303fb9b122ebe40dcc4007d30dd2bac8e3e8acb2172d1eb191c27566a3123c6038c0cb3b0c87326ec5942ef9c724e3a01f77f7d1b',
          derivedKeyId:
            'fb8559bcf5e49b3d581c7108f7885922531bb82fafd319c988c00ca12399ac88',
        },
      },
      {
        bar: {
          signature:
            '6de2630fadf9ba2f43c53be82a52a7a8d7209d68dfbbc5d4edd6670423093c937488e14cc792f7db7d99f143bff6e358aa2c5a4294f7d14a39ee6afe521e86891c',
          derivedKeyId:
            '2bb0c99d5f677bb564a0a2f9228e2d69ec823df5c7b2b019507e3ac1c02c5ea2',
        },
        foo: {
          signature:
            '55526b8437e45e31c462b31bccc57f30aeb393bd2500621bdc019aee99ad0f864830e21068a02b2b537697103eaa7d313344703b55b2f82bc927f54bd7be9d751c',
          derivedKeyId:
            'fb8559bcf5e49b3d581c7108f7885922531bb82fafd319c988c00ca12399ac88',
        },
      },
    ];

    const expectedClaims: Record<
      string,
      { signatures: Signature[]; derivedKeyId: string }
    > = {
      bar: {
        signatures: [
          {
            r: '0x2e0ac9ccbb7bb72e626f6732c6b56cbc3382c2f091285c4a5ac68c22f7de0884',
            s: '0x0e80e92924caa18e95fcd3bdfd6741f1b7e470b2d9300a0516100af5642f3df5',
            v: 27,
          },
          {
            r: '0xbe5f34b1e3ae79b93ae6c5f62e443b2fa29a3b8f9582bae6156badf7bb374b02',
            s: '0x113b0b053f2abf84d17b4beeefd4945b13636bd338df827487e2fad3bfd34602',
            v: 27,
          },
          {
            r: '0x6de2630fadf9ba2f43c53be82a52a7a8d7209d68dfbbc5d4edd6670423093c93',
            s: '0x7488e14cc792f7db7d99f143bff6e358aa2c5a4294f7d14a39ee6afe521e8689',
            v: 28,
          },
        ],
        derivedKeyId:
          '2bb0c99d5f677bb564a0a2f9228e2d69ec823df5c7b2b019507e3ac1c02c5ea2',
      },
      foo: {
        signatures: [
          {
            r: '0x952714bafa338ab816152c26b4da10b4cbf28a8594ee061f4ba0f614269ffb23',
            s: '0x3b5055723fe4f11e86e9cd3a09ad9d5ac827d5c19b29834e5ed871748f90462f',
            v: 28,
          },
          {
            r: '0xb96f2ce3854705c6e24e76714303fb9b122ebe40dcc4007d30dd2bac8e3e8acb',
            s: '0x2172d1eb191c27566a3123c6038c0cb3b0c87326ec5942ef9c724e3a01f77f7d',
            v: 27,
          },
          {
            r: '0x55526b8437e45e31c462b31bccc57f30aeb393bd2500621bdc019aee99ad0f86',
            s: '0x4830e21068a02b2b537697103eaa7d313344703b55b2f82bc927f54bd7be9d75',
            v: 28,
          },
        ],
        derivedKeyId:
          'fb8559bcf5e49b3d581c7108f7885922531bb82fafd319c988c00ca12399ac88',
      },
    };

    const result = getClaims(claims);

    expect(result).toEqual(expectedClaims);
  });
});
