import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import type { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import {
  PKPData,
  PKPDataSchema,
} from '../../../../schemas/shared/PKPDataSchema';
import { LitTxRes } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

export async function mintNext(
  _: any,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxRes<PKPData>> {
  const { pkpHelperContract, pkpNftContract, publicClient, walletClient } =
    createContractsManager(networkCtx, accountOrWalletClient);

  const mintCost = await pkpNftContract.read.mintCost();

  const hash = await callWithAdjustedOverrides(
    pkpNftContract,
    'mintNext',
    [2],
    {
      value: mintCost,
    }
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  // {
  //   eventName: "PKPMinted",
  //   args: {
  //     tokenId: 46617443650351102737177954764827728186501111543181803171452029133339804161639n,
  //     pubkey: "0x045fb12df3d5c8482ab64f7cef10b7c44f9a55256e14ffe8bebe0c526279daa8379fd576b5ea5d26bc0b0973a1260138dfce3951b83378414acf8fe02fea299ccf",
  //   },
  // },
  const args = decodedLogs.find((log) => log.eventName === 'PKPMinted')?.args;

  const data = PKPDataSchema.parse(args);

  return { hash, receipt, decodedLogs, data };
}
