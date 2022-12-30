// https://developer.litprotocol.com/docs/AccessControlConditions/EVM/siwe
export default [
    {
      contractAddress: "",
      standardContractType: "SIWE",
      chain: "ethereum",
      method: "",
      parameters: [":domain"],
      returnValueTest: {
        comparator: "=",
        value: "localhost:3050",
      },
    },
  ];