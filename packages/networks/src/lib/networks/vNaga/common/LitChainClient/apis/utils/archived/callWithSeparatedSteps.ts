import {
  Chain,
  Hash,
  PublicClient,
  WalletClient,
  encodeFunctionData,
} from "viem";
import { GAS_LIMIT_ADJUSTMENT } from "../../../_config";

/**
 * Similar to {@link callWithAdjustedOverrides}, key difference is that it allows granular processing and not strongly-typed.
 * That's because we are not using an instance of a contract, so we can't infer the correct types.
 *
 * @param {object} params - The parameters for the contract interaction
 * @param {object} params.abi - The ABI of the contract
 * @param {string} params.address - The address of the contract
 * @param {string} params.functionName - The name of the function to call
 * @param {any[]} params.args - The arguments to pass to the function
 * @param {object} params.overrides - Optional transaction overrides (e.g. value)
 * @param {object} params.clients - The viem clients needed for the transaction
 * @param {object} params.clients.publicClient - The public client for reading from the chain
 * @param {object} params.clients.walletClient - The wallet client for sending transactions
 * @param {object} params.chain - The chain configuration
 * 
 * @example
 const hash = await callWithSeparatedSteps({
    abi: [parseAbiItem(abiStringSignature)],
    address: contractAddress,
    functionName: "mintNextAndAddAuthMethods",
    args: [
      validatedRequest.keyType,
      validatedRequest.permittedAuthMethodTypes,
      validatedRequest.permittedAuthMethodIds,
      validatedRequest.permittedAuthMethodPubkeys,
      validatedRequest.permittedAuthMethodScopes,
      validatedRequest.addPkpEthAddressAsPermittedAddress,
      // validatedRequest.sendPkpToItself,
    ],
    chain: networkCtx.chainConfig.chain,
    clients: {
      publicClient,
      walletClient,
    },
    overrides: {
      value: mintCost,
    },
  });
 * 
 * @returns {Promise<Hash>} The transaction hash
 */

export async function callWithSeparatedSteps({
  abi,
  address,
  functionName,
  args,
  overrides = {},
  clients: { publicClient, walletClient },
  chain,
}: {
  abi: any[];
  address: `0x${string}`;
  functionName: string;
  args: any[];
  overrides?: {
    value?: bigint;
    gas?: bigint;
    [key: string]: any;
  };
  clients: {
    publicClient: PublicClient;
    walletClient: WalletClient;
  };
  chain: Chain;
}): Promise<Hash> {
  // Step 1: Encode function data
  const encodedData = encodeFunctionData({
    abi,
    functionName,
    args,
  });

  console.log("encodedData:", encodedData);

  // Step 2: Estimate gas
  const estimatedGas = await publicClient.estimateGas({
    account: walletClient.account!,
    to: address,
    data: encodedData,
    value: overrides.value || 0n,
  });

  console.log("estimatedGas:", estimatedGas);

  // Apply gas adjustment for Arbitrum Stylus contracts
  const adjustedGas =
    (estimatedGas * BigInt(GAS_LIMIT_ADJUSTMENT)) / BigInt(100);

  console.log("adjustedGas:", adjustedGas);

  // Step 3: Send transaction
  const hash = await walletClient.sendTransaction({
    account: walletClient.account!,
    to: address,
    data: encodedData,
    value: overrides.value || 0n,
    gas: adjustedGas,
    chain,
    ...overrides,
  });

  console.log("hash:", hash);

  return hash;
}
