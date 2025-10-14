import { Hash } from 'viem';

const GAS_LIMIT_INCREASE_PERCENTAGE = 10;
const GAS_LIMIT_ADJUSTMENT = BigInt(100 + GAS_LIMIT_INCREASE_PERCENTAGE);

/**
 * Strongly-typed wrapper around viem's `writeContract` that adjusts gas overrides for Arbitrum Stylus contracts
 * NOTE: It must use an instance of a contract (from `getContract` viem function) so that we can infer the correct types
 * @param contract The contract instance to call
 * @param methodName The name of the contract method to call
 * @param args The arguments to pass to the contract method
 * @param overrides Optional transaction overrides (e.g. value, gasLimit)
 * @returns A Promise that resolves to the transaction hash
 */
export async function callWithAdjustedOverrides<
  TContract extends {
    write: Record<string, (...args: any[]) => Promise<Hash>>;
    estimateGas: Record<string, (...args: any[]) => Promise<bigint>>;
  },
  TMethodName extends keyof TContract['write'],
  TFunction extends TContract['write'][TMethodName],
  TOriginalArgs extends Parameters<TFunction>[0],
  // Allow for both the original args type and an array containing the original args. Previously, TypeScript is complaining because it thinks you're passing a string[][] to something that expects a string[], but at runtime, the helper function's unwrapping behavior makes it work correctly. So when you pass [[validatedRequest.toolIpfsCids]] (double-wrapped), the helper function unwraps it once to [validatedRequest.toolIpfsCids], which is what the contract actually needs
  TArgs extends TOriginalArgs | [TOriginalArgs]
>(
  contract: TContract,
  methodName: TMethodName & string,
  args: TArgs,
  overrides?: Parameters<TFunction>[1]
): Promise<Hash> {
  // logger.info({ args });

  // Get the write function from the contract
  const writeFunction = contract.write[methodName];
  if (!writeFunction) {
    throw new Error(`Method ${methodName} not found on contract`);
  }

  if (!overrides?.gas) {
    // Otherwise estimate and adjust gas
    const estimatedGas = await contract.estimateGas[methodName](
      args,
      overrides
    );

    const adjustedGas =
      (estimatedGas * BigInt(GAS_LIMIT_ADJUSTMENT)) / BigInt(100);

    overrides = {
      ...overrides,
      gas: adjustedGas,
    };
  }

  // // For contract methods that expect array arguments, we need to pass the first array argument
  // // This handles cases where the contract method expects [arg1, arg2, ...] but we pass [[arg1, arg2, ...]]
  // const contractArgs =
  //   Array.isArray(args) && args.length === 1 && Array.isArray(args[0])
  //     ? args[0]
  //     : args;

  // console.log('contractArgs:', contractArgs);
  // process.exit();

  // Call the contract method with the provided arguments and overrides
  return writeFunction(args, overrides);
}
