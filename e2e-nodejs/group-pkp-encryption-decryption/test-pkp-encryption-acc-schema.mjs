import path from 'path';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { success, fail, testThese } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';

const chain = 'ethereum';

const accessControlConditionsTestSuccess = (testName, accessControlConditions) => async () => {
  // ==================== Test Logic ====================
  try {
    await LitJsSdk.encryptString(
      {
        ...accessControlConditions,
        authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
        chain,
        dataToEncrypt: 'Hello world',
      },
      client
    );
  } catch (e) {
    // ==================== Fail ====================
    return fail(
      `${testName} failed validating access control conditions schemas`
    );
  }

  // ==================== Post-Validation ====================
  return success(
    `${testName} validated access control conditions schemas successfully`
  );
}

const accessControlConditionsTestFailure = (testName, accessControlConditions) => async () => {
  // ==================== Test Logic ====================
  try {
    await LitJsSdk.encryptString(
      {
        ...accessControlConditions,
        authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
        chain,
        dataToEncrypt: 'Hello world',
      },
      client
    );
  } catch (e) {
    if (e.errorKind === 'Validation') {
      // ==================== Success ====================
      return success(
        `${testName} validated access control conditions schemas successfully`
      );
    }
  }

  // ==================== Post-Validation ====================
  return fail(
    `${testName} should reject access control conditions with incorrect schemas`
  );
}

// Success cases
const evmBasicAccessControlConditions = [
  {
    contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
    standardContractType: 'ERC1155',
    chain,
    method: 'balanceOf',
    parameters: [':userAddress', '8'],
    returnValueTest: {
      comparator: '>',
      value: '0',
    },
  },
];
const evmBasicBooleanAccessControlConditions = [
  {
    contractAddress: '0x22C1f6050E56d2876009903609a2cC3fEf83B415',
    standardContractType: 'POAP',
    chain: 'xdai',
    method: 'eventId',
    parameters: [],
    returnValueTest: {
      comparator: '=',
      value: '37582',
    },
  },
  {
    operator: 'or',
  },
  {
    contractAddress: '0x22C1f6050E56d2876009903609a2cC3fEf83B415',
    standardContractType: 'POAP',
    chain: 'ethereum',
    method: 'eventId',
    parameters: [],
    returnValueTest: {
      comparator: '=',
      value: '37582',
    },
  },
];
const evmBasicNestedAccessControlConditions = [
  ...evmBasicAccessControlConditions,
  {
    operator: 'or',
  },
  evmBasicBooleanAccessControlConditions,
];
const evmContractAccessControlConditions = [
  {
    contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
    functionName: 'balanceOf',
    functionParams: [':userAddress', '8'],
    functionAbi: {
      type: 'function',
      stateMutability: 'view',
      outputs: [
        {
          type: 'uint256',
          name: '',
          internalType: 'uint256',
        },
      ],
      name: 'balanceOf',
      inputs: [
        {
          type: 'address',
          name: 'account',
          internalType: 'address',
        },
        {
          type: 'uint256',
          name: 'id',
          internalType: 'uint256',
        },
      ],
    },
    chain,
    returnValueTest: {
      key: '',
      comparator: '>',
      value: '0',
    },
  },
];
const solAccessControlConditions = [
  {
    method: 'getBalance',
    params: [':userAddress'],
    pdaParams: [],
    pdaInterface: { offset: 0, fields: {} },
    pdaKey: '',
    chain: 'solanaTestnet',
    returnValueTest: {
      key: '',
      comparator: '>=',
      value: '100000000', // equals 0.1 SOL
    },
  },
];
const cosmosAccessControlConditions = [
  {
    conditionType: 'cosmos',
    path: ':userAddress',
    chain: 'cosmos',
    returnValueTest: {
      key: '',
      comparator: '=',
      value: 'cosmos1vn6zl0924yj86jrp330wcwjclzdharljq03a8h',
    },
  },
];
const unifiedAccessControlConditions = [
  {
    conditionType: 'solRpc',
    method: 'getBalance',
    params: [':userAddress'],
    chain: 'solana',
    pdaParams: [],
    pdaInterface: { offset: 0, fields: {} },
    pdaKey: '',
    returnValueTest: {
      key: '',
      comparator: '>=',
      value: '100000000', // equals 0.1 SOL
    },
  },
  { operator: 'or' },
  {
    conditionType: 'evmBasic',
    contractAddress: '',
    standardContractType: '',
    chain: 'ethereum',
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '10000000000000',
    },
  },
  { operator: 'or' },
  {
    conditionType: 'evmContract',
    contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
    functionName: 'balanceOf',
    functionParams: [':userAddress', '8'],
    functionAbi: {
      type: 'function',
      stateMutability: 'view',
      outputs: [
        {
          type: 'uint256',
          name: '',
          internalType: 'uint256',
        },
      ],
      name: 'balanceOf',
      inputs: [
        {
          type: 'address',
          name: 'account',
          internalType: 'address',
        },
        {
          type: 'uint256',
          name: 'id',
          internalType: 'uint256',
        },
      ],
    },
    chain: 'polygon',
    returnValueTest: {
      key: '',
      comparator: '>',
      value: '0',
    },
  },
];
// Failing cases
const noConditions = [];
const evmBasicAccessControlConditionsWithMissingFields = [
  {
    contractAddress: '',
    // standardContractType: '',
    // chain,
    // method: 'eth_getBalance',
    // parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
];
const evmBasicNestedAccessControlConditionsWithMissingFields = [
  {
    contractAddress: '',
    standardContractType: '',
    chain,
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
  {
    operator: 'and',
  },
  [
    {
      contractAddress: '',
      standardContractType: '',
      chain,
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '1',
      },
    },
    {
      operator: 'and',
    },
    {
      contractAddress: '',
      // standardContractType: '',
      // chain,
      // method: 'eth_getBalance',
      // parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '2',
      },
    },
  ],
];
const evmBasicAccessControlConditionsWithInvalidFields = [
  {
    contractAddress: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D,
    standardContractType: 'AMM',
    chain: 'bitcoin',
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
];
const evmContractAccessControlConditionsWithMissingFields = [
  {
    // contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
    functionName: 'balanceOf',
    // functionParams: [':userAddress', '8'],
    functionAbi: {
      type: 'function',
      stateMutability: 'view',
      outputs: [
        {
          type: 'uint256',
          name: '',
          internalType: 'uint256',
        },
      ],
      name: 'balanceOf',
      inputs: [
        {
          type: 'address',
          name: 'account',
          internalType: 'address',
        },
        {
          type: 'uint256',
          name: 'id',
          internalType: 'uint256',
        },
      ],
    },
    // chain: 'polygon',
    returnValueTest: {
      key: '',
      comparator: '>',
      value: '0',
    },
  }
];
const evmContractNestedAccessControlConditionsWithInvalidFields = [
  {
    contractAddress: 0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88,
    functionName: 'balanceOf',
    functionParams: [':userAddress', '8'],
    functionAbi: {
      type: 'function',
      stateMutability: 'view',
      outputs: [
        {
          type: 'uint256',
          name: '',
          internalType: 'uint256',
        },
      ],
      name: 'balanceOf',
      inputs: [
        {
          type: 'address',
          name: 'account',
          internalType: 'address',
        },
        {
          type: 'uint256',
          name: 'id',
          internalType: 'uint256',
        },
      ],
    },
    chain: 'eth',
    returnValueTest: {
      key: '',
      comparator: '>',
      value: '0',
    },
  }
];
const solAccessControlConditionsWithMissingFields = [
  {
    method: 'getBalance',
    params: [':userAddress'],
    chain: 'solana',
    pdaParams: [],
    // pdaInterface: { offset: 0, fields: {} },
    // pdaKey: '',
    returnValueTest: {
      key: '',
      comparator: '>=',
      value: '100000000', // equals 0.1 SOL
    },
  }
];
const invalidUnifiedAccessControlConditions = [
  {
    conditionType: 'solRpc',
    method: 'getBalance',
    params: [':userAddress'],
    // chain: 'solana',
    pdaParams: [],
    pdaInterface: { offset: 0, fields: {} },
    pdaKey: '',
    returnValueTest: {
      key: '',
      comparator: '>=',
      value: '100000000', // equals 0.1 SOL
    },
  },
  { operator: 'or' },
  {
    conditionType: 'evmBasic',
    contractAddress: '',
    standardContractType: '',
    chain: 'ethereum',
    // method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '10000000000000',
    },
  },
  { operator: 'or' },
  {
    conditionType: 'evmContract',
    contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
    // functionName: 'balanceOf',
    functionParams: [':userAddress', '8'],
    functionAbi: {
      type: 'function',
      stateMutability: 'view',
      outputs: [
        {
          type: 'uint256',
          name: '',
          internalType: 'uint256',
        },
      ],
      name: 'balanceOf',
      inputs: [
        {
          type: 'address',
          name: 'account',
          internalType: 'address',
        },
        {
          type: 'uint256',
          name: 'id',
          internalType: 'uint256',
        },
      ],
    },
    // chain: 'polygon',
    returnValueTest: {
      key: '',
      comparator: '>',
      value: '0',
    },
  },
];
const invalidConditionUnifiedAccessControlConditions = [
  {
    conditionType: 'zkSync', // Does not exist
    contractAddress: '',
    standardContractType: '',
    chain: 'ethereum',
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '10000000000000',
    },
  },
]
const noTypeUnifiedAccessControlConditions = [
  {
    // conditionType: 'evmBasic',
    contractAddress: '',
    standardContractType: '',
    chain: 'ethereum',
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '10000000000000',
    },
  },
]

await testThese([
  // Success cases
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestSuccess('evmBasic', { accessControlConditions: evmBasicAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestSuccess('evmBasicBoolean', { accessControlConditions: evmBasicBooleanAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestSuccess('evmBasicNested', { accessControlConditions: evmBasicNestedAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestSuccess('evmContract', { evmContractConditions: evmContractAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestSuccess('sol', { solRpcConditions: solAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestSuccess('cosmos', { unifiedAccessControlConditions: cosmosAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestSuccess('unified', { unifiedAccessControlConditions: unifiedAccessControlConditions }) },
  // Failing cases
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('noConditions', {}) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('emptyArrayConditions', { accessControlConditions: noConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('evmBasicMissingFields', { accessControlConditions: evmBasicAccessControlConditionsWithMissingFields }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('evmBasicMissingNestedFields', { accessControlConditions: evmBasicNestedAccessControlConditionsWithMissingFields }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('evmBasicInvalidFields', { accessControlConditions: evmBasicAccessControlConditionsWithInvalidFields }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('evmContractMissingFields', { evmContractConditions: evmContractAccessControlConditionsWithMissingFields }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('evmContractInvalidFields', { evmContractConditions: evmContractNestedAccessControlConditionsWithInvalidFields }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('solMissingFields', { solRpcConditions: solAccessControlConditionsWithMissingFields }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('unifiedMissingFields', { unifiedAccessControlConditions: invalidUnifiedAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('unifiedInvalidSchema', { unifiedAccessControlConditions: invalidConditionUnifiedAccessControlConditions }) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTestFailure('unifiedNoType', { unifiedAccessControlConditions: noTypeUnifiedAccessControlConditions }) },
]);
