import { initWasmEcdsaSdk } from '@lit-protocol/ecdsa-sdk';
import { SigResponse } from '@lit-protocol/types';

import { getSignatures } from './get-signatures';

describe('getSignatures', () => {
  beforeAll(async () => {
    await initWasmEcdsaSdk();
  });

  it('should return signatures object', () => {
    const networkPubKeySet = 'testing';
    const minNodeCount = 1;
    const signedData = [
      {
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
      {
        sig: {
          sigType: 'K256',
          dataSigned:
            '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
          signatureShare:
            '1301BE04CF3A269709C2BDC29F7EFD1FBB3FC037C00AD2B5BDA8726B74CB5AF4',
          shareIndex: 0,
          bigR: '0290947D801A421D4A347FFFD386703C97BEF8E8AC83C3AB256ACE09255C37C521',
          publicKey:
            '04423427A87DEE9420BAC5C38355FE4A8C30EA796D87950C0143B49422D88C8FC70C381CB45300D8AD8A95139FFEEA5F265EFE00B65481BBB97B311C6833B69AE3',
          sigName: 'sig',
        },
      },
      {
        sig: {
          sigType: 'K256',
          dataSigned:
            '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
          signatureShare:
            'F649B4CEAEE015877161AC8F062270200F65EC166C9BD7BF6F877EBB345F2F8F',
          shareIndex: 0,
          bigR: '0290947D801A421D4A347FFFD386703C97BEF8E8AC83C3AB256ACE09255C37C521',
          publicKey:
            '04423427A87DEE9420BAC5C38355FE4A8C30EA796D87950C0143B49422D88C8FC70C381CB45300D8AD8A95139FFEEA5F265EFE00B65481BBB97B311C6833B69AE3',
          sigName: 'sig',
        },
      },
    ];
    const requestId = '';

    const signatures = getSignatures<{ sig: SigResponse }>({
      networkPubKeySet,
      minNodeCount,
      signedData,
      requestId,
    });

    console.log('signatures:', signatures.sig);

    expect(signatures.sig).toHaveProperty('publicKey');
    expect(signatures.sig).toHaveProperty('r');
    expect(signatures.sig).toHaveProperty('recid');
    expect(signatures.sig).toHaveProperty('s');
    expect(signatures.sig).toHaveProperty('signature');
    expect(signatures.sig.dataSigned).toBe(
      '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4'
    );
    expect(signatures.sig.publicKey).toBe(
      '04423427A87DEE9420BAC5C38355FE4A8C30EA796D87950C0143B49422D88C8FC70C381CB45300D8AD8A95139FFEEA5F265EFE00B65481BBB97B311C6833B69AE3'
    );
    expect(signatures.sig.r).toBe(
      '90947d801a421d4a347fffd386703c97bef8e8ac83c3ab256ace09255c37c521'
    );
    expect(signatures.sig.recid).toBe(0);
    expect(signatures.sig.s).toBe(
      '094b72d37e1a3c1e7b246a51a5a16d410ff6cf677d5e0a396d5d9299d8f44942'
    );
    expect(signatures.sig.signature).toBe(
      '0x90947d801a421d4a347fffd386703c97bef8e8ac83c3ab256ace09255c37c521094b72d37e1a3c1e7b246a51a5a16d410ff6cf677d5e0a396d5d9299d8f449421b'
    );
  });
});
