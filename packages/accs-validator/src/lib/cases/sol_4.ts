// https://developer.litprotocol.com/docs/AccessControlConditions/solRpcConditions
export default [
  {
    method: "balanceOfToken",
    params: ["FrYwrqLcGfmXrgJKcZfrzoWsZ3pqQB9pjjUC9PxSq3xT"],
    chain: 'solanaDevnet',
    returnValueTest: {
      key: "$.amount",
      comparator: ">",
      value: "0",
    },
  },
];

