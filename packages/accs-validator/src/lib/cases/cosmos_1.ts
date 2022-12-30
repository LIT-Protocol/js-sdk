// https://developer.litprotocol.com/docs/AccessControlConditions/cosmosConditions
export default [
  {
    conditionType: "cosmos",
    path: "/cosmos/bank/v1beta1/balances/:userAddress",
    chain: 'cosmos',
    returnValueTest: {
      key: "$.balances[0].amount",
      comparator: ">=",
      value: "1000000", // equals 1 ATOM
    },
  },
];