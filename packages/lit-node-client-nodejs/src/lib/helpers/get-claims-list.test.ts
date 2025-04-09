import { ExecuteJsValueResponse } from '@lit-protocol/types';

import { getClaimsList } from './get-claims-list';

describe('getClaimsList', () => {
  it('should return an empty array if responseData is empty', () => {
    const responseData: ExecuteJsValueResponse[] = [];
    const result = getClaimsList(responseData);
    expect(result).toEqual([]);
  });

  it('should parse the real data correctly', () => {
    const responseData: ExecuteJsValueResponse[] = [
      {
        success: true,
        signedData: {
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"B4C05B5662A5FA4316E818DEDDA26FE49BC255FD18CEAAE737918B76860E0603\\"","big_r":"\\"025C4C4E1C1450CF2BB52A6D9B47E351FCB6AD61721F6EB1D1B9D07885FEEF17BF\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"F8C932F4D1CD0590EE602E3BD38DF8E654D60CD92D118FCCBF5E0D1F6F5DC9C6\\"","big_r":"\\"031B4BFE05DA0235CEEED499049FA415FE9C1D03BE6DD149EB5740972655628F42\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              '09c8030422c182ff583005e1f28649f37543d6c7486a0b750a95e31b9b374ebe7d5636c962c493ef5caa2bbb0795f86668e4ffd1de3bea8606aefbc0d8e88bd31b',
            derivedKeyId:
              'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"944a5b7290ea8d887156644d0a080561c87e1487459ffe8b31330e4e18a92588\\",\\"s\\":\\"66bf328efe592b25a3e134f66a8e7e6364c9f6787082fe34dcefaed3facee7dc\\",\\"v\\":1}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
      {
        success: true,
        signedData: {
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"193837FC7153CBDFEC9A358FAD6EB2919DD10C66CA1B81F65245DBE6C352EA0E\\"","big_r":"\\"025C4C4E1C1450CF2BB52A6D9B47E351FCB6AD61721F6EB1D1B9D07885FEEF17BF\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"6D088286CEED1699BB8B4B49E2343EE7A34B29030B8A10E03C50C19C25C9D164\\"","big_r":"\\"031B4BFE05DA0235CEEED499049FA415FE9C1D03BE6DD149EB5740972655628F42\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              'c8395ddc0b3fd9de46e4342656eddf13750f34d8b062d32a31dfa15430d6c4d901245be4aaa17a316124057740f3166c249fae93a1fa826b7f60aea4783fc9ca1b',
            derivedKeyId:
              'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"944a5b7290ea8d887156644d0a080561c87e1487459ffe8b31330e4e18a92588\\",\\"s\\":\\"66bf328efe592b25a3e134f66a8e7e6364c9f6787082fe34dcefaed3facee7dc\\",\\"v\\":1}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
      {
        success: true,
        signedData: {
          signEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4","result":"success","share_id":"\\"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3\\"","peer_id":"6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151","signature_share":"\\"AC369404EAAC0E47153FFCF2D79769C1EEFC4709053E985B69ADA4076693BE56\\"","big_r":"\\"025C4C4E1C1450CF2BB52A6D9B47E351FCB6AD61721F6EB1D1B9D07885FEEF17BF\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'signEcdsa',
          },
          ethPersonalSignMessageEcdsa: {
            sigType: 'EcdsaK256Sha256',
            signatureShare:
              '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3\\"","peer_id":"6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151","signature_share":"\\"0ECCE198FEBD337740DB617ADEB558CF8E00EC18A6783D88AAD8F73A31A0F4B1\\"","big_r":"\\"031B4BFE05DA0235CEEED499049FA415FE9C1D03BE6DD149EB5740972655628F42\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
            publicKey:
              '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
            sigName: 'ethPersonalSignMessageEcdsa',
          },
        },
        decryptedData: {},
        claimData: {
          claimKey: {
            signature:
              '96972387c7322f29172936baebd516461fff7e0dee7f378bb258d88bd0109e582425e0211db85fce47da34729bb70b8aed07b79d6be6b1553907e21069e4186e1b',
            derivedKeyId:
              'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
          },
        },
        response:
          '{"signAndCombineEcdsa":"{\\"r\\":\\"944a5b7290ea8d887156644d0a080561c87e1487459ffe8b31330e4e18a92588\\",\\"s\\":\\"66bf328efe592b25a3e134f66a8e7e6364c9f6787082fe34dcefaed3facee7dc\\",\\"v\\":1}","signEcdsa":"success","ethPersonalSignMessageEcdsa":"success","foo":"bar"}',
        logs: '===== starting\n===== responding\n',
      },
    ];

    const result = getClaimsList(responseData);

    expect(result).toEqual([
      {
        claimKey: {
          signature:
            '09c8030422c182ff583005e1f28649f37543d6c7486a0b750a95e31b9b374ebe7d5636c962c493ef5caa2bbb0795f86668e4ffd1de3bea8606aefbc0d8e88bd31b',
          derivedKeyId:
            'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
        },
      },
      {
        claimKey: {
          signature:
            'c8395ddc0b3fd9de46e4342656eddf13750f34d8b062d32a31dfa15430d6c4d901245be4aaa17a316124057740f3166c249fae93a1fa826b7f60aea4783fc9ca1b',
          derivedKeyId:
            'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
        },
      },
      {
        claimKey: {
          signature:
            '96972387c7322f29172936baebd516461fff7e0dee7f378bb258d88bd0109e582425e0211db85fce47da34729bb70b8aed07b79d6be6b1553907e21069e4186e1b',
          derivedKeyId:
            'cd27cca0fcb92698b199970c75a560437d32f39849acea8f0cb0adea745dd5ea',
        },
      },
    ]);
  });
});
