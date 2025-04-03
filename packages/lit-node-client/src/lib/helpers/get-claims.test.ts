import { getClaims } from './get-claims';

describe('getClaims', () => {
  it('should return the correct claims object', () => {
    const claims = [
      {
        foo: {
          signature:
            '36ffccaec30f52730dcc6fa411383dd23233be55da5bce7e9e0161dc88cfd0541a7f18f9dbb37677f660bc812ff6d29c1c3f92cb7245c0e20f97787ff3324ad31c',
          derivedKeyId:
            '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
        },
      },
      {
        foo: {
          signature:
            'ac4e1b37a969af3a03331dabb9418d137cec9e8b366ff7cafcf6688ff07b15d070c42c8c16b0f945ea03653a0d286f2f59fdef529db38e7c33b65aae4b287ce71b',
          derivedKeyId:
            '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
        },
      },
      {
        foo: {
          signature:
            'fd5bad778bd70ece43616c0531b13a70bf9b0a853d38aa7b92560a0070e59e7b619979bc79b1ac2dc6886b44a2bdb402e5804a00d010f415d8cf5c6673540d131c',
          derivedKeyId:
            '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
        },
      },
    ];

    const expectedClaims = {
      foo: {
        signatures: [
          {
            r: '0x36ffccaec30f52730dcc6fa411383dd23233be55da5bce7e9e0161dc88cfd054',
            s: '0x1a7f18f9dbb37677f660bc812ff6d29c1c3f92cb7245c0e20f97787ff3324ad3',
            v: 28,
          },
          {
            r: '0xac4e1b37a969af3a03331dabb9418d137cec9e8b366ff7cafcf6688ff07b15d0',
            s: '0x70c42c8c16b0f945ea03653a0d286f2f59fdef529db38e7c33b65aae4b287ce7',
            v: 27,
          },
          {
            r: '0xfd5bad778bd70ece43616c0531b13a70bf9b0a853d38aa7b92560a0070e59e7b',
            s: '0x619979bc79b1ac2dc6886b44a2bdb402e5804a00d010f415d8cf5c6673540d13',
            v: 28,
          },
        ],
        derivedKeyId:
          '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
      },
    };

    const result = getClaims(claims);

    expect(result).toEqual(expectedClaims);
  });

  it('should return the correct claims object with different claims', () => {
    ``;
    const claims = [
      {
        foo: {
          signature:
            '36ffccaec30f52730dcc6fa411383dd23233be55da5bce7e9e0161dc88cfd0541a7f18f9dbb37677f660bc812ff6d29c1c3f92cb7245c0e20f97787ff3324ad31c',
          derivedKeyId:
            '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
        },
        bar: {
          signature:
            'ac4e1b37a969af3a03331dabb9418d137cec9e8b366ff7cafcf6688ff07b15d070c42c8c16b0f945ea03653a0d286f2f59fdef529db38e7c33b65aae4b287ce71b',
          derivedKeyId:
            '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
        },
      },
      {
        foo: {
          signature:
            'fd5bad778bd70ece43616c0531b13a70bf9b0a853d38aa7b92560a0070e59e7b619979bc79b1ac2dc6886b44a2bdb402e5804a00d010f415d8cf5c6673540d131c',
          derivedKeyId:
            '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
        },
        bar: {
          signature:
            'ac4e1b37a969af3a03331dabb9418d137cec9e8b366ff7cafcf6688ff07b15d070c42c8c16b0f945ea03653a0d286f2f59fdef529db38e7c33b65aae4b287ce71b',
          derivedKeyId:
            '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
        },
      },
    ];

    const expectedClaims = {
      foo: {
        signatures: [
          {
            r: '0x36ffccaec30f52730dcc6fa411383dd23233be55da5bce7e9e0161dc88cfd054',
            s: '0x1a7f18f9dbb37677f660bc812ff6d29c1c3f92cb7245c0e20f97787ff3324ad3',
            v: 28,
          },
          {
            r: '0xfd5bad778bd70ece43616c0531b13a70bf9b0a853d38aa7b92560a0070e59e7b',
            s: '0x619979bc79b1ac2dc6886b44a2bdb402e5804a00d010f415d8cf5c6673540d13',
            v: 28,
          },
        ],
        derivedKeyId:
          '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
      },
      bar: {
        signatures: [
          {
            r: '0xac4e1b37a969af3a03331dabb9418d137cec9e8b366ff7cafcf6688ff07b15d0',
            s: '0x70c42c8c16b0f945ea03653a0d286f2f59fdef529db38e7c33b65aae4b287ce7',
            v: 27,
          },
          {
            r: '0xac4e1b37a969af3a03331dabb9418d137cec9e8b366ff7cafcf6688ff07b15d0',
            s: '0x70c42c8c16b0f945ea03653a0d286f2f59fdef529db38e7c33b65aae4b287ce7',
            v: 27,
          },
        ],
        derivedKeyId:
          '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
      },
    };

    const result = getClaims(claims);

    expect(result).toEqual(expectedClaims);
  });
});
