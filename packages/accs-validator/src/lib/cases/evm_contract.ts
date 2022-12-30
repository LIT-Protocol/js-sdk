// https://developer.litprotocol.com/docs/AccessControlConditions/EVM/customContractCalls
export default [
    {
      contractAddress: "0xb71a679cfff330591d556c4b9f21c7739ca9590c",
      functionName: "members",
      functionParams: [":userAddress"],
      functionAbi: {
        constant: true,
        inputs: [
          {
            name: "",
            type: "address",
          },
        ],
        name: "members",
        outputs: [
          {
            name: "delegateKey",
            type: "address",
          },
          {
            name: "shares",
            type: "uint256",
          },
          {
            name: "loot",
            type: "uint256",
          },
          {
            name: "exists",
            type: "bool",
          },
          {
            name: "highestIndexYesVote",
            type: "uint256",
          },
          {
            name: "jailed",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      chain: "xdai",
      returnValueTest: {
        key: "shares",
        comparator: ">=",
        value: "1",
      },
    },
  ];