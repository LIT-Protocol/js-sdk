import {
  datilDevNetworkContext,
  DatilDevNetworkContext,
} from '../../../../../../../vDatil/datil-dev/networkContext';
import { CallExecutionError, ContractFunctionRevertedError } from 'viem';
import { claimAndMint } from './claimAndMint';
import { createLitContracts } from '../../../utils/createLitContracts';
import { ClaimAndMintSchema } from '../../../../schemas/ClaimAndMintSchema';

describe('LitChainClient', () => {
  let networkCtx: DatilDevNetworkContext;

  beforeAll(async () => {
    networkCtx = datilDevNetworkContext;
  });

  test('claimAndMint', async () => {
    try {
      const tx = await claimAndMint(
        {
          derivedKeyId:
            '4d90d864b5f6adb1dd8ef5fbfc3d7ca74f6dd973f8c52ce12f8ce61aa6a1dfa4',
          signatures: [
            {
              r: '0xcc544fa05678fddff726ec2070bf0c4d2862e35f26ab74baede84dfdf117c841',
              s: '0x2286aef0cd151175c63116cd622df3ea7bb8113982525ac07c0bd50d33ee7136',
              v: 27,
            },
            {
              r: '0x7b2bbef14e4e277abe1ebb16e6803a4192c7157f2a7e190c6651b27d2b8eb98b',
              s: '0x149d547cc36f1b996afa799c854fbe8776290864d22677e57f4fbbfac952f728',
              v: 28,
            },
            {
              r: '0x59459b3830a4f5b365270a7cf559a8a4a8c90f348a68544e64fac3ed22190ad3',
              s: '0x4d2bf3d3a9520fa205a60b6031aea84c5fe788fb5198a4a453fb9e20acb05488',
              v: 28,
            },
          ],
        },
        networkCtx
      );

      console.log(tx);

      expect(tx.receipt.logs.length).toBeGreaterThan(0);
      expect(tx.hash).toBeDefined();
      expect(tx.decodedLogs.length).toBeGreaterThan(0);
    } catch (error) {
      console.log(error);

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

  test('simulate claimAndMint', async () => {
    const validatedRequest = ClaimAndMintSchema.parse({
      derivedKeyId:
        'fa9c79fc322d407c2b1f9e1589edd444c95bbadf4baf1f3a2863d33ee1ff7ab4',
      signatures: [
        {
          r: '0x87446889e5e551d88e968788d4f9651adcff0d2f4188ea9a27fe5d2436ddea9b',
          s: '0x132ff3bdb078365c83bb5d24ee2c05408155b24234b39b962c8321a82d0c1f7f',
          v: 27,
        },
        {
          r: '0xb15a8ed3a10f919301307ef463a72d40079c163107f43393cbf65701c73902de',
          s: '0x20a4f1469c935363ac9cea5a7c5b65ffbd8f37c5d48be5c2e15966c9bbddde06',
          v: 27,
        },
        {
          r: '0x97dee43dfbf3be22bc530e5322b33bf6a571d15c234e3d2251207d6c888bf140',
          s: '0x7cfab33b2d4a9140089d2f0a4178b5fad0725fef4b6335741684f99715539bd1',
          v: 27,
        },
      ],
    });
    const { derivedKeyId, signatures } = validatedRequest;
    const { pkpNftContract, publicClient, stakingContract, walletClient } =
      createLitContracts(networkCtx);

    const mintCost = await pkpNftContract.read.mintCost();

    const result = await publicClient.simulateContract({
      address: pkpNftContract.address,
      abi: pkpNftContract.abi,
      functionName: 'claimAndMint',
      args: [2n, derivedKeyId, signatures, stakingContract.address],
      value: mintCost,
      account: walletClient.account!,
    });

    expect(result.result).toBe(
      39540774701362869188416741706549054806716702330527798538695592469657559009284n
    );
  });
});
