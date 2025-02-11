import * as ethers from 'ethers';
import { joinSignature } from 'ethers/lib/utils';

import { SigShare } from '@lit-protocol/types';

import { combineEcdsaShares } from './crypto';

describe('combine ECDSA Shares', () => {
  it('Should recombine ECDSA signature shares', async () => {
    const sigShares: SigShare[] = [
      {
        sigType: 'ECDSA_CAIT_SITH' as const,
        signatureShare:
          'BC8108AD9CAE8358942BB4B27632B87FFA705CCB675F85A59847CC1B84845A38',
        bigR: '03E6D15C805443F57F57E180C730C2FCA5297F7671E8148A669410808AB4D70122',
        publicKey:
          '03AECABDF2EDC1194BED6FE9650F08D109C77D2526236EA3F6C20F88E0675643BC',
        dataSigned:
          '90AB86E6389AA65B56D701E36EEECD786242405C792ED863C395FA7C55E517A4',
        sigName: 'sig',
      },
      {
        sigType: 'K256' as const,
        signatureShare:
          'BA77EB500884A60583DEA49578D4BB64BB55EF497F37C88DF935D739CE8E0A9F',
        bigR: '03E6D15C805443F57F57E180C730C2FCA5297F7671E8148A669410808AB4D70122',
        publicKey:
          '03AECABDF2EDC1194BED6FE9650F08D109C77D2526236EA3F6C20F88E0675643BC',
        dataSigned:
          '90AB86E6389AA65B56D701E36EEECD786242405C792ED863C395FA7C55E517A4',
        sigName: 'sig',
      },
      {
        sigType: 'ECDSA_CAIT_SITH' as const,
        signatureShare:
          'EF850AE61B6D658976B2560B880BF03ABC1A070BACDEAE2311781F65A524F245',
        bigR: '03E6D15C805443F57F57E180C730C2FCA5297F7671E8148A669410808AB4D70122',
        publicKey:
          '03AECABDF2EDC1194BED6FE9650F08D109C77D2526236EA3F6C20F88E0675643BC',
        dataSigned:
          '90AB86E6389AA65B56D701E36EEECD786242405C792ED863C395FA7C55E517A4',
        sigName: 'sig',
      },
    ];

    const sig = await combineEcdsaShares(sigShares);
    expect(sig.r).toBeDefined();
    expect(sig.s).toBeDefined();
    expect(sig.recid).toBeDefined();

    const sigRes = joinSignature({
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: sig.recid,
    });

    const msg = ethers.utils.arrayify('0x' + sigShares[0].dataSigned);
    const recoveredPk = ethers.utils.recoverPublicKey(msg, sigRes);

    // normalize the public keys to addresses and compare
    const addr = ethers.utils.computeAddress(
      ethers.utils.arrayify('0x' + sigShares[0].publicKey)
    );
    const recoveredAddr = ethers.utils.computeAddress(
      ethers.utils.arrayify(recoveredPk)
    );
    expect(recoveredAddr).toEqual(addr);
  });
});
