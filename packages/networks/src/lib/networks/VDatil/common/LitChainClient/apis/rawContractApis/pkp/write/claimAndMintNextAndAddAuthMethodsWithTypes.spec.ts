import {
  datilDevNetworkContext,
  DatilDevNetworkContext,
} from '../../../../../../../vDatil/datil-dev/networkContext';
import { CallExecutionError, ContractFunctionRevertedError } from 'viem';
import { claimAndMintNextAndAddAuthMethodsWithTypes } from './claimAndMintNextAndAddAuthMethodsWithTypes';

describe('LitChainClient', () => {
  let networkCtx: DatilDevNetworkContext;

  beforeAll(async () => {
    networkCtx = datilDevNetworkContext;
  });

  test('claimAndMintNextAndAddAuthMethodsWithTypes', async () => {
    try {
      const tx = await claimAndMintNextAndAddAuthMethodsWithTypes(
        {
          derivedKeyId:
            '62439a75ed81afa9366245c9107c413315a141b27129bd6340a9a7f9e63898a9',
          signatures: [
            {
              r: '0x08b8b9092f0e0a312b00be491382658ac18b3d6cb42c08a17b73eeeb92d7ac54',
              s: '0x06da29df3f35b9db99cbfd20ebee83226777ebe52163f6cfe31baa25c829eb8a',
              v: 27,
            },
            {
              r: '0x630e08a6feca8bc5d4078d87d8e846a7945bf0a8251d33f282a705ffedfce159',
              s: '0x762fb3380187746975241f2441cf7579053517826ebf6baa798c820db565956f',
              v: 28,
            },
            {
              r: '0x3757d04ea285fe52ec9efde9ae71d9f7113822ed7f34e112f5fbf4350c5161cc',
              s: '0x027884f5fc8fb0079a4ce9d2c1021874ce36c3d1eca5a8832f85a5abcf9f50af',
              v: 28,
            },
          ],
          authMethodType: 1,
          authMethodId: '0x',
          authMethodPubkey: '0x',
        },
        networkCtx
      );

      console.log(tx);

      expect(tx.receipt.logs.length).toBeGreaterThan(0);
      expect(tx.hash).toBeDefined();
      expect(tx.decodedLogs.length).toBeGreaterThan(0);
    } catch (error) {
      console.warn(`❗️If you want to pass this test then you need to generate a new unique keyId eg. 
const res = await devEnv.litNodeClient.executeJs({
  authContext: getEoaAuthContext(devEnv, alice),
  code: \`(async () => {
    Lit.Actions.claimKey({keyId: "my-very-unique-key-id"});
  })();\`,
});
        `);

      const reason = (
        (error as CallExecutionError).cause as ContractFunctionRevertedError
      ).reason;
      expect(reason).toBe('PubkeyRouter: pubkey already has routing data');
    }
  });
});
