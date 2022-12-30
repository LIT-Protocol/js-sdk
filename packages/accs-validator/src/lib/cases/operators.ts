// https://developer.litprotocol.com/docs/AccessControlConditions/EVM/poap
export default [
  {
    contractAddress: '0x22C1f6050E56d2876009903609a2cC3fEf83B415',
    standardContractType: 'POAP',
    chain: 'xdai',
    method: 'tokenURI',
    parameters: [],
    returnValueTest: {
      comparator: 'contains',
      value: 'Burning Man 2021',
    },
  },
  { operator: 'or' },
  {
    contractAddress: '0x22C1f6050E56d2876009903609a2cC3fEf83B415',
    standardContractType: 'POAP',
    chain: 'ethereum',
    method: 'tokenURI',
    parameters: [],
    returnValueTest: {
      comparator: 'contains',
      value: 'Burning Man 2021',
    },
  },
];
