// https://developer.litprotocol.com/docs/AccessControlConditions/solRpcConditions
export default [
  {
    method: "getTokenAccountBalance",
    params: ["E7aAccig7X3X4pSWjf1eqqUJkV3EbzG6DrtyM2gbuuhH"],
    chain: 'solana',
    returnValueTest: {
      key: "amount",
      comparator: ">",
      value: "0",
    },
  },
];