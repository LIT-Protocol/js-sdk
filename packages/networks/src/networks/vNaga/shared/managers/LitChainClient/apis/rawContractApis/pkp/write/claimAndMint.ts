import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../../contract-manager/createContractsManager';
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
import { decodeLogs } from '../../../utils/decodeLogs';
export async function claimAndMint(
  request: ClaimAndMintRaw,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxRes<PKPData>> {
  const validatedRequest = ClaimAndMintSchema.parse(request);

  const { derivedKeyId, signatures } = validatedRequest;

  const { pkpNftContract, publicClient, stakingContract, walletClient } =
    createContractsManager(networkCtx, accountOrWalletClient);

  // Get mint cost
  const mintCost = await pkpNftContract.read.mintCost();
  const ECDSA_SECP256K1 = 2n;

  // Default key set ID for naga networks
  const DEFAULT_KEY_SET_ID = 'naga-keyset1';

  const hash = await callWithAdjustedOverrides(
    pkpNftContract,
    'claimAndMint',
    [
      networkCtx.networkSpecificConfigs.realmId,
      ECDSA_SECP256K1,
      DEFAULT_KEY_SET_ID,
      derivedKeyId,
      signatures,
      stakingContract.address,
    ],
    {
      value: mintCost,
      account: null,
      chain: null,
    }
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  const args = decodedLogs.find((log) => log.eventName === 'PKPMinted')?.args;

  const data = PKPDataSchema.parse(args);

  return { hash, receipt, decodedLogs, data };
}
