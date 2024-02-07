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
