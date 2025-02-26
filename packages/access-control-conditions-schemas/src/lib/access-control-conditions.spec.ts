import {
  type AtomCondition,
  type EvmBasicCondition,
  type EvmContractCondition,
  type SolRpcCondition,
  type UnifiedAccessControlCondition,
  type MultipleAccessControlConditions,
  AtomConditionsSchema,
  EvmBasicConditionsSchema,
  EvmContractConditionsSchema,
  SolRpcConditionsSchema,
  UnifiedConditionsSchema,
  MultipleAccessControlConditionsSchema,
} from './access-control-conditions';
import { type AtomAcc } from './AtomAcc';
import { type EvmBasicAcc } from './EvmBasicAcc';
import { type EvmContractAcc } from './EvmContractAcc';
import { type OperatorAcc } from './OperatorAcc';
import { type SolAcc } from './SolAcc';

const andOperatorAcc: OperatorAcc = {
  operator: 'and',
};
const orOperatorAcc: OperatorAcc = {
  operator: 'or',
};

const validAtomCondition: AtomAcc = {
  conditionType: 'cosmos',
  path: '/cosmos/bank/v1beta1/balances/:userAddress',
  chain: 'cosmos',
  returnValueTest: {
    key: '$.balances[0].amount',
    comparator: '>=',
    value: '1000000',
  },
};
const validEvmBasicCondition: EvmBasicAcc = {
  conditionType: 'evmBasic',
  contractAddress: '0x50D8EB685a9F262B13F28958aBc9670F06F819d9',
  standardContractType: 'MolochDAOv2.1',
  chain: 'ethereum',
  method: 'members',
  parameters: [':userAddress'],
  returnValueTest: {
    comparator: '=',
    value: 'true',
  },
};
const validEvmContractCondition: EvmContractAcc = {
  conditionType: 'evmContract',
  contractAddress: '0x50D8EB685a9F262B13F28958aBc9670F06F819d9',
  chain: 'ethereum',
  functionName: 'myFunction',
  functionParams: ['param1', 'param2'],
  functionAbi: {
    name: 'myFunction',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'param1', type: 'string' },
      { name: 'param2', type: 'string' },
    ],
    outputs: [],
  },
  returnValueTest: {
    key: 'myKey',
    comparator: '=',
    value: 'true',
  },
};
const validSolRpcCondition: SolAcc = {
  conditionType: 'solRpc',
  method: 'balanceOfMetaplexCollection',
  params: ['FfyafED6kiJUFwEhogyTRQHiL6NguqNg9xcdeoyyJs33'],
  pdaParams: [],
  pdaInterface: { offset: 0, fields: {} },
  pdaKey: '',
  chain: 'solana',
  returnValueTest: {
    key: '',
    comparator: '>',
    value: '0',
  },
};

describe('Atom Access Control Conditions', () => {
  it('Should validate Atom conditions', () => {
    expect(
      AtomConditionsSchema.safeParse([validAtomCondition]).success
    ).toBeTruthy();
  });

  it('Should validate Atom boolean expressions', () => {
    const atomBooleanExpression: AtomCondition = [
      validAtomCondition,
      orOperatorAcc,
      [
        validAtomCondition,
        andOperatorAcc,
        [validAtomCondition, orOperatorAcc, validAtomCondition],
      ],
    ];

    expect(
      AtomConditionsSchema.safeParse(atomBooleanExpression).success
    ).toBeTruthy();
  });

  it('Should reject invalid Atom conditions', () => {
    expect(AtomConditionsSchema.safeParse([]).success).toBeFalsy();
    expect(AtomConditionsSchema.safeParse(null).success).toBeFalsy();
    expect(AtomConditionsSchema.safeParse(undefined).success).toBeFalsy();
    expect(
      AtomConditionsSchema.safeParse([validEvmBasicCondition]).success
    ).toBeFalsy();
  });
});

describe('Evm Basic Access Control Conditions', () => {
  it('Should validate Evm Basic conditions', () => {
    expect(
      EvmBasicConditionsSchema.safeParse([validEvmBasicCondition]).success
    ).toBeTruthy();
  });

  it('Should validate Evm Basic boolean expressions', () => {
    const evmBasicBooleanExpression: EvmBasicCondition = [
      validEvmBasicCondition,
      orOperatorAcc,
      [
        validEvmBasicCondition,
        andOperatorAcc,
        [validEvmBasicCondition, orOperatorAcc, validEvmBasicCondition],
      ],
    ];

    expect(
      EvmBasicConditionsSchema.safeParse(evmBasicBooleanExpression).success
    ).toBeTruthy();
  });

  it('Should reject invalid Evm Basic conditions', () => {
    expect(EvmBasicConditionsSchema.safeParse([]).success).toBeFalsy();
    expect(EvmBasicConditionsSchema.safeParse(null).success).toBeFalsy();
    expect(EvmBasicConditionsSchema.safeParse(undefined).success).toBeFalsy();
    expect(
      EvmBasicConditionsSchema.safeParse([validEvmContractCondition]).success
    ).toBeFalsy();
  });
});

describe('Evm Contract Access Control Conditions', () => {
  it('Should validate Evm Contract conditions', () => {
    expect(
      EvmContractConditionsSchema.safeParse([validEvmContractCondition]).success
    ).toBeTruthy();
  });

  it('Should validate Evm Contract boolean expressions', () => {
    const evmContractBooleanExpression: EvmContractCondition = [
      validEvmContractCondition,
      orOperatorAcc,
      [
        validEvmContractCondition,
        andOperatorAcc,
        [validEvmContractCondition, orOperatorAcc, validEvmContractCondition],
      ],
    ];

    expect(
      EvmContractConditionsSchema.safeParse(evmContractBooleanExpression)
        .success
    ).toBeTruthy();
  });

  it('Should reject invalid Evm Contract conditions', () => {
    expect(EvmContractConditionsSchema.safeParse([]).success).toBeFalsy();
    expect(EvmContractConditionsSchema.safeParse(null).success).toBeFalsy();
    expect(
      EvmContractConditionsSchema.safeParse(undefined).success
    ).toBeFalsy();
    expect(
      EvmContractConditionsSchema.safeParse([validEvmBasicCondition]).success
    ).toBeFalsy();
  });
});

describe('Unified Access Control Conditions', () => {
  it('Should validate the other basic conditions', () => {
    expect(
      UnifiedConditionsSchema.safeParse([validAtomCondition]).success
    ).toBeTruthy();
    expect(
      UnifiedConditionsSchema.safeParse([validEvmBasicCondition]).success
    ).toBeTruthy();
    expect(
      UnifiedConditionsSchema.safeParse([validEvmContractCondition]).success
    ).toBeTruthy();
    expect(
      UnifiedConditionsSchema.safeParse([validSolRpcCondition]).success
    ).toBeTruthy();
  });

  it('Should validate Unified boolean expressions', () => {
    const unifiedBooleanExpression: UnifiedAccessControlCondition = [
      validAtomCondition,
      orOperatorAcc,
      [
        validEvmBasicCondition,
        andOperatorAcc,
        [validEvmContractCondition, orOperatorAcc, validSolRpcCondition],
      ],
    ];

    expect(
      UnifiedConditionsSchema.safeParse(unifiedBooleanExpression).success
    ).toBeTruthy();
  });

  it('Should reject invalid Unified conditions', () => {
    expect(UnifiedConditionsSchema.safeParse([]).success).toBeFalsy();
    expect(UnifiedConditionsSchema.safeParse(null).success).toBeFalsy();
    expect(UnifiedConditionsSchema.safeParse(undefined).success).toBeFalsy();
  });
});

describe('Solana Access Control Conditions', () => {
  it('Should validate Solana RPC conditions', () => {
    expect(
      SolRpcConditionsSchema.safeParse([validSolRpcCondition]).success
    ).toBeTruthy();
  });

  it('Should validate Solana RPC boolean expressions', () => {
    const solBooleanExpression: SolRpcCondition = [
      validSolRpcCondition,
      orOperatorAcc,
      [
        validSolRpcCondition,
        andOperatorAcc,
        [validSolRpcCondition, orOperatorAcc, validSolRpcCondition],
      ],
    ];

    expect(
      SolRpcConditionsSchema.safeParse(solBooleanExpression).success
    ).toBeTruthy();
  });

  it('Should reject invalid Solana RPC conditions', () => {
    expect(SolRpcConditionsSchema.safeParse([]).success).toBeFalsy();
    expect(SolRpcConditionsSchema.safeParse(null).success).toBeFalsy();
    expect(SolRpcConditionsSchema.safeParse(undefined).success).toBeFalsy();
    expect(
      SolRpcConditionsSchema.safeParse([validEvmBasicCondition]).success
    ).toBeFalsy();
  });
});

describe('Multiple Access Control Conditions', () => {
  it('Should validate Multiple Access Control Conditions', () => {
    const multipleAccessControlConditions: MultipleAccessControlConditions = {
      accessControlConditions: [validEvmBasicCondition],
      evmContractConditions: [validEvmContractCondition],
      solRpcConditions: [validSolRpcCondition],
      unifiedAccessControlConditions: [
        validAtomCondition,
        andOperatorAcc,
        validEvmContractCondition,
      ],
    };
    expect(
      MultipleAccessControlConditionsSchema.safeParse(
        multipleAccessControlConditions
      ).success
    ).toBeTruthy();
  });
});
