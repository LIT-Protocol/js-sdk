import { DatilContext } from 'services/lit/LitNetwork/vDatil/types';
import {
  ClaimRequestRaw,
  ClaimRequestSchema,
} from '../../../../schemas/ClaimRequestSchema';
import {
  PKPData,
  PKPDataSchema,
} from '../../../../schemas/shared/PKPDataSchema';
import { LitTxRes } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { createLitContracts } from '../../../utils/createLitContracts';
import { decodeLogs } from '../../../utils/decodeLogs';

/**
 * Claims and mints a PKP using derived key ID and signatures, then adds authentication methods.
 *
 * @param {ClaimRequestRaw} request - The request object containing PKP claiming parameters
 * @param {string} request.derivedKeyId - The derived key ID for claiming
 * @param {Signature[]} request.signatures - Array of signatures required for claiming
 * @param {number} request.authMethodType - The type of authentication method to add
 * @param {string} request.authMethodId - The ID of the authentication method
 * @param {string} request.authMethodPubkey - The public key of the authentication method
 *
 * @returns {Promise<LitTxRes>} Object containing transaction hash, receipt, and decoded logs
 */
export async function claimAndMintNextAndAddAuthMethodsWithTypes(
  request: ClaimRequestRaw,
  networkCtx: DatilContext
): Promise<LitTxRes<PKPData>> {
  const validatedRequest = ClaimRequestSchema.parse(request);
  const { pkpHelperContract, pkpNftContract, publicClient } =
    createLitContracts(networkCtx);

  // Get mint cost
  const mintCost = await pkpNftContract.read.mintCost();
  const ECDSA_SECP256K1 = 2n;

  const AUTH_METHOD_SCOPE = {
    SIGN_ANYTHING: 1n,
    PERSONAL_SIGN: 2n,
  } as const;

  const claimMaterial = {
    keyType: ECDSA_SECP256K1,
    derivedKeyId: validatedRequest.derivedKeyId,
    signatures: validatedRequest.signatures,
  };

  const authMethodData = {
    keyType: ECDSA_SECP256K1,
    permittedIpfsCIDs: [],
    permittedIpfsCIDScopes: [],
    permittedAddresses: [],
    permittedAddressScopes: [],
    permittedAuthMethodTypes: [validatedRequest.authMethodType],
    permittedAuthMethodIds: [validatedRequest.authMethodId],
    permittedAuthMethodPubkeys: [validatedRequest.authMethodPubkey],
    permittedAuthMethodScopes: [[AUTH_METHOD_SCOPE.SIGN_ANYTHING]],
    addPkpEthAddressAsPermittedAddress: true,
    sendPkpToItself: true,
  };

  const hash = await callWithAdjustedOverrides(
    pkpHelperContract,
    'claimAndMintNextAndAddAuthMethodsWithTypes',
    [claimMaterial, authMethodData],
    {
      value: mintCost,
    }
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const decodedLogs = await decodeLogs(receipt.logs, networkCtx);

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
