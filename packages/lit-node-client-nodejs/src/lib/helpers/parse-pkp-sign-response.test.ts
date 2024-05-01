import {
  cleanStringValues,
  parsePkpSignResponse,
  convertKeysToCamelCase,
  snakeToCamel,
} from './parse-pkp-sign-response';

describe('parsePkpSignResponse', () => {
  it('should parse PKP sign response correctly', () => {
    const responseData = [
      {
        success: true,
        signedData: [
          125, 135, 197, 234, 117, 247, 55, 139, 183, 1, 228, 4, 197, 6, 57, 22,
          26, 243, 239, 246, 98, 147, 233, 243, 117, 181, 241, 126, 181, 4, 118,
          244,
        ],
        signatureShare: {
          digest: 'fail',
          result: 'fail',
          share_index: 0,
          signature_share: '',
          big_r: '',
          public_key: '',
          sig_type: '',
        },
      },
      {
        success: true,
        signedData: [
          125, 135, 197, 234, 117, 247, 55, 139, 183, 1, 228, 4, 197, 6, 57, 22,
          26, 243, 239, 246, 98, 147, 233, 243, 117, 181, 241, 126, 181, 4, 118,
          244,
        ],
        signatureShare: {
          digest:
            '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
          result: 'success',
          share_index: 0,
          signature_share:
            '"3ED0A844FAE40DF6210A6B2EACB9426E52E8339E243E697E33CF14E0CDE2B827"',
          big_r:
            '"0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B"',
          public_key:
            '"04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726"',
          sig_type: 'K256',
        },
      },
      {
        success: true,
        signedData: [
          125, 135, 197, 234, 117, 247, 55, 139, 183, 1, 228, 4, 197, 6, 57, 22,
          26, 243, 239, 246, 98, 147, 233, 243, 117, 181, 241, 126, 181, 4, 118,
          244,
        ],
        signatureShare: {
          digest:
            '"7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4"',
          result: 'success',
          share_index: 0,
          signature_share:
            '"B1AA643E88F8937B71CE2D43DCB73E0180AC96D1E39ECC579F0EC9635F37D4CB"',
          big_r:
            '"0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B"',
          public_key:
            '"04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726"',
          sig_type: 'K256',
        },
      },
    ];

    const expectedOutput = [
      {
        signature: {
          digest: 'fail',
          shareIndex: 0,
          signatureShare: '',
          bigR: '',
          publicKey: '',
          sigType: '',
          dataSigned: 'fail',
        },
      },
      {
        signature: {
          digest:
            '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
          shareIndex: 0,
          signatureShare:
            '3ED0A844FAE40DF6210A6B2EACB9426E52E8339E243E697E33CF14E0CDE2B827',
          bigR: '0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B',
          publicKey:
            '04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726',
          sigType: 'K256',
          dataSigned:
            '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
        },
      },
      {
        signature: {
          digest:
            '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
          shareIndex: 0,
          signatureShare:
            'B1AA643E88F8937B71CE2D43DCB73E0180AC96D1E39ECC579F0EC9635F37D4CB',
          bigR: '0332188F0918B7DEBB0CC846B00B0AAD9300308260C2DAD25A85FDECA671C36B1B',
          publicKey:
            '04156D7E068BF5ED014057B8B6365BF89053D567D38EC24030C699B94065F2D39B4D45F463464F1A138D7149D1C0EF41ACF9B8826050B9E3DCC847DE2127BDB726',
          sigType: 'K256',
          dataSigned:
            '7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4',
        },
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
