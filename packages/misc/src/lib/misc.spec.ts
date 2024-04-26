// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import { LitErrorKind, LIT_ERROR } from '@lit-protocol/constants';
import * as utilsModule from './misc';

describe('utils', () => {
  /**
   * Print Error
   */
  it('should console.log with name, message and stack', () => {
    let err: Error;

    try {
      throw new Error('Test Error');
    } catch (e) {
      err = e as Error;
    }

    console.log = jest.fn();

    utilsModule.printError(err);

    expect((console.log as any).mock.calls[0][0]).toBe('Error Stack');
    expect((console.log as any).mock.calls[1][0]).toBe('Error Name');
    expect((console.log as any).mock.calls[2][0]).toBe('Error Message');
  });

  it('should get the most common string in an array', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 8];

    const mostOccured = utilsModule.mostCommonString(arr);

    expect(mostOccured).toBe(8);
  });

  it('should get the last element of the array if every element only appears once', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    const mostOccured = utilsModule.mostCommonString(arr);

    expect(mostOccured).toBe(0);
  });

  it('should throwError in the Lit standardized way', () => {
    let err: Error;

    try {
      err = utilsModule.throwError({
        message: 'Message!',
        errorKind: 'hello',
        errorCode: 'world',
      });
    } catch (e) {
      err = e as Error;
    }

    const keys = Object.keys(err);
    const values = Object.values(err);

    expect(keys).toContain('message');
    expect(keys).toContain('errorKind');
    expect(keys).toContain('errorCode');
    expect(values).toContain('Message!');
    expect(values).toContain('hello');
    expect(values).toContain('world');
  });

  // it('should able to use the error type from constants', () => {
  //   let err: Error;

  //   try {
  //     err = utilsModule.throwError({
  //       message: 'custom message',
  //       errorKind: LIT_ERROR.INVALID_PARAM_TYPE.kind,
  //       errorCode: LIT_ERROR.INVALID_PARAM_TYPE.name,
  //     });
  //   } catch (e) {
  //     err = e as Error;
  //   }

  //   const keys = Object.keys(err);
  //   const values = Object.values(err);

  //   expect(keys).toContain('message');
  //   expect(keys).toContain('errorKind');
  //   expect(keys).toContain('errorCode');
  //   expect(values).toContain('custom message');
  //   expect(values).toContain(LitErrorKind.Validation);
  //   expect(values).toContain(LIT_ERROR.INVALID_PARAM_TYPE.name);
  // });

  it('should get value type by a given value', () => {
    const fooString = 'fooString';
    const fooBool = true;
    const fooNumber = 6;
    const fooList: number[] = [1, 2, 3];
    const fooArray: Array<string> = ['a', 'b', 'c'];
    const fooTuple: [string, number] = ['hello', 10];
    const fooUint8Arr = new Uint8Array([1, 2, 3, 4, 5]);
    const fooUint16Arr = new Uint16Array([1, 2, 3, 4, 5]);
    const fooBlob = new Blob([fooUint8Arr as BlobPart], {});
    const fooFile = new File([fooUint8Arr as BlobPart], '');

    expect(utilsModule.getVarType(fooString)).toBe('String');
    expect(utilsModule.getVarType(fooBool)).toBe('Boolean');
    expect(utilsModule.getVarType(fooNumber)).toBe('Number');
    expect(utilsModule.getVarType(fooList)).toBe('Array');
    expect(utilsModule.getVarType(fooArray)).toBe('Array');
    expect(utilsModule.getVarType(fooTuple)).toBe('Array');
    expect(utilsModule.getVarType(fooUint8Arr)).toBe('Uint8Array');
    expect(utilsModule.getVarType(fooUint16Arr)).toBe('Uint16Array');
    expect(utilsModule.getVarType(fooBlob)).toBe('Blob');
    expect(utilsModule.getVarType(fooFile)).toBe('File');
  });

  it('should check type', () => {
    expect(
      utilsModule.checkType({
        value: 999,
        allowedTypes: ['Number'],
        paramName: 'paramName1',
        functionName: 'functionName1',
      })
    ).toBe(true);

    expect(
      utilsModule.checkType({
        value: 'foo',
        allowedTypes: ['Number', 'String'],
        paramName: 'paramName2',
        functionName: 'functionName2',
      })
    ).toBe(true);

    expect(
      utilsModule.checkType({
        value: [1, 2],
        allowedTypes: ['Number', 'Array'],
        paramName: 'paramName3',
        functionName: 'functionName3',
      })
    ).toBe(true);

    expect(
      utilsModule.checkType({
        value: new Uint8Array([1, 2, 3]),
        allowedTypes: ['String', 'Uint8Array'],
        paramName: 'paramName4',
        functionName: 'functionName4',
      })
    ).toBe(true);
  });

  it('should check auth type', () => {
    const authSig = {
      sig: '',
      derivedVia: 'web3.eth.personal.sign',
      signedMessage:
        'I am creating an account to use Lit Protocol at 2022-04-12T09:23:31.290Z',
      address: '0x7e7763BE1379Bb48AFEE4F5c232Fb67D7c03947F',
    };

    expect(
      utilsModule.checkIfAuthSigRequiresChainParam(authSig, 'ethereum', 'fName')
    ).toBe(true);

    expect(
      utilsModule.checkIfAuthSigRequiresChainParam(
        {
          ethereum: 'foo',
        },
        '123',
        'fName'
      )
    ).toBe(true);
  });

  it('should run the same callback as many time as configured for retry', async () => {
    let cb = async (
      _id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      cb.count = cb.count ? (cb.count += 1) : 1;
      return {
        success: false,
        error: 'blah blah',
      };
    };

    let res = await utilsModule.executeWithRetry(
      cb,
      (err: any, requestId: string, isFinal: boolean) => {
        console.log('errr', err);
      }
    );

    // check that the counter matches the retry count.
    expect(cb.count).toEqual(3);
    expect(res.requestId).toBeDefined();

    cb.count = 0;
    res = await utilsModule.executeWithRetry(
      cb,
      (err: any, requestId: string, isFinal: boolean) => {
        console.log('errr', err);
      },
      {
        timeout: 31_000,
        interval: 100,
        maxRetryCount: 10,
      }
    );

    expect(cb.count).toEqual(10);
  });

  it('should only run once if request returns success', async () => {
    let cb = async (
      _id: string
    ): Promise<SuccessNodePromises<any> | RejectedNodePromises> => {
      cb.count = cb.count ? (cb.count += 1) : 1;
      return {
        success: true,
        values: [{ foo: 'bar' }],
      };
    };

    const res = await utilsModule.executeWithRetry(
      cb,
      (err: any, requestId: string, isFinal: boolean) => {
        console.log('errr', err);
      }
    );

    expect(cb.count).toBe(1);
    expect(res.requestId).toBeDefined();
  });
});
describe('find most common tings', () => {
  it('should return the most common string in an array', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 8];

    const mostOccured = utilsModule.mostCommonString(arr);

    expect(mostOccured).toBe(8);
  });

  it('should return the last element of the array if every element only appears once', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    const mostOccured = utilsModule.mostCommonString(arr);

    expect(mostOccured).toBe(0);
  });

  it('should test real world example of responseData', () => {
    const responseData = [
      {
        success: true,
        signedData: {
          sig: {
            sigType: 'ECDSA_CAIT_SITH',
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
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {
          sig: {
            sigType: 'ECDSA_CAIT_SITH',
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
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {
          sig: {
            sigType: 'ECDSA_CAIT_SITH',
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
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {
          sig: {
            sigType: 'ECDSA_CAIT_SITH',
            dataSigned:
              '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
            signatureShare:
              '"A2022A52D6263F5AD61D1A4E29F2C2545FA6E711A30A35BF3456FD5297E4080A"',
            shareIndex: 0,
            bigR: '"035938946F745C3A6E8B8F0DF7849B0693AAB779695BA770F76906562F37DD005F"',
            publicKey:
              '"049C6E2DD71F553A29398FA0A93BBCB411EE442D97D253D9E82F41C8601B19BCD71F37F0A2A0A0F501593153C3FD2C9EC3A2BDFA8E43291B7B0E165A3E104BF0B2"',
            sigName: 'sig',
          },
        },
        decryptedData: {},
        claimData: {},
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {
          sig: {
            sigType: 'ECDSA_CAIT_SITH',
            dataSigned:
              '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
            signatureShare:
              '"35790072188D520CDAA61394BB822C4F9D95CC2FC21CBAF54EBB91FA8734F5FE"',
            shareIndex: 0,
            bigR: '"035938946F745C3A6E8B8F0DF7849B0693AAB779695BA770F76906562F37DD005F"',
            publicKey:
              '"049C6E2DD71F553A29398FA0A93BBCB411EE442D97D253D9E82F41C8601B19BCD71F37F0A2A0A0F501593153C3FD2C9EC3A2BDFA8E43291B7B0E165A3E104BF0B2"',
            sigName: 'sig',
          },
        },
        decryptedData: {},
        claimData: {},
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {
          sig: {
            sigType: 'ECDSA_CAIT_SITH',
            dataSigned:
              '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
            signatureShare:
              '"A1676E25812D6812BB24469943A15F68FAD4CC679E0376CE1EDD5E0D64236E7A"',
            shareIndex: 0,
            bigR: '"035938946F745C3A6E8B8F0DF7849B0693AAB779695BA770F76906562F37DD005F"',
            publicKey:
              '"049C6E2DD71F553A29398FA0A93BBCB411EE442D97D253D9E82F41C8601B19BCD71F37F0A2A0A0F501593153C3FD2C9EC3A2BDFA8E43291B7B0E165A3E104BF0B2"',
            sigName: 'sig',
          },
        },
        decryptedData: {},
        claimData: {},
        response: '',
        logs: '',
      },
      {
        success: true,
        signedData: {
          sig: {
            sigType: 'ECDSA_CAIT_SITH',
            dataSigned:
              '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
            signatureShare:
              '"3E8184B2E3DC4725A711D4DBF8D32288A8AC4F31FD04B8ACB302B9BB3D209122"',
            shareIndex: 0,
            bigR: '"035938946F745C3A6E8B8F0DF7849B0693AAB779695BA770F76906562F37DD005F"',
            publicKey:
              '"049C6E2DD71F553A29398FA0A93BBCB411EE442D97D253D9E82F41C8601B19BCD71F37F0A2A0A0F501593153C3FD2C9EC3A2BDFA8E43291B7B0E165A3E104BF0B2"',
            sigName: 'sig',
          },
        },
        decryptedData: {},
        claimData: {},
        response: '',
        logs: '',
      },
    ];

    const mostCommonResponse = utilsModule.findMostCommonResponse(responseData);

    expect(mostCommonResponse).toEqual({
      success: true,
      signedData: {
        sig: {
          sigType: 'ECDSA_CAIT_SITH',
          dataSigned:
            '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
          signatureShare:
            '"3E8184B2E3DC4725A711D4DBF8D32288A8AC4F31FD04B8ACB302B9BB3D209122"',
          shareIndex: 0,
          bigR: '"035938946F745C3A6E8B8F0DF7849B0693AAB779695BA770F76906562F37DD005F"',
          publicKey:
            '"049C6E2DD71F553A29398FA0A93BBCB411EE442D97D253D9E82F41C8601B19BCD71F37F0A2A0A0F501593153C3FD2C9EC3A2BDFA8E43291B7B0E165A3E104BF0B2"',
          sigName: 'sig',
        },
      },
      decryptedData: {},
      claimData: {},
      response: undefined,
      logs: undefined,
    });
  });
  it('should return the most common response object', () => {
    const responses = [
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
      {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
    ];

    const expectedResult = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };

    const result = utilsModule.findMostCommonResponse(responses);

    expect(result).toEqual(expectedResult);
  });
});
