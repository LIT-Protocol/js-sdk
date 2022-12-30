// https://developer.litprotocol.com/docs/AccessControlConditions/EVM/timelock
export default [
  {
    contractAddress: "",
    standardContractType: "timestamp",
    chain: "ethereum",
    method: "eth_getBlockByNumber",
    parameters: ["latest"],
    returnValueTest: {
      comparator: ">=",
      value: "1651276942"
    },
  },
];