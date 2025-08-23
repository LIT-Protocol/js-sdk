import type { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import {
  MintRequestRaw,
  MintRequestSchema,
} from '../../../../schemas/MintRequestSchema';
import {
  PKPData,
  PKPDataSchema,
} from '../../../../schemas/shared/PKPDataSchema';
import { LitTxRes } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';
import { hexToBytes } from 'viem';
import { ethers } from 'ethers';

async function getBytesFromIpfsCid(ipfsCid: string): Promise<`0x${string}`> {
  const decoded = ethers.utils.base58.decode(ipfsCid);

  return `0x${Buffer.from(decoded).toString('hex')}`;
}

/**
 * Mints a new Programmable Key Pair (PKP) with specified authentication methods.
 *
 * @param {MintRequestRaw} request - The request object containing PKP minting parameters
 * @param {number} request.keyType - The type of key to mint
 * @param {number[]} request.permittedAuthMethodTypes - Array of permitted authentication method types
 * @param {string[]} request.permittedAuthMethodIds - Array of permitted authentication method IDs
 * @param {string[]} request.permittedAuthMethodPubkeys - Array of permitted authentication method public keys
 * @param {string[][]} request.permittedAuthMethodScopes - Array of scopes for each authentication method
 * @param {boolean} request.addPkpEthAddressAsPermittedAddress - Whether to add the PKP's Ethereum address as a permitted address
 * @param {boolean} request.sendPkpToItself - Whether to send the PKP to itself
 *
 * @returns {Promise<LitTxRes>} Object containing transaction hash, receipt, and decoded logs
 */
export async function mintNextAndAddAuthMethods(
  request: MintRequestRaw,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxRes<PKPData>> {
  const validatedRequest = MintRequestSchema.parse(request);

  const { pkpHelperContract, pkpNftContract, publicClient, walletClient } =
    createContractsManager(networkCtx, accountOrWalletClient);

  const mintCost = await pkpNftContract.read.mintCost();

  // console.log("🔥🔥🔥 validatedRequest:", validatedRequest);

  // const ipfsCid = "QmWL2r7CPi5dDKZetRrj6eVfzwv5Y472QJew9c5B9iRU6j";
  // const ipfsCidAsBytes = await getBytesFromIpfsCid(ipfsCid);

  // const modifyRequest = {
  //   ...validatedRequest,
  //   permittedAuthMethodTypes: [88911n, 2n],
  //   permittedAuthMethodIds: [validatedRequest.permittedAuthMethodIds[0], ipfsCidAsBytes],
  //   permittedAuthMethodPubkeys: ["0x", "0x"],
  //   permittedAuthMethodScopes: [[1], [1]],
  //   addPkpEthAddressAsPermittedAddress: false,
  //   sendPkpToItself: true,
  // }

  // console.log("🔥🔥🔥 modifyRequest:", modifyRequest);

  const hash = await callWithAdjustedOverrides(
    pkpHelperContract,
    'mintNextAndAddAuthMethods',
    [
      validatedRequest.keyType,
      validatedRequest.keySetId,
      validatedRequest.permittedAuthMethodTypes,
      validatedRequest.permittedAuthMethodIds,
      validatedRequest.permittedAuthMethodPubkeys,
      validatedRequest.permittedAuthMethodScopes,
      validatedRequest.addPkpEthAddressAsPermittedAddress, // This adds as permitted address
      validatedRequest.sendPkpToItself, // This keeps control if is true, otherwise it will be added as a permitted address
    ],
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
