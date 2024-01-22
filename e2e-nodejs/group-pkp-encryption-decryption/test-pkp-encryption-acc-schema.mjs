import path from 'path';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { success, fail, testThese } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';

const chain = 'ethereum';

const accessControlConditionsTest = (testName, accessControlConditions) => async () => {
  // ==================== Test Logic ====================
  try {
    await LitJsSdk.encryptString(
      {
        accessControlConditions,
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
    // contractAddress: "0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88",
    functionName: "balanceOf",
    // functionParams: [":userAddress", "8"],
    functionAbi: {
      type: "function",
      stateMutability: "view",
      outputs: [
        {
          type: "uint256",
          name: "",
          internalType: "uint256",
        },
      ],
      name: "balanceOf",
      inputs: [
        {
          type: "address",
          name: "account",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "id",
          internalType: "uint256",
        },
      ],
    },
    // chain: "polygon",
    returnValueTest: {
      key: "",
      comparator: ">",
      value: "0",
    },
  }
];
const evmContractNestedAccessControlConditionsWithInvalidFields = [
  {
    contractAddress: 0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88,
    functionName: "balanceOf",
    functionParams: [":userAddress", "8"],
    functionAbi: {
      type: "function",
      stateMutability: "view",
      outputs: [
        {
          type: "uint256",
          name: "",
          internalType: "uint256",
        },
      ],
      name: "balanceOf",
      inputs: [
        {
          type: "address",
          name: "account",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "id",
          internalType: "uint256",
        },
      ],
    },
    chain: "eth",
    returnValueTest: {
      key: "",
      comparator: ">",
      value: "0",
    },
  }
];
const solAccessControlConditionsWithMissingFields = [
  {
    method: "getBalance",
    params: [":userAddress"],
    chain: "solana",
    pdaParams: [],
    // pdaInterface: { offset: 0, fields: {} },
    // pdaKey: "",
    returnValueTest: {
      key: "",
      comparator: ">=",
      value: "100000000", // equals 0.1 SOL
    },
  }
];
const unifiedAccessControlConditions = [
  {
    conditionType: "solRpc",
    method: "getBalance",
    params: [":userAddress"],
    // chain: "solana",
    pdaParams: [],
    pdaInterface: { offset: 0, fields: {} },
    pdaKey: "",
    returnValueTest: {
      key: "",
      comparator: ">=",
      value: "100000000", // equals 0.1 SOL
    },
  },
  { operator: "or" },
  {
    conditionType: "evmBasic",
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    // method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "10000000000000",
    },
  },
  { operator: "or" },
  {
    conditionType: "evmContract",
    contractAddress: "0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88",
    // functionName: "balanceOf",
    functionParams: [":userAddress", "8"],
    functionAbi: {
      type: "function",
      stateMutability: "view",
      outputs: [
        {
          type: "uint256",
          name: "",
          internalType: "uint256",
        },
      ],
      name: "balanceOf",
      inputs: [
        {
          type: "address",
          name: "account",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "id",
          internalType: "uint256",
        },
      ],
    },
    // chain: "polygon",
    returnValueTest: {
      key: "",
      comparator: ">",
      value: "0",
    },
  },
];

await testThese([
  { name: path.basename(import.meta.url), fn: accessControlConditionsTest('evmBasicMissingFields', evmBasicAccessControlConditionsWithMissingFields) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTest('evmBasicMissingNestedFields', evmBasicNestedAccessControlConditionsWithMissingFields) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTest('evmBasicInvalidFields', evmBasicAccessControlConditionsWithInvalidFields) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTest('evmContractMissingFields', evmContractAccessControlConditionsWithMissingFields) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTest('evmContractInvalidFields', evmContractNestedAccessControlConditionsWithInvalidFields) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTest('solMissingFields', solAccessControlConditionsWithMissingFields) },
  { name: path.basename(import.meta.url), fn: accessControlConditionsTest('unifiedMissingFields', unifiedAccessControlConditions) },
]);
