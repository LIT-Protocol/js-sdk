import { NodeShare } from '@lit-protocol/types';
import { processLitActionResponseStrategy } from './process-lit-action-response-strategy';
import { assert } from 'console';

describe('processLitActionResponseStrategy', () => {
  const litActionResponses: any[] = [
    {
      success: true,
      signedData: {
        sig: {
          sigType: 'K256',
          dataSigned: 'fail',
          signatureShare: '',
          shareIndex: 0,
          bigR: '',
          publicKey: '',
          sigName: 'sig',
        },
      },
      decryptedData: {},
      claimData: {},
      response: '{"hello":"world","res": "71"}',
      logs: 'is_leader: false\nwaiting for response using collect\ncollect from leader: 4\n',
    },
    {
      success: true,
      signedData: {
        sig: {
          sigType: 'K256',
          dataSigned: 'fail',
          signatureShare: '',
          shareIndex: 0,
          bigR: '',
          publicKey: '',
          sigName: 'sig',
        },
      },
      decryptedData: {},
      claimData: {},
      response: '{"hello":"world","res":{}}',
      logs: 'is_leader: false\nwaiting for response using collect\ncollect from leader: 4\n',
    },
    {
      success: true,
      signedData: {
        sig: {
          sigType: 'K256',
          dataSigned:
            '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
          signatureShare:
            '"E90BAE64AFA7C571CE41BEF25FF771CA2F1BC20FC09A7762200552B30ACC0CDC"',
          shareIndex: 0,
          bigR: '"02330092EBF809B05EA0A032A42AD2FE32579D997A739D7BB4CF40EBA83B4355D3"',
          publicKey:
            '"047E3AC46588256338E62D8763592B8AA9BD13C31C9326D51CE82254A1839759A4FE7C1281AA1A9F8E810DA52B72046731CB3EE4D213799F7CE26C55A63783DB78"',
          sigName: 'sig',
        },
      },
      decryptedData: {},
      claimData: {},
      response: '{"hello":"world","res":{}}',
      logs: 'is_leader: false\nwaiting for response using collect\ncollect from leader: 4\n',
    },
    {
      success: true,
      signedData: {
        sig: {
          sigType: 'K256',
          dataSigned:
            '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
          signatureShare:
            '"31977D4BE7F49C0CD97CC0756CCA3244A949EA7D591F79B64F324846507448CD"',
          shareIndex: 0,
          bigR: '"02330092EBF809B05EA0A032A42AD2FE32579D997A739D7BB4CF40EBA83B4355D3"',
          publicKey:
            '"047E3AC46588256338E62D8763592B8AA9BD13C31C9326D51CE82254A1839759A4FE7C1281AA1A9F8E810DA52B72046731CB3EE4D213799F7CE26C55A63783DB78"',
          sigName: 'sig',
        },
      },
      decryptedData: {},
      claimData: {},
      response: '{"hello":"world","res":{}}',
      logs: 'is_leader: true\nresponse: 4\n',
    },
    {
      success: true,
      signedData: {
        sig: {
          sigType: 'K256',
          dataSigned:
            '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
          signatureShare:
            '"F21798A1A37CC86566EA0D751F37CC144774A1A8A4FCD5E6E64287690FB60119"',
          shareIndex: 0,
          bigR: '"02330092EBF809B05EA0A032A42AD2FE32579D997A739D7BB4CF40EBA83B4355D3"',
          publicKey:
            '"047E3AC46588256338E62D8763592B8AA9BD13C31C9326D51CE82254A1839759A4FE7C1281AA1A9F8E810DA52B72046731CB3EE4D213799F7CE26C55A63783DB78"',
          sigName: 'sig',
        },
      },
      decryptedData: {},
      claimData: {},
      response: '{"hello":"world","res":{}}',
      logs: 'is_leader: false\nwaiting for response using collect\ncollect from leader: 4\n',
    },
    {
      success: true,
      signedData: {
        sig: {
          sigType: 'K256',
          dataSigned:
            '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
          signatureShare:
            '"7ECB0E020BED801905D3FE941751E4313086603BBBF21F1756832F02A6FBE567"',
          shareIndex: 0,
          bigR: '"02330092EBF809B05EA0A032A42AD2FE32579D997A739D7BB4CF40EBA83B4355D3"',
          publicKey:
            '"047E3AC46588256338E62D8763592B8AA9BD13C31C9326D51CE82254A1839759A4FE7C1281AA1A9F8E810DA52B72046731CB3EE4D213799F7CE26C55A63783DB78"',
          sigName: 'sig',
        },
      },
      decryptedData: {},
      claimData: {},
      response: '{"hello":"world","res":{}}',
      logs: 'is_leader: false\nwaiting for response using collect\ncollect from leader: 4\n',
    },
  ];
  it('should find least common response', () => {
    let resp = processLitActionResponseStrategy(litActionResponses, {
      strategy: 'leastCommon',
    });
    expect(resp.res).toBe('71');
  });

  it('should find most common response', () => {
    let resp = processLitActionResponseStrategy(litActionResponses, {
      strategy: 'mostCommon',
    });
    expect(resp.res).toBeDefined();
  });

  it('should find most common response', () => {
    let resp = processLitActionResponseStrategy(litActionResponses, {
      strategy: 'custom',
      customFilter: (responses) => {
        return responses[0];
      }
    });
    expect(resp).toBeDefined();
    expect(resp.res).toBeDefined();
    expect(resp.res).toBe('71');
  });
});
