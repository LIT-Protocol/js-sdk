import { InvalidAccessControlConditions } from '@lit-protocol/constants';
import { ConditionItem } from '@lit-protocol/types';

import {
  canonicalUnifiedAccessControlConditionFormatter,
  canonicalSolRpcConditionFormatter,
  canonicalAccessControlConditionFormatter,
  canonicalEVMContractConditionFormatter,
  canonicalCosmosConditionFormatter,
  canonicalResourceIdFormatter,
} from './canonicalFormatter';

// ---------- Test Cases ----------
describe('canonicalFormatter.ts', () => {
  it('should format canonical unified access control (ETH + SOLANA Wallet Addresses with "AND" operator)', async () => {
    const EXPECTED_INPUT: ConditionItem[] = [
      {
        conditionType: 'evmBasic',
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A2',
        },
      },
      {
        operator: 'and',
      },
      {
        conditionType: 'solRpc',
        method: '',
        params: [':userAddress'],
        chain: 'solana',
        pdaParams: [],
        pdaInterface: {
          offset: 0,
          fields: {},
        },
        pdaKey: '',
        returnValueTest: {
          key: '',
          comparator: '=',
          value: 'F7r6ENi6dqH8SnMYZdK3YxWAQ4cwfSNXZyMzbea5fbS1',
        },
      },
    ];

    const EXPECTED_OUTPUT = [
      {
        chain: 'ethereum',
        contractAddress: '',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A2',
        },
        standardContractType: '',
      },
      { operator: 'and' },
      {
        chain: 'solana',
        method: '',
        params: [':userAddress'],
        pdaInterface: { fields: {}, offset: 0 },
        pdaKey: '',
        pdaParams: [],
        returnValueTest: {
          comparator: '=',
          key: '',
          value: 'F7r6ENi6dqH8SnMYZdK3YxWAQ4cwfSNXZyMzbea5fbS1',
        },
      },
    ];

    expect(
      canonicalUnifiedAccessControlConditionFormatter(EXPECTED_INPUT)
    ).toStrictEqual(EXPECTED_OUTPUT);
  });

  it('should FAIL to format canonical unified access control if key "conditionType" doesnt exist', async () => {
    expect(() =>
      canonicalUnifiedAccessControlConditionFormatter([
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: '',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: '=',
            value: '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A2',
          },
        },
      ])
    ).toThrow(
      'You passed an invalid access control condition that is missing or has a wrong'
    );
  });

  it('should FAIL to format canonical unified access control (key: foo, value: bar)', async () => {
    expect(() =>
      canonicalUnifiedAccessControlConditionFormatter([
        {
          // @ts-expect-error we are testing
          foo: 'bar',
        },
        {
          conditionType: 'evmBasic',
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: '',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: '=',
            value: '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A2',
          },
        },
      ])
    ).toThrow(InvalidAccessControlConditions);
  });

  it('should throw error when format canonical sol rpc condition', async () => {
    expect(() =>
      canonicalSolRpcConditionFormatter([
        {
          // @ts-expect-error we are testing
          foo: 'bar',
        },
        {
          conditionType: 'evmBasic',
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: '',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: '=',
            value: '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A2',
          },
        },
      ])
    ).toThrow(InvalidAccessControlConditions);
  });

  it('should call "canonicalAccessControlConditionFormatter" in node.js', () => {
    const params = [] as never[];

    const OUTPUT = canonicalAccessControlConditionFormatter(params);

    expect(OUTPUT.length).toBe(0);
  });

  it('should call canonicalEVMContractConditionFormatter in node.js', () => {
    const params = [] as never[];

    const OUTPUT = canonicalEVMContractConditionFormatter(params);

    expect(OUTPUT.length).toBe(0);
  });

  it('should call canonicalCosmosConditionFormatter in node.js', () => {
    const params = [] as never[];

    const OUTPUT = canonicalCosmosConditionFormatter(params);

    expect(OUTPUT.length).toBe(0);
  });

  it('should call canonicalResourceIdFormatter in node.js', () => {
    // @ts-expect-error we are testing
    const OUTPUT = canonicalResourceIdFormatter({});

    expect(OUTPUT.baseUrl).toBe(undefined);
  });
});
