import { generateValidatorURLs } from "services/lit/utils/transformers";
import { toNumber } from "services/lit/utils/z-transformers";
import { z } from "zod";

const EpochInfoSchema = z.object({
  epochLength: toNumber,
  number: toNumber,
  endTime: toNumber,
  retries: toNumber,
  timeout: toNumber,
});

type EpochInfo = z.infer<typeof EpochInfoSchema>;

const ValidatorStructSchema = z.object({
  ip: z.number(),
  ipv6: z.bigint(),
  port: z.number(),
  nodeAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  reward: z.bigint(),
  senderPubKey: z.bigint(),
  receiverPubKey: z.bigint(),
});

type ValidatorStruct = z.infer<typeof ValidatorStructSchema>;

export const GetActiveUnkickedValidatorStructsAndCountsSchema = z
  .array(z.union([EpochInfoSchema, toNumber, z.array(ValidatorStructSchema)]))
  .transform((ctx) => {
    const epochInfo = ctx[0] as EpochInfo;
    const minNodeCount = ctx[1];
    const activeUnkickedValidatorStructs = ctx[2] as ValidatorStruct[];

    const validatorURLs = generateValidatorURLs(activeUnkickedValidatorStructs);

    if (!minNodeCount) {
      throw new Error("❌ Minimum validator count is not set");
    }

    if (validatorURLs.length < Number(minNodeCount)) {
      throw new Error(
        `❌ Active validator set does not meet the consensus. Required: ${minNodeCount} but got: ${activeUnkickedValidatorStructs.length}`
      );
    }

    return {
      epochInfo,
      minNodeCount,
      validatorURLs,
    };
  });

// ✨ Two types from the same schema:
// 1. User Input Type - this is the type that the user will input, eg. the API we expose for the user to call, could be a function of a request body from a POST request. (e.g., number, string, etc.)
// 2. Transformed/Validated Type - this is the type after the user input has been transformed and validated. Usually used for smart contract calls or external API calls (such as communication with nodes). (e.g., BigInt, etc.)
export type GetActiveUnkickedValidatorStructsAndCountsRaw = z.input<
  typeof GetActiveUnkickedValidatorStructsAndCountsSchema
>;
export type GetActiveUnkickedValidatorStructsAndCountsTransformed = z.infer<
  typeof GetActiveUnkickedValidatorStructsAndCountsSchema
>;
