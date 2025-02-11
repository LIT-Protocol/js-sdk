import {
  cleanStringValues,
  convertKeysToCamelCase,
  snakeToCamel,
} from '@lit-protocol/misc';
import { PKPSignEndpointResponse } from '@lit-protocol/types';

import { parsePkpSignResponse } from './parse-pkp-sign-response';

describe('parsePkpSignResponse', () => {
  it('should parse ECDSA PKP sign response correctly', () => {
    const responseData: PKPSignEndpointResponse[] = [
      {
        success: false,
        signedData: new Uint8Array([
          125, 135, 197, 234, 117, 247, 55, 139, 183, 1, 228, 4, 197, 6, 57, 22,
          26, 243, 239, 246, 98, 147, 233, 243, 117, 181, 241, 126, 181, 4, 118,
          244,
        ]),
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest: 'fail',
            result: 'fail',
            share_id: '',
            peer_id: '',
            signature_share: '',
            big_r: '',
            compressed_public_key: '',
            public_key: '',
            sig_type: '',
          },
        },
      },
      {
        success: true,
        signedData: new Uint8Array([
          125, 135, 197, 234, 117, 247, 55, 139, 183, 1, 228, 4, 197, 6, 57, 22,
          26, 243, 239, 246, 98, 147, 233, 243, 117, 181, 241, 126, 181, 4, 118,
          244,
        ]),
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest:
              '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
            result: 'success',
            share_id:
              '"1A0369823607C6EF403D86BA41534DDB1420730C696060EAD7931DE5DB603937"',
            peer_id:
              '"800ca9780644bb7e1908efa6bd1a0686f1095158c3ba6f1649ef9d2d67bfaf34"',
            signature_share:
              '"3ED0A844FAE40DF6210A6B2EACB9426E52E8339E243E697E33CF14E0CDE2B827"',
            big_r:
              '"0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B"',
            compressed_public_key:
              '"0381ff5b9f673837eacd4dca7e9377084250dccfc13ebf13913e662182027d1482"',
            public_key:
              '"04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726"',
            sig_type: 'K256',
          },
        },
      },
      {
        success: true,
        signedData: new Uint8Array([
          125, 135, 197, 234, 117, 247, 55, 139, 183, 1, 228, 4, 197, 6, 57, 22,
          26, 243, 239, 246, 98, 147, 233, 243, 117, 181, 241, 126, 181, 4, 118,
          244,
        ]),
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest:
              '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
            result: 'success',
            share_id:
              '"1A0369823607C6EF403D86BA41534DDB1420730C696060EAD7931DE5DB603937"',
            peer_id:
              '"800ca9780644bb7e1908efa6bd1a0686f1095158c3ba6f1649ef9d2d67bfaf34"',
            signature_share:
              '"B1AA643E88F8937B71CE2D43DCB73E0180AC96D1E39ECC579F0EC9635F37D4CB"',
            big_r:
              '"0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B"',
            compressed_public_key:
              '"0381ff5b9f673837eacd4dca7e9377084250dccfc13ebf13913e662182027d1482"',
            public_key:
              '"04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726"',
            sig_type: 'K256',
          },
        },
      },
    ];

    const expectedOutput = [
      {
        digest: 'fail',
        shareId: '',
        signatureShare: '',
        bigR: '',
        compressedPublicKey: '',
        publicKey: '',
        sigType: '',
        dataSigned: 'fail',
      },
      {
        digest:
          '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
        shareId:
          '1A0369823607C6EF403D86BA41534DDB1420730C696060EAD7931DE5DB603937',
        signatureShare:
          '3ED0A844FAE40DF6210A6B2EACB9426E52E8339E243E697E33CF14E0CDE2B827',
        bigR: '0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B',
        compressedPublicKey:
          '0381ff5b9f673837eacd4dca7e9377084250dccfc13ebf13913e662182027d1482',
        publicKey:
          '04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726',
        sigType: 'K256',
        dataSigned:
          '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
      },
      {
        digest:
          '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
        shareId:
          '1A0369823607C6EF403D86BA41534DDB1420730C696060EAD7931DE5DB603937',
        signatureShare:
          'B1AA643E88F8937B71CE2D43DCB73E0180AC96D1E39ECC579F0EC9635F37D4CB',
        bigR: '0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B',
        compressedPublicKey:
          '0381ff5b9f673837eacd4dca7e9377084250dccfc13ebf13913e662182027d1482',
        publicKey:
          '04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726',
        sigType: 'K256',
        dataSigned:
          '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
      },
    ];

    const output = parsePkpSignResponse(responseData);

    expect(output).toEqual(expectedOutput);
  });

  it('should parse FROST PKP sign response correctly', () => {
    const responseData: PKPSignEndpointResponse[] = [
      {
        success: false,
        signedData: new Uint8Array([
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ]),
        signatureShare: {
          FrostSignedMessageShare: {
            message: 'fail',
            result: 'fail',
            share_id: '',
            peer_id: '',
            signature_share: '',
            signing_commitments: '',
            verifying_share: '',
            public_key: '',
            sig_type: '',
          },
        },
      },
      {
        success: true,
        signedData: new Uint8Array([
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ]),
        signatureShare: {
          FrostSignedMessageShare: {
            message:
              '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
            result: 'success',
            share_id:
              '["K256Sha256",[21,126,1,81,188,147,173,138,16,169,115,205,1,224,43,54,73,148,113,48,206,233,7,6,217,224,119,81,249,220,48,41]]',
            peer_id:
              '77b2a2f061adf273b52307fb1c9960137c854382a9ae8d54d60c149e006a0d7c',
            signature_share:
              '["K256Sha256","12f86c0d816e98076bdf9cfc39812f7d242f7ac73aefa3638fb7cd1cf63ef7ed"]',
            signing_commitments:
              '["K256Sha256","00eed6b1b10396989fe69ba9f582ec87e14a01dcad420ad6fd1ec0ce1a63165f30947dc86fef029f61149ebcbd87868105bebd3582577a3c4b6c6a092c621a8a842940b04d8629"]',
            verifying_share:
              '["K256Sha256","022ba83de8961efba1490d9d3603a51b9d1c0eb17245ce0cbd8295d62ccd7e886c"]',
            public_key:
              '["K256Sha256","02c5f80a840bc7d00f26dfb8c2a0075aeffc620df39d2188f3e0237ec42dbe920a"]',
            sig_type: 'SchnorrK256Sha256',
          },
        },
      },
      {
        success: true,
        signedData: new Uint8Array([
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ]),
        signatureShare: {
          FrostSignedMessageShare: {
            message:
              '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
            result: 'success',
            share_id:
              '["K256Sha256",[226,183,233,101,218,75,198,127,202,46,107,100,150,15,170,176,229,25,121,33,202,13,26,6,192,49,160,84,130,11,169,174]]',
            peer_id:
              '8b714aa4b2b8cda1502834522c146d648b1d1eb71910b7064fa3adcb6269a575',
            signature_share:
              '["K256Sha256","5e6350c02c361f1ed97865ed57bd395190991c673ea55044c3c291155cc14c9b"]',
            signing_commitments:
              '["K256Sha256","00eed6b1b102f72cf9291f23e939db9758123f155da75cf1150526b847c3c788de7e9b2f6e1f035a3db8a5664117f161e9eca110bbf515395a1c44625202aad1311d71b1b5df7a"]',
            verifying_share:
              '["K256Sha256","02b680446e13263aea72c7da159393e64228110d4a4a6db36481bc55c92c616c46"]',
            public_key:
              '["K256Sha256","02c5f80a840bc7d00f26dfb8c2a0075aeffc620df39d2188f3e0237ec42dbe920a"]',
            sig_type: 'SchnorrK256Sha256',
          },
        },
      },
    ];

    const expectedOutput = [
      {
        message: 'fail',
        shareId: '',
        peerId: '',
        signatureShare: '',
        signingCommitments: '',
        verifyingShare: '',
        publicKey: '',
        sigType: '',
      },
      {
        message:
          '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
        shareId: new Uint8Array([
          21, 126, 1, 81, 188, 147, 173, 138, 16, 169, 115, 205, 1, 224, 43, 54,
          73, 148, 113, 48, 206, 233, 7, 6, 217, 224, 119, 81, 249, 220, 48, 41,
        ]),
        peerId:
          '77b2a2f061adf273b52307fb1c9960137c854382a9ae8d54d60c149e006a0d7c',
        signatureShare:
          '12f86c0d816e98076bdf9cfc39812f7d242f7ac73aefa3638fb7cd1cf63ef7ed',
        signingCommitments:
          '00eed6b1b10396989fe69ba9f582ec87e14a01dcad420ad6fd1ec0ce1a63165f30947dc86fef029f61149ebcbd87868105bebd3582577a3c4b6c6a092c621a8a842940b04d8629',
        verifyingShare:
          '022ba83de8961efba1490d9d3603a51b9d1c0eb17245ce0cbd8295d62ccd7e886c',
        publicKey:
          '02c5f80a840bc7d00f26dfb8c2a0075aeffc620df39d2188f3e0237ec42dbe920a',
        sigType: 'SchnorrK256Sha256',
      },
      {
        message:
          '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
        shareId: new Uint8Array([
          226, 183, 233, 101, 218, 75, 198, 127, 202, 46, 107, 100, 150, 15,
          170, 176, 229, 25, 121, 33, 202, 13, 26, 6, 192, 49, 160, 84, 130, 11,
          169, 174,
        ]),
        peerId:
          '8b714aa4b2b8cda1502834522c146d648b1d1eb71910b7064fa3adcb6269a575',
        signatureShare:
          '5e6350c02c361f1ed97865ed57bd395190991c673ea55044c3c291155cc14c9b',
        signingCommitments:
          '00eed6b1b102f72cf9291f23e939db9758123f155da75cf1150526b847c3c788de7e9b2f6e1f035a3db8a5664117f161e9eca110bbf515395a1c44625202aad1311d71b1b5df7a',
        verifyingShare:
          '02b680446e13263aea72c7da159393e64228110d4a4a6db36481bc55c92c616c46',
        publicKey:
          '02c5f80a840bc7d00f26dfb8c2a0075aeffc620df39d2188f3e0237ec42dbe920a',
        sigType: 'SchnorrK256Sha256',
      },
    ];

    const output = parsePkpSignResponse(responseData);

    expect(output).toEqual(expectedOutput);
  });
});

describe('cleanStringValues', () => {
  it('should remove double quotes from string values in an object', () => {
    const input = {
      name: '"Josh"',
      age: 18,
      city: '"New York"',
    };

    const expectedOutput = {
      name: 'Josh',
      age: 18,
      city: 'New York',
    };

    const output = cleanStringValues(input);

    expect(output).toEqual(expectedOutput);
  });

  it('should not modify non-string values in an object', () => {
    const input = {
      name: 'John',
      age: 25,
      city: 'New York',
    };

    const expectedOutput = {
      name: 'John',
      age: 25,
      city: 'New York',
    };

    const output = cleanStringValues(input);

    expect(output).toEqual(expectedOutput);
  });
});

describe('convertKeysToCamelCase', () => {
  it('should convert keys to camel case', () => {
    const input = {
      first_name: 'John',
      last_name: 'Doe',
      age: 25,
      city_name: 'New York',
    };

    const expectedOutput = {
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      cityName: 'New York',
    };

    const output = convertKeysToCamelCase(input);

    expect(output).toEqual(expectedOutput);
  });

  it('should not modify keys that are already in camel case', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      cityName: 'New York',
    };

    const expectedOutput = {
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      cityName: 'New York',
    };

    const output = convertKeysToCamelCase(input);

    expect(output).toEqual(expectedOutput);
  });
});

describe('snakeToCamel', () => {
  it('should convert snake case to camel case', () => {
    const input = 'hello_world';
    const expectedOutput = 'helloWorld';
    const output = snakeToCamel(input);
    expect(output).toEqual(expectedOutput);
  });

  it('should convert multiple snake case words to camel case', () => {
    const input = 'hello_world_example';
    const expectedOutput = 'helloWorldExample';
    const output = snakeToCamel(input);
    expect(output).toEqual(expectedOutput);
  });

  it('should not modify camel case words', () => {
    const input = 'helloWorld';
    const expectedOutput = 'helloWorld';
    const output = snakeToCamel(input);
    expect(output).toEqual(expectedOutput);
  });

  it('should not modify words without underscores', () => {
    const input = 'hello';
    const expectedOutput = 'hello';
    const output = snakeToCamel(input);
    expect(output).toEqual(expectedOutput);
  });
});
