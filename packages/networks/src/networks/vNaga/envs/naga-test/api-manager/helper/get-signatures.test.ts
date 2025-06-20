import { NoValidShares } from '@lit-protocol/constants';
import {
  ExecuteJsValueResponse,
  LitNodeSignature,
  PKPSignEndpointResponse,
} from '@lit-protocol/types';

import {
  combineExecuteJSSignatures,
  combinePKPSignSignatures,
} from './get-signatures';

const requestId = 'REQUEST_ID';
const threshold = 3;

describe('combineExecuteJSSignatures', () => {
  it('should throw when threshold is not met', async () => {
    const shares: ExecuteJsValueResponse[] = [
      {
        success: true,
        signedData: {
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"3CD32659E13395EA472B5803F441D6336610AE837A64C618FB88A7D52E40F3E6\\"","big_r":"\\"0364400D1F87B954C788AD6FD25C835E3FA46EBFE23B96763204B8FC8D3265A2AA\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"F462406990EEFC365A04970594A8D28FBAB0C241089A35EDDDE18BA22B5F3E10\\"","big_r":"\\"035AE42C8D841E45EE956C749038027B12B378BDD5BD9ADEB47DA31C99B8A0076A\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              'fd50548ca7e4264e834f384d2d53e2194f1c88f56b3d2d72c3d3f6b248f368f47b583a543ee84d1996311e42f2d6ef7d96b2b49be21dbe1af1eb998f3d10a60e1c',
            derivedKeyId:
              '8ef1510b2225c2d881221ba953e9ac586c432f75f8052ef56998bd17b4a1f1cb',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"b0e2b90cde3357919f4582c4556e437daf94ab48357e7d52c76a4120c8702988\\",\\"s\\":\\"45c37dd91e8eaa16e2d2d2b7d08316f8d8c6186349680b10cf4d699439e75652\\",\\"v\\":0}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
      {
        success: true,
        signedData: {
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"6CA25D6E1FC17CCEABDB39AE60559AC8DD89E088D84589C60F1864EE2327EC25\\"","big_r":"\\"035AE42C8D841E45EE956C749038027B12B378BDD5BD9ADEB47DA31C99B8A0076A\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"F858C082562DBE3D8F3722B046E0648390A7666E795F602194F1D39E73D9A803\\"","big_r":"\\"0364400D1F87B954C788AD6FD25C835E3FA46EBFE23B96763204B8FC8D3265A2AA\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              '74d1a74a947b86efac665113323210149e91ef66669951ead4abf056c44553b3596abdcfa5a7a9ee69f12d316bc90033243fd253bb78d59e8ed40122de0a3b2d1b',
            derivedKeyId:
              '8ef1510b2225c2d881221ba953e9ac586c432f75f8052ef56998bd17b4a1f1cb',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"b0e2b90cde3357919f4582c4556e437daf94ab48357e7d52c76a4120c8702988\\",\\"s\\":\\"45c37dd91e8eaa16e2d2d2b7d08316f8d8c6186349680b10cf4d699439e75652\\",\\"v\\":0}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
      {
        success: false,
        signedData: {},
        decryptedData: {},
        claimData: {},
        response: '',
        logs: '',
      },
    ];

    await expect(
      combineExecuteJSSignatures({
        nodesLitActionSignedData: shares,
        threshold,
        requestId,
      })
    ).rejects.toThrow(NoValidShares);
  });

  it('should return the combined signature', async () => {
    const shares: ExecuteJsValueResponse[] = [
      {
        success: true,
        signedData: {
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"3CD32659E13395EA472B5803F441D6336610AE837A64C618FB88A7D52E40F3E6\\"","big_r":"\\"0364400D1F87B954C788AD6FD25C835E3FA46EBFE23B96763204B8FC8D3265A2AA\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"F462406990EEFC365A04970594A8D28FBAB0C241089A35EDDDE18BA22B5F3E10\\"","big_r":"\\"035AE42C8D841E45EE956C749038027B12B378BDD5BD9ADEB47DA31C99B8A0076A\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              'fd50548ca7e4264e834f384d2d53e2194f1c88f56b3d2d72c3d3f6b248f368f47b583a543ee84d1996311e42f2d6ef7d96b2b49be21dbe1af1eb998f3d10a60e1c',
            derivedKeyId:
              '8ef1510b2225c2d881221ba953e9ac586c432f75f8052ef56998bd17b4a1f1cb',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"b0e2b90cde3357919f4582c4556e437daf94ab48357e7d52c76a4120c8702988\\",\\"s\\":\\"45c37dd91e8eaa16e2d2d2b7d08316f8d8c6186349680b10cf4d699439e75652\\",\\"v\\":0}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
      {
        success: true,
        signedData: {
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"6CA25D6E1FC17CCEABDB39AE60559AC8DD89E088D84589C60F1864EE2327EC25\\"","big_r":"\\"035AE42C8D841E45EE956C749038027B12B378BDD5BD9ADEB47DA31C99B8A0076A\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"F858C082562DBE3D8F3722B046E0648390A7666E795F602194F1D39E73D9A803\\"","big_r":"\\"0364400D1F87B954C788AD6FD25C835E3FA46EBFE23B96763204B8FC8D3265A2AA\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              '74d1a74a947b86efac665113323210149e91ef66669951ead4abf056c44553b3596abdcfa5a7a9ee69f12d316bc90033243fd253bb78d59e8ed40122de0a3b2d1b',
            derivedKeyId:
              '8ef1510b2225c2d881221ba953e9ac586c432f75f8052ef56998bd17b4a1f1cb',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"b0e2b90cde3357919f4582c4556e437daf94ab48357e7d52c76a4120c8702988\\",\\"s\\":\\"45c37dd91e8eaa16e2d2d2b7d08316f8d8c6186349680b10cf4d699439e75652\\",\\"v\\":0}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
      {
        success: true,
        signedData: {
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3\\"","peer_id":"6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151","signature_share":"\\"B7AF0DBCE67A07EFDEB38D44491673EF23CC9FF9CBC81399A2C3A3948ED2B1BC\\"","big_r":"\\"0364400D1F87B954C788AD6FD25C835E3FA46EBFE23B96763204B8FC8D3265A2AA\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3\\"","peer_id":"6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151","signature_share":"\\"2F4376CF77A51A7EFBC604FAFFC56F31A7370B359C559EF56C51EA236C8C3F70\\"","big_r":"\\"035AE42C8D841E45EE956C749038027B12B378BDD5BD9ADEB47DA31C99B8A0076A\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              '266e0aae5b98f78a82c7e11072b0a9cb1284dd1b326c34aa144d44f6c31f48f520fcc05ac9e243aa2596cb8c65ce1e015bc3d690243b9f462cccd8f5600bcc341c',
            derivedKeyId:
              '8ef1510b2225c2d881221ba953e9ac586c432f75f8052ef56998bd17b4a1f1cb',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"b0e2b90cde3357919f4582c4556e437daf94ab48357e7d52c76a4120c8702988\\",\\"s\\":\\"45c37dd91e8eaa16e2d2d2b7d08316f8d8c6186349680b10cf4d699439e75652\\",\\"v\\":0}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
    ];
    const combinedSignatures: Record<string, LitNodeSignature> = {
      ethPersonalSignMessageEcdsa: {
        signature:
          '0x64400D1F87B954C788AD6FD25C835E3FA46EBFE23B96763204B8FC8D3265A2AA13250B66E224A3E84AE9F8077BC751575AD904E19F0506A34C669E116F7F34DD',
        verifyingKey:
          '0x3056301006072A8648CE3D020106052B8104000A0342000450A6083580384CBCDDD0D809165BA8EE53B5E768724C7B6080AE55790DA9508125810F89BAB7D56077E37BE1681463A6262108E50FBA439D94808F3CB1CC704E',
        signedData:
          '0x04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62',
        recoveryId: 0,
        publicKey:
          '0x0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e',
        sigType: 'EcdsaK256Sha256',
      },
      signEcdsa: {
        signature:
          '0x5AE42C8D841E45EE956C749038027B12B378BDD5BD9ADEB47DA31C99B8A0076A6FB7EB58D7AA6C7BFE5A2A510B3C237335EC0BCDE15BE1CE2658E265E55918DD',
        verifyingKey:
          '0x3056301006072A8648CE3D020106052B8104000A0342000450A6083580384CBCDDD0D809165BA8EE53B5E768724C7B6080AE55790DA9508125810F89BAB7D56077E37BE1681463A6262108E50FBA439D94808F3CB1CC704E',
        signedData:
          '0x7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4',
        recoveryId: 0,
        publicKey:
          '0x0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e',
        sigType: 'EcdsaK256Sha256',
      },
    };

    await expect(
      combineExecuteJSSignatures({
        nodesLitActionSignedData: shares,
        threshold,
        requestId,
      })
    ).resolves.toEqual(combinedSignatures);
  });
});

describe('combinePKPSignSignatures', () => {
  it('should throw when threshold is not met', async () => {
    const shares: PKPSignEndpointResponse[] = [
      {
        success: true,
        signedData: [
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ],
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest:
              '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
            result: 'success',
            share_id:
              '"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3"',
            peer_id:
              '6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151',
            signature_share:
              '"3D53B4698F798F98F65D2CB90BFD170278E7014E3DA87E217BCAAEBBB8D5DDF9"',
            big_r:
              '"039EF446668DDE56A9F803F07B371756EEAB3AAF797A8E4EBD7A273CB86874C143"',
            compressed_public_key:
              '"0366069291e81515949b7659dd00bef10403cbce747404ced4ad72e97690fd1e29"',
            public_key:
              '"0466069291e81515949b7659dd00bef10403cbce747404ced4ad72e97690fd1e29bf1741d91941fa1f2407c59445a3c9af78b7c7e94c0782cfd11353c1ee163993"',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
      {
        success: true,
        signedData: [
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ],
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest:
              '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
            result: 'success',
            share_id:
              '"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03"',
            peer_id:
              'b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a',
            signature_share:
              '"A0DD6D5EEC9EADACF86E14C8B252344EAEB505B722F5A7C18ECB4F3FFA44A3AE"',
            big_r:
              '"039EF446668DDE56A9F803F07B371756EEAB3AAF797A8E4EBD7A273CB86874C143"',
            compressed_public_key:
              '"0366069291e81515949b7659dd00bef10403cbce747404ced4ad72e97690fd1e29"',
            public_key:
              '"0466069291e81515949b7659dd00bef10403cbce747404ced4ad72e97690fd1e29bf1741d91941fa1f2407c59445a3c9af78b7c7e94c0782cfd11353c1ee163993"',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
      {
        success: false,
        signedData: [],
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest: '',
            result: 'fail',
            share_id: '',
            peer_id: '',
            signature_share: '',
            big_r: '',
            compressed_public_key: '',
            public_key: '',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
    ];

    await expect(
      combinePKPSignSignatures({
        nodesPkpSignResponseData: shares,
        threshold,
        requestId,
      })
    ).rejects.toThrow(NoValidShares);
  });

  it('should return the combined signature', async () => {
    const shares: PKPSignEndpointResponse[] = [
      {
        success: true,
        signedData: [
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ],
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest:
              '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
            result: 'success',
            share_id:
              '"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1"',
            peer_id:
              '5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a',
            signature_share:
              '"159E02F1F0B5B875FE65A8A534109E0A35DAE0F900FC3CDE2400491289A975FD"',
            big_r:
              '"03265381E6E2879FF4AA1C0B9991123A3B9E6759A66C3432C60D6F7D8DB7ABAC24"',
            compressed_public_key:
              '"032e0cfe8e42758449da56ef09669ec4a31c3d8b55f8b28d390c830264d1426dc7"',
            public_key:
              '"042e0cfe8e42758449da56ef09669ec4a31c3d8b55f8b28d390c830264d1426dc73bbe2171d83f52483a66922746bfda297bd1dc69c4d5ed5163a523b0b10d0db3"',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
      {
        success: true,
        signedData: [
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ],
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest:
              '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
            result: 'success',
            share_id:
              '"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03"',
            peer_id:
              'b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a',
            signature_share:
              '"F3B8CAAAC28A09D5F9125D6FD0A122E41451CDDCE8E9001C07D8D91F5DBE0F23"',
            big_r:
              '"03265381E6E2879FF4AA1C0B9991123A3B9E6759A66C3432C60D6F7D8DB7ABAC24"',
            compressed_public_key:
              '"032e0cfe8e42758449da56ef09669ec4a31c3d8b55f8b28d390c830264d1426dc7"',
            public_key:
              '"042e0cfe8e42758449da56ef09669ec4a31c3d8b55f8b28d390c830264d1426dc73bbe2171d83f52483a66922746bfda297bd1dc69c4d5ed5163a523b0b10d0db3"',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
      {
        success: true,
        signedData: [
          116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
          120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
          236, 96, 208,
        ],
        signatureShare: {
          EcdsaSignedMessageShare: {
            digest:
              '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
            result: 'success',
            share_id:
              '"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3"',
            peer_id:
              '6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151',
            signature_share:
              '"42D2DA7F7E05CBCF927EA934797919D2857AA9D7EB35F3BECAE0C59BC62B81E0"',
            big_r:
              '"03265381E6E2879FF4AA1C0B9991123A3B9E6759A66C3432C60D6F7D8DB7ABAC24"',
            compressed_public_key:
              '"032e0cfe8e42758449da56ef09669ec4a31c3d8b55f8b28d390c830264d1426dc7"',
            public_key:
              '"042e0cfe8e42758449da56ef09669ec4a31c3d8b55f8b28d390c830264d1426dc73bbe2171d83f52483a66922746bfda297bd1dc69c4d5ed5163a523b0b10d0db3"',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
    ];
    const combinedSignature: LitNodeSignature = {
      signature:
        '0x265381E6E2879FF4AA1C0B9991123A3B9E6759A66C3432C60D6F7D8DB7ABAC244C29A81C31458E1B89F6AF497E2ADAC214F87BC725D2907D36E78940DD5CC5BF',
      verifyingKey:
        '0x3056301006072A8648CE3D020106052B8104000A034200042E0CFE8E42758449DA56EF09669EC4A31C3D8B55F8B28D390C830264D1426DC73BBE2171D83F52483A66922746BFDA297BD1DC69C4D5ED5163A523B0B10D0DB3',
      signedData:
        '0x74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
      recoveryId: 1,
      publicKey:
        '0x042e0cfe8e42758449da56ef09669ec4a31c3d8b55f8b28d390c830264d1426dc73bbe2171d83f52483a66922746bfda297bd1dc69c4d5ed5163a523b0b10d0db3',
      sigType: 'EcdsaK256Sha256',
    };

    await expect(
      combinePKPSignSignatures({
        nodesPkpSignResponseData: shares,
        threshold,
        requestId,
      })
    ).resolves.toEqual(combinedSignature);
  });
});
