// https://developer.litprotocol.com/docs/AccessControlConditions/solRpcConditions
export default [
    {
      method: "getBalance",
      params: [":userAddress"],
      chain: 'solana',
      returnValueTest: {
        key: "",
        comparator: ">=",
        value: "100000000", // equals 0.1 SOL
      },
    },
  ];