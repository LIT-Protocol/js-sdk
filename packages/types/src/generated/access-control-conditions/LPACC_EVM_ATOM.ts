/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface LPACC_EVM_ATOM {
  conditionType?: string;
  path: string;
  chain: "cosmos" | "kyve" | "evmosCosmos" | "evmosCosmosTestnet";
  method?: string;
  parameters?: string[];
  returnValueTest: {
    key: string;
    comparator: "contains" | "=" | ">" | ">=" | "<" | "<=";
    value: string;
  };
}
