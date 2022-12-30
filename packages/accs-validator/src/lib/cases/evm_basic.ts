// https://developer.litprotocol.com/docs/AccessControlConditions/EVM/basicExamples
// TODO: Fail case: add one extra property
// TODO: Fail case: miss one property
export default [
  {
    contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
    standardContractType: 'ERC1155',
    chain: 'ethereum',
    method: 'balanceOf',
    parameters: [':userAddress', '9541'],
    returnValueTest: {
      comparator: '>',
      value: '0',
    },
  },
];
