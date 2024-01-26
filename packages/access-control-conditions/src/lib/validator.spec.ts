import { LIT_ERROR } from '@lit-protocol/constants';
import {
  AccessControlConditions,
  EvmContractConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions,
  NodeClientErrorV1,
} from '@lit-protocol/types';

import {
  validateAccessControlConditionsSchema,
  validateEVMContractConditionsSchema,
  validateSolRpcConditionsSchema,
  validateUnifiedAccessControlConditionsSchema,
} from './validator';

describe('validator.ts', () => {
  it('should validate schema of an EVM Basic ACC', () => {
    const evmBasicAccessControlConditions: AccessControlConditions = [
      {
        contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
        standardContractType: 'ERC1155',
        chain: 'ethereum',
        method: 'balanceOf',
        parameters: [':userAddress', '8'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ];

    expect(
      validateAccessControlConditionsSchema(evmBasicAccessControlConditions)
    ).toBeTruthy();
  });

  it('should validate schema of a boolean expression ACCs', () => {
    const evmBasicAccessControlConditions: AccessControlConditions = [
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

    expect(
      validateAccessControlConditionsSchema(evmBasicAccessControlConditions)
    ).toBeTruthy();
  });

  it('should validate schema of a nested boolean expression of ACCs', () => {
    const evmBasicAccessControlConditions: AccessControlConditions = [
      {
        contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
        standardContractType: 'ERC1155',
        chain: 'ethereum',
        method: 'balanceOf',
        parameters: [':userAddress', '8'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
      {
        operator: 'or',
      },
      [
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
      ],
    ];

    expect(
      validateAccessControlConditionsSchema(evmBasicAccessControlConditions)
    ).toBeTruthy();
  });

  it('should validate schema of an EVM Contract ACC', () => {
    const evmContractAccessControlConditions: EvmContractConditions = [
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
        chain: 'ethereum',
        returnValueTest: {
          key: '',
          comparator: '>',
          value: '0',
        },
      },
    ];

    expect(
      validateEVMContractConditionsSchema(evmContractAccessControlConditions)
    ).toBeTruthy();
  });

  it('should validate schema of a Solana ACC', () => {
    const solAccessControlConditions: SolRpcConditions = [
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

    expect(
      validateSolRpcConditionsSchema(solAccessControlConditions)
    ).toBeTruthy();
  });

  it('should validate schema of a Cosmos ACC', () => {
    const cosmosAccessControlConditions: UnifiedAccessControlConditions = [
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

    expect(
      validateUnifiedAccessControlConditionsSchema(
        cosmosAccessControlConditions
      )
    ).toBeTruthy();
  });

  it('should validate schema of a set of unified ACCs', () => {
    const unifiedAccessControlConditions: UnifiedAccessControlConditions = [
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

    expect(
      validateUnifiedAccessControlConditionsSchema(
        unifiedAccessControlConditions
      )
    ).toBeTruthy();
  });

  it('should throw when schema does not have all required fields', () => {
    const evmBasicAccessControlConditions: AccessControlConditions = [
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
    ] as AccessControlConditions; // Explicit cast to override Typescript type checking

    let error: NodeClientErrorV1 | undefined;
    try {
      validateAccessControlConditionsSchema(evmBasicAccessControlConditions);
    } catch (e) {
      error = e as NodeClientErrorV1;
    }

    expect(error).toBeDefined();
    expect(error!.errorKind).toBe(LIT_ERROR.INVALID_PARAM_TYPE.kind);
    expect(error!.errorCode).toBe(LIT_ERROR.INVALID_PARAM_TYPE.name);
  });

  it('should throw when schema has invalid fields', () => {
    // Disable TS here to test invalid fields
    const evmBasicAccessControlConditions: AccessControlConditions = [
      {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        contractAddress: 0x7a250d5630b4cf539739df2c5dacb4c659f2488d,
        // @ts-ignore
        standardContractType: 'AMM',
        // @ts-ignore
        chain: 'bitcoin',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',
        },
      },
    ];

    let error: NodeClientErrorV1 | undefined;
    try {
      validateAccessControlConditionsSchema(evmBasicAccessControlConditions);
    } catch (e) {
      error = e as NodeClientErrorV1;
    }

    expect(error).toBeDefined();
    expect(error!.errorKind).toBe(LIT_ERROR.INVALID_PARAM_TYPE.kind);
    expect(error!.errorCode).toBe(LIT_ERROR.INVALID_PARAM_TYPE.name);
  });

  it('should throw when schema of a nested ACC does not validate', () => {
    const evmBasicAccessControlConditions: AccessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
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
          chain: 'ethereum',
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
    ] as AccessControlConditions; // Explicit cast to override Typescript type checking

    let error: NodeClientErrorV1 | undefined;
    try {
      validateAccessControlConditionsSchema(evmBasicAccessControlConditions);
    } catch (e) {
      error = e as NodeClientErrorV1;
    }

    expect(error).toBeDefined();
    expect(error!.errorKind).toBe(LIT_ERROR.INVALID_PARAM_TYPE.kind);
    expect(error!.errorCode).toBe(LIT_ERROR.INVALID_PARAM_TYPE.name);
  });
});
