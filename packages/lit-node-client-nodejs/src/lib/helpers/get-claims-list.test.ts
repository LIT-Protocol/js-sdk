import { NodeShare } from '@lit-protocol/types';
import { getClaimsList } from './get-claims-list';

describe('getClaimsList', () => {
  it('should return an empty array if responseData is empty', () => {
    const responseData: NodeShare[] = [];
    const result = getClaimsList(responseData);
    expect(result).toEqual([]);
  });

  it('should parse the real data correctly', () => {
    const responseData = [
      {
        success: true,
        signedData: {},
        decryptedData: {},
        claimData: {
          foo: {
            signature:
              '36ffccaec30f52730dcc6fa411383dd23233be55da5bce7e9e0161dc88cfd0541a7f18f9dbb37677f660bc812ff6d29c1c3f92cb7245c0e20f97787ff3324ad31c',
            derivedKeyId:
              '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
          },
        },
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {},
        decryptedData: {},
        claimData: {
          foo: {
            signature:
              'ac4e1b37a969af3a03331dabb9418d137cec9e8b366ff7cafcf6688ff07b15d070c42c8c16b0f945ea03653a0d286f2f59fdef529db38e7c33b65aae4b287ce71b',
            derivedKeyId:
              '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
          },
        },
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {},
        decryptedData: {},
        claimData: {
          foo: {
            signature:
              'fd5bad778bd70ece43616c0531b13a70bf9b0a853d38aa7b92560a0070e59e7b619979bc79b1ac2dc6886b44a2bdb402e5804a00d010f415d8cf5c6673540d131c',
            derivedKeyId:
              '22c14f271322473459c456056ffc6e1c0dc1efcb2d15e5be538ad081b224b3d0',
          },
        },
        response: '',
        logs: '',
      },
    ] as NodeShare[];

    const result = getClaimsList(responseData);

    expect(result).toEqual([
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
    ]);
  });
});
