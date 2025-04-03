import { DatilContext } from 'services/lit/LitNetwork/vDatil/types';
import {
  ClaimAndMintRaw,
  ClaimAndMintSchema,
} from '../../../../schemas/ClaimAndMintSchema';
import {
  PKPData,
  PKPDataSchema,
} from '../../../../schemas/shared/PKPDataSchema';
import { LitTxRes } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { createLitContracts } from '../../../utils/createLitContracts';
import { decodeLogs } from '../../../utils/decodeLogs';

export async function claimAndMint(
  request: ClaimAndMintRaw,
  networkCtx: DatilContext
): Promise<LitTxRes<PKPData>> {
  const validatedRequest = ClaimAndMintSchema.parse(request);

  const { derivedKeyId, signatures } = validatedRequest;

  const { pkpNftContract, publicClient, stakingContract, walletClient } =
    createLitContracts(networkCtx);

  // Get mint cost
  const mintCost = await pkpNftContract.read.mintCost();
  const ECDSA_SECP256K1 = 2n;

  const hash = await callWithAdjustedOverrides(
    pkpNftContract,
    'claimAndMint',
    [ECDSA_SECP256K1, derivedKeyId, signatures, stakingContract.address],
    {
      value: mintCost,
    }
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(receipt.logs, networkCtx);

  const args = decodedLogs.find((log) => log.eventName === 'PKPMinted')?.args;

  const data = PKPDataSchema.parse(args);

  return { hash, receipt, decodedLogs, data };
}
