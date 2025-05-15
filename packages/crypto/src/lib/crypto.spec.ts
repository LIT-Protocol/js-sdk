import { NoValidShares } from '@lit-protocol/constants';
import {
  CleanLitNodeSignature,
  LitActionSignedData,
  PKPSignEndpointResponse,
} from '@lit-protocol/types';
import { nacl } from '@lit-protocol/nacl';

import {
  combineExecuteJsNodeShares,
  combinePKPSignNodeShares,
  walletEncrypt,
  walletDecrypt,
} from './crypto';

const MOCK_SESSION_SIGS = {
  'http://127.0.0.1:7470': {
    sig: 'fefcd74c2bb2794356a10e62722c2ca4ef47386475ca72865d8dd7cc096fd1715d8b076b29349328e0b13d09f3296768e6b1cbb81e02d2b697b7641984260b01',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x64192b2156f6d60f2c9aed887f5a0c6003afb6cd7a25b94683c74311fe895e8849a178d4edbe9f38cb0d8a3d7d0342b67b521ada92b68f73f0a1e5fa4f33ae751c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d\\nVersion: 1\\nChain ID: 1\\nNonce: 0x4ee32274a45ab4622d49ea0f9bc3984f2a251e7b88320e23e231673efa564280\\nIssued At: 2025-04-09T14:37:09.339Z\\nExpiration Time: 2025-04-10T14:37:09.337Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119","address":"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"}],"issuedAt":"2025-04-09T14:37:09.373Z","expiration":"2025-04-10T14:37:09.337Z","nodeAddress":"http://127.0.0.1:7470","maxPrice":"113427455640312821154458202477256070485"}`,
    address: '6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d',
    algo: 'ed25519',
  },
  'http://127.0.0.1:7471': {
    sig: 'ec550ae2addd6fbc399ef26158b9cf8b2a1c52240ee60b62c49c8a782c020d0aae5602090029f5a0024f936f0a747d7c007dfecee44bbe99a5cc12dcef7d3309',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x64192b2156f6d60f2c9aed887f5a0c6003afb6cd7a25b94683c74311fe895e8849a178d4edbe9f38cb0d8a3d7d0342b67b521ada92b68f73f0a1e5fa4f33ae751c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d\\nVersion: 1\\nChain ID: 1\\nNonce: 0x4ee32274a45ab4622d49ea0f9bc3984f2a251e7b88320e23e231673efa564280\\nIssued At: 2025-04-09T14:37:09.339Z\\nExpiration Time: 2025-04-10T14:37:09.337Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119","address":"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"}],"issuedAt":"2025-04-09T14:37:09.373Z","expiration":"2025-04-10T14:37:09.337Z","nodeAddress":"http://127.0.0.1:7471","maxPrice":"113427455640312821154458202477256070485"}`,
    address: '6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d',
    algo: 'ed25519',
  },
  'http://127.0.0.1:7472': {
    sig: '5f4d83f7fc425ebfca85e45fed0799b93ac215c5ae1c7d279217ca70c434eb43db6e282f365d4f4dc7d76494548e33e4cb6e5f8901b5f142e447fc9718589f07',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x64192b2156f6d60f2c9aed887f5a0c6003afb6cd7a25b94683c74311fe895e8849a178d4edbe9f38cb0d8a3d7d0342b67b521ada92b68f73f0a1e5fa4f33ae751c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d\\nVersion: 1\\nChain ID: 1\\nNonce: 0x4ee32274a45ab4622d49ea0f9bc3984f2a251e7b88320e23e231673efa564280\\nIssued At: 2025-04-09T14:37:09.339Z\\nExpiration Time: 2025-04-10T14:37:09.337Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119","address":"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"}],"issuedAt":"2025-04-09T14:37:09.373Z","expiration":"2025-04-10T14:37:09.337Z","nodeAddress":"http://127.0.0.1:7472","maxPrice":"113427455640312821154458202477256070485"}`,
    address: '6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d',
    algo: 'ed25519',
  },
};

describe('combineExecuteJsNodeShares', () => {
  it('should throw when there are no shares to combine', async () => {
    const shares: LitActionSignedData[] = [];

    await expect(combineExecuteJsNodeShares(shares)).rejects.toThrow(
      NoValidShares
    );
  });

  it('should throw when signature combination cannot be verified', async () => {
    // Insufficient shares for threshold
    const shares: LitActionSignedData[] = [
      // {
      //   sigType: 'EcdsaK256Sha256',
      //   signatureShare:
      //     '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"BD865CD2460CF80EC3384849CA91F2FFE99440771C18E3DC95CF35403CA1C78F\\"","big_r":"\\"033C83EFBCC67B3EC667DFCE53AD76DF7AA7D5F09834E32BF92B5DA42450AE173E\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
      //   publicKey:
      //     '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
      //   sigName: 'ethPersonalSignMessageEcdsa',
      // },
      {
        sigType: 'EcdsaK256Sha256',
        signatureShare:
          '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"5F47F3F8439787E71F01C05B7AFF4E09B5E0D960110EEB91A3EC56A0E1DD06B1\\"","big_r":"\\"033C83EFBCC67B3EC667DFCE53AD76DF7AA7D5F09834E32BF92B5DA42450AE173E\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
        publicKey:
          '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
        sigName: 'ethPersonalSignMessageEcdsa',
      },
      {
        sigType: 'EcdsaK256Sha256',
        signatureShare:
          '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3\\"","peer_id":"6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151","signature_share":"\\"D4C0F937C7088D32D9A027E4F774764BC80C189066936636A133CF0E98064C47\\"","big_r":"\\"033C83EFBCC67B3EC667DFCE53AD76DF7AA7D5F09834E32BF92B5DA42450AE173E\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
        publicKey:
          '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
        sigName: 'ethPersonalSignMessageEcdsa',
      },
    ];

    await expect(combineExecuteJsNodeShares(shares)).rejects.toThrow(
      NoValidShares
    );
  });

  it('should combine shares from lit action signed data', async () => {
    const shares: LitActionSignedData[] = [
      {
        sigType: 'EcdsaK256Sha256',
        signatureShare:
          '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\\"","peer_id":"5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a","signature_share":"\\"BD865CD2460CF80EC3384849CA91F2FFE99440771C18E3DC95CF35403CA1C78F\\"","big_r":"\\"033C83EFBCC67B3EC667DFCE53AD76DF7AA7D5F09834E32BF92B5DA42450AE173E\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
        publicKey:
          '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
        sigName: 'ethPersonalSignMessageEcdsa',
      },
      {
        sigType: 'EcdsaK256Sha256',
        signatureShare:
          '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"816E54B265612C92CD87FC32892C024C9E2DD5FA67AA20FED4816A49A560FC03\\"","peer_id":"b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a","signature_share":"\\"5F47F3F8439787E71F01C05B7AFF4E09B5E0D960110EEB91A3EC56A0E1DD06B1\\"","big_r":"\\"033C83EFBCC67B3EC667DFCE53AD76DF7AA7D5F09834E32BF92B5DA42450AE173E\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
        publicKey:
          '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
        sigName: 'ethPersonalSignMessageEcdsa',
      },
      {
        sigType: 'EcdsaK256Sha256',
        signatureShare:
          '{"EcdsaSignedMessageShare":{"digest":"04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62","result":"success","share_id":"\\"B8EF7C21FAF54664646B64869D1B12861F6D905F1F1F095E60F7238806252AE3\\"","peer_id":"6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151","signature_share":"\\"D4C0F937C7088D32D9A027E4F774764BC80C189066936636A133CF0E98064C47\\"","big_r":"\\"033C83EFBCC67B3EC667DFCE53AD76DF7AA7D5F09834E32BF92B5DA42450AE173E\\"","compressed_public_key":"\\"0250a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da95081\\"","public_key":"\\"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e\\"","sig_type":"EcdsaK256Sha256"}}',
        publicKey:
          '"0450a6083580384cbcddd0d809165ba8ee53b5e768724c7b6080ae55790da9508125810f89bab7d56077e37be1681463a6262108e50fba439d94808f3cb1cc704e"',
        sigName: 'ethPersonalSignMessageEcdsa',
      },
    ];
    const combinedSignature: CleanLitNodeSignature = {
      signature:
        '0x3C83EFBCC67B3EC667DFCE53AD76DF7AA7D5F09834E32BF92B5DA42450AE173E0E70B5FDAF52F2D74425CF75C2FA48A80DDC8765CAD60AD2A4B56229E9E767FB',
      verifyingKey:
        '0x3056301006072A8648CE3D020106052B8104000A0342000450A6083580384CBCDDD0D809165BA8EE53B5E768724C7B6080AE55790DA9508125810F89BAB7D56077E37BE1681463A6262108E50FBA439D94808F3CB1CC704E',
      signedData:
        '0x04f09ca42a7f2d7268e756c590c5e29de79dcb28b55b01f8c1211a31438a3e62',
      recoveryId: 0,
    };

    await expect(combineExecuteJsNodeShares(shares)).resolves.toEqual(
      combinedSignature
    );
  });
});

describe('combinePKPSignNodeShares', () => {
  it('should throw when there are no shares to combine', async () => {
    const shares: PKPSignEndpointResponse[] = [];

    await expect(combinePKPSignNodeShares(shares)).rejects.toThrow(
      NoValidShares
    );
  });

  it('should throw when signature combination cannot be verified', async () => {
    // Insufficient shares for threshold
    const shares: PKPSignEndpointResponse[] = [
      // {
      //   success: true,
      //   signedData: [
      //     116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34,
      //     120, 202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220,
      //     236, 96, 208,
      //   ],
      //   signatureShare: {
      //     EcdsaSignedMessageShare: {
      //       digest:
      //         '74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
      //       result: 'success',
      //       share_id:
      //         '"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1"',
      //       peer_id:
      //         '5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a',
      //       signature_share:
      //         '"89936DDC19D3A6A16C65CE5B40E41AB19258D04986B78FE6C3EEB2F37C996099"',
      //       big_r:
      //         '"03BFEA95308F38CBA7C8AF5831EA8CC35D418C4E574ADE5B77B38A1E565AF7E8E1"',
      //       compressed_public_key:
      //         '"028f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039"',
      //       public_key:
      //         '"048f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039e88803650af44072ecd9c85837701916bb48259ccb39720808402f1e5e008a32"',
      //       sig_type: 'EcdsaK256Sha256',
      //     },
      //   },
      // },
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
              '"3817ED8D97A7DA25DB20911CD57E0B90A83FA4A22DCE411A5C5B3409C92B338C"',
            big_r:
              '"03BFEA95308F38CBA7C8AF5831EA8CC35D418C4E574ADE5B77B38A1E565AF7E8E1"',
            compressed_public_key:
              '"028f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039"',
            public_key:
              '"048f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039e88803650af44072ecd9c85837701916bb48259ccb39720808402f1e5e008a32"',
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
              '"7E06B7D903A515F366AC93EBA5A5598130B9A85984BC9A644999AE793B544547"',
            big_r:
              '"03BFEA95308F38CBA7C8AF5831EA8CC35D418C4E574ADE5B77B38A1E565AF7E8E1"',
            compressed_public_key:
              '"028f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039"',
            public_key:
              '"048f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039e88803650af44072ecd9c85837701916bb48259ccb39720808402f1e5e008a32"',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
    ];

    await expect(combinePKPSignNodeShares(shares)).rejects.toThrow(
      NoValidShares
    );
  });

  it('should combine shares from lit action signed data using ECDSA', async () => {
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
              '"89936DDC19D3A6A16C65CE5B40E41AB19258D04986B78FE6C3EEB2F37C996099"',
            big_r:
              '"03BFEA95308F38CBA7C8AF5831EA8CC35D418C4E574ADE5B77B38A1E565AF7E8E1"',
            compressed_public_key:
              '"028f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039"',
            public_key:
              '"048f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039e88803650af44072ecd9c85837701916bb48259ccb39720808402f1e5e008a32"',
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
              '"3817ED8D97A7DA25DB20911CD57E0B90A83FA4A22DCE411A5C5B3409C92B338C"',
            big_r:
              '"03BFEA95308F38CBA7C8AF5831EA8CC35D418C4E574ADE5B77B38A1E565AF7E8E1"',
            compressed_public_key:
              '"028f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039"',
            public_key:
              '"048f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039e88803650af44072ecd9c85837701916bb48259ccb39720808402f1e5e008a32"',
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
              '"7E06B7D903A515F366AC93EBA5A5598130B9A85984BC9A644999AE793B544547"',
            big_r:
              '"03BFEA95308F38CBA7C8AF5831EA8CC35D418C4E574ADE5B77B38A1E565AF7E8E1"',
            compressed_public_key:
              '"028f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039"',
            public_key:
              '"048f9710cb7eeea2cfa126d9103e471c776a2d1b5263d29176587d1a86b12dc039e88803650af44072ecd9c85837701916bb48259ccb39720808402f1e5e008a32"',
            sig_type: 'EcdsaK256Sha256',
          },
        },
      },
    ];
    const combinedSignature: CleanLitNodeSignature = {
      signature:
        '0xBFEA95308F38CBA7C8AF5831EA8CC35D418C4E574ADE5B77B38A1E565AF7E8E13FB21342B52096BAAE32F363BC077FC4B0A3405E89F9CB29AA1136E9B0E2982B',
      verifyingKey:
        '0x3056301006072A8648CE3D020106052B8104000A034200048F9710CB7EEEA2CFA126D9103E471C776A2D1B5263D29176587D1A86B12DC039E88803650AF44072ECD9C85837701916BB48259CCB39720808402F1E5E008A32',
      signedData:
        '0x74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0',
      recoveryId: 1,
    };

    await expect(combinePKPSignNodeShares(shares)).resolves.toEqual(
      combinedSignature
    );
  });

  it('should combine shares from lit action signed data using FROST', async () => {
    const shares: PKPSignEndpointResponse[] = [
      {
        success: true,
        signedData: [1, 2, 3, 4, 5],
        signatureShare: {
          FrostSignedMessageShare: {
            message: '0102030405',
            result: 'success',
            share_id:
              '["Ed25519Sha512",[229,242,127,190,79,231,53,41,103,129,79,210,21,111,246,106,35,29,126,255,3,70,87,183,242,91,230,44,3,61,116,3]]',
            peer_id:
              'b104a1b35585fec58cbb632d17fbe60b10297d7853261ea9054d5e372952936a',
            signature_share:
              '["Ed25519Sha512","cd29ec508f37df75da5617add256cc3ed6c9f1176804ed6fd0c07cd912d2d60f"]',
            signing_commitments:
              '["Ed25519Sha512","00b169f0da371b4893357499464f33f9697082948d307403ee5066c06ffa42488cae2a9a8c1fa727d7f47b70cd0e8f3b7b01f23c4481fca18a54c9974a58072dd29986e4c8"]',
            verifying_share:
              '["Ed25519Sha512","a51fdfe8f71bbdff7fe6de23950aaa3aed215d42e6efc877d604eac1526340bb"]',
            public_key:
              '["Ed25519Sha512","365fd6758f9001e6460abf3af94b975afb25f362cf5d918438e9df41c5c18d51"]',
            sig_type: 'SchnorrEd25519Sha512',
          },
        },
      },
      {
        success: true,
        signedData: [1, 2, 3, 4, 5],
        signatureShare: {
          FrostSignedMessageShare: {
            message: '0102030405',
            result: 'success',
            share_id:
              '["Ed25519Sha512",[133,105,1,43,107,189,19,79,100,113,137,109,5,182,163,167,182,34,140,214,3,95,44,102,178,192,50,247,195,232,33,2]]',
            peer_id:
              '5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a',
            signature_share:
              '["Ed25519Sha512","b67a3a373935f3ba1c936130d4a218e2b4f0938432eaa1e69c224fcbd500de09"]',
            signing_commitments:
              '["Ed25519Sha512","00b169f0da5a30c8476e01ad57a1efe5eabc75a1986e6cfe28f7fec2db304701492e561daa5bcf16b6ab41148b7355ac88eb0f6107a70863699c7f58f8a50114fe5a1536e7"]',
            verifying_share:
              '["Ed25519Sha512","1dd439c815ceaf7157cf7352a3b7cf2244e6509ea5e88a1c686a50779e05559b"]',
            public_key:
              '["Ed25519Sha512","365fd6758f9001e6460abf3af94b975afb25f362cf5d918438e9df41c5c18d51"]',
            sig_type: 'SchnorrEd25519Sha512',
          },
        },
      },
      {
        success: true,
        signedData: [1, 2, 3, 4, 5],
        signatureShare: {
          FrostSignedMessageShare: {
            message: '0102030405',
            result: 'success',
            share_id:
              '["Ed25519Sha512",[120,2,187,138,101,21,192,99,172,206,182,184,45,83,216,198,184,93,183,55,83,34,185,90,150,221,88,228,91,232,123,2]]',
            peer_id:
              '6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151',
            signature_share:
              '["Ed25519Sha512","8ec47092d3019deab5b338ee651cc1abb08b834e7ec4c501daddd38881109903"]',
            signing_commitments:
              '["Ed25519Sha512","00b169f0da8086dadbbea30cd0aaae8d1ed233b34fd97b43801726a3de8db45631f5c32e46ba759f778caff9f059bb1cccb3d82deddf51ea2b141bde38ca7b04790b398658"]',
            verifying_share:
              '["Ed25519Sha512","43d71074f58e0548f14e1aaf7a1f65d49a0a07fc657a4757ba00720739628541"]',
            public_key:
              '["Ed25519Sha512","365fd6758f9001e6460abf3af94b975afb25f362cf5d918438e9df41c5c18d51"]',
            sig_type: 'SchnorrEd25519Sha512',
          },
        },
      },
    ];
    const combinedSignature: CleanLitNodeSignature = {
      signature:
        '0x2aa5af31b860e5fdf8c2aeaa25db347a0220e834d25d7eabb8be14828b2e83c92495a1bd810b5dc3d600ba282e1cc7b73b4609eb18b3545847c19f2d6ae34d0d',
      verifyingKey:
        '0x365fd6758f9001e6460abf3af94b975afb25f362cf5d918438e9df41c5c18d51',
      signedData: '0x0102030405',
      recoveryId: null,
    };

    await expect(combinePKPSignNodeShares(shares)).resolves.toEqual(
      combinedSignature
    );
  });
});

describe('walletEncrypt and walletDecrypt', () => {
  it('should encrypt and decrypt a message successfully', async () => {
    // Generate key pairs using the box functionality
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();

    console.log('aliceKeyPair', aliceKeyPair);
    console.log('bobKeyPair', bobKeyPair);

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    console.log('encryptedPayload', encryptedPayload);

    // Verify payload structure
    expect(encryptedPayload).toHaveProperty('V1');
    expect(encryptedPayload.V1).toHaveProperty('verification_key');
    expect(encryptedPayload.V1).toHaveProperty('ciphertext_and_tag');
    expect(encryptedPayload.V1).toHaveProperty('session_signature');
    expect(encryptedPayload.V1).toHaveProperty('random');
    expect(encryptedPayload.V1).toHaveProperty('created_at');

    // Bob decrypts the message from Alice
    const decryptedMessage = await walletDecrypt(
      bobKeyPair.secretKey,
      encryptedPayload
    );

    // Verify decryption was successful
    expect(decryptedMessage).not.toBeNull();
    expect(new TextDecoder().decode(decryptedMessage as Uint8Array)).toBe(
      'This is a secret message'
    );
  });

  it('should return null when decryption fails', async () => {
    // Generate key pairs
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();
    const eveKeyPair = nacl.box.keyPair(); // Eve is an eavesdropper

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    // Eve tries to decrypt the message with her key (should fail)
    const decryptedByEve = await walletDecrypt(
      eveKeyPair.secretKey,
      encryptedPayload
    );

    // Verify decryption failed
    expect(decryptedByEve).toBeNull();
  });

  it('should handle tampering with the encrypted payload', async () => {
    // Generate key pairs
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    // Tamper with the ciphertext
    const tamperedPayload = {
      ...encryptedPayload,
      V1: {
        ...encryptedPayload.V1,
        ciphertext_and_tag:
          encryptedPayload.V1.ciphertext_and_tag.substring(0, 10) +
          'ff' +
          encryptedPayload.V1.ciphertext_and_tag.substring(12),
      },
    };

    // Bob tries to decrypt the tampered message
    const decryptedTamperedMessage = await walletDecrypt(
      bobKeyPair.secretKey,
      tamperedPayload
    );

    // Verify decryption failed due to tampering
    expect(decryptedTamperedMessage).toBeNull();
  });
});

describe('walletEncrypt and walletDecrypt', () => {
  it('should encrypt and decrypt a message successfully', async () => {
    // Generate key pairs using the box functionality
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();

    console.log('aliceKeyPair', aliceKeyPair);
    console.log('bobKeyPair', bobKeyPair);

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    console.log('encryptedPayload', encryptedPayload);

    // Verify payload structure
    expect(encryptedPayload).toHaveProperty('V1');
    expect(encryptedPayload.V1).toHaveProperty('verification_key');
    expect(encryptedPayload.V1).toHaveProperty('ciphertext_and_tag');
    expect(encryptedPayload.V1).toHaveProperty('session_signature');
    expect(encryptedPayload.V1).toHaveProperty('random');
    expect(encryptedPayload.V1).toHaveProperty('created_at');

    // Bob decrypts the message from Alice
    const decryptedMessage = await walletDecrypt(
      bobKeyPair.secretKey,
      encryptedPayload
    );

    // Verify decryption was successful
    expect(decryptedMessage).not.toBeNull();
    expect(new TextDecoder().decode(decryptedMessage as Uint8Array)).toBe(
      'This is a secret message'
    );
  });

  it('should return null when decryption fails', async () => {
    // Generate key pairs
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();
    const eveKeyPair = nacl.box.keyPair(); // Eve is an eavesdropper

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    // Eve tries to decrypt the message with her key (should fail)
    const decryptedByEve = await walletDecrypt(
      eveKeyPair.secretKey,
      encryptedPayload
    );

    // Verify decryption failed
    expect(decryptedByEve).toBeNull();
  });

  it('should handle tampering with the encrypted payload', async () => {
    // Generate key pairs
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    // Tamper with the ciphertext
    const tamperedPayload = {
      ...encryptedPayload,
      V1: {
        ...encryptedPayload.V1,
        ciphertext_and_tag:
          encryptedPayload.V1.ciphertext_and_tag.substring(0, 10) +
          'ff' +
          encryptedPayload.V1.ciphertext_and_tag.substring(12),
      },
    };

    // Bob tries to decrypt the tampered message
    const decryptedTamperedMessage = await walletDecrypt(
      bobKeyPair.secretKey,
      tamperedPayload
    );

    // Verify decryption failed due to tampering
    expect(decryptedTamperedMessage).toBeNull();
  });
});
