import * as humanizer from './humanizer';
import { humanizeAccessControlConditions } from './humanizer';
import {
  AccsCOSMOSParams,
  AccsEVMParams,
  AccsSOLV2Params,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

// ---------- Test Cases ----------
describe('humanizer.ts', () => {
  it('should format sol', () => {
    const INPUT = 1;
    const OUTPUT = humanizer.formatSol(INPUT);

    expect(OUTPUT).toBe('0.000000001');
  });
  it('should format sol', () => {
    const INPUT = 100;
    const OUTPUT = humanizer.formatSol(INPUT);

    expect(OUTPUT).toBe('0.0000001');
  });
  it('should format atom', () => {
    const INPUT = 1000000000;
    const OUTPUT = humanizer.formatAtom(INPUT);

    expect(OUTPUT).toBe('1000.0');
  });

  it('should humanize operator >', () => {
    const INPUT = '>';
    const OUTPUT = humanizer.humanizeComparator(INPUT);

    expect(OUTPUT).toBe('more than');
  });

  it('should humanize operator >=', () => {
    const INPUT = '>=';
    const OUTPUT = humanizer.humanizeComparator(INPUT);

    expect(OUTPUT).toBe('at least');
  });
  it('should humanize operator =', () => {
    const INPUT = '=';
    const OUTPUT = humanizer.humanizeComparator(INPUT);

    expect(OUTPUT).toBe('exactly');
  });
  it('should humanize operator <', () => {
    const INPUT = '<';
    const OUTPUT = humanizer.humanizeComparator(INPUT);

    expect(OUTPUT).toBe('less than');
  });
  it('should humanize operator <=', () => {
    const INPUT = '<=';
    const OUTPUT = humanizer.humanizeComparator(INPUT);

    expect(OUTPUT).toBe('at most');
  });
  it('should humanizeEvmBasicAccessControlConditions', async () => {
    const INPUT: Array<AccsEVMParams> = [
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

    const OUTPUT = await humanizer.humanizeEvmContractConditions({
      evmContractConditions: INPUT,
    });

    expect(OUTPUT).toBe(
      'balanceOf(:userAddress, 8) on contract address 0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88 should have a result of more than 0'
    );
  });

  it('should humanizeSolRpcConditions', async () => {
    const INPUT: Array<AccsSOLV2Params> = [
      {
        method: 'getTokenAccountBalance',
        params: ['tn2WEWk4Kqj157XsSdmBBcjWumVhkyJECXCKPq9ReL9'],
        pdaParams: [],
        pdaInterface: { offset: 0, fields: {} },
        pdaKey: '',
        chain: 'solana',
        returnValueTest: {
          key: '$.amount',
          comparator: '>',
          value: '0',
        },
      },
    ];

    const OUTPUT = await humanizer.humanizeSolRpcConditions({
      solRpcConditions: INPUT,
    });

    expect(OUTPUT).toBe(
      'Solana RPC method getTokenAccountBalance(tn2WEWk4Kqj157XsSdmBBcjWumVhkyJECXCKPq9ReL9) should have a result of more than 0 for key $.amount'
    );
  });

  it('should humanizeCosmosConditions', async () => {
    const INPUT: Array<AccsCOSMOSParams> = [
      {
        conditionType: 'cosmos',
        path: '/cosmos/bank/v1beta1/balances/:userAddress',
        chain: 'cosmos',
        returnValueTest: {
          key: '$.balances[0].amount',
          comparator: '>=',
          value: '1000000', // equals 1 ATOM
        },
      },
    ];

    const OUTPUT = await humanizer.humanizeCosmosConditions({
      cosmosConditions: INPUT,
    });
    expect(OUTPUT).toBe('Owns at least 1.0 ATOM');
  });

  it('should humanizeUnifiedAccessControlConditions', async () => {
    const INPUT: UnifiedAccessControlConditions = [
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

    const OUTPUT = await humanizer.humanizeUnifiedAccessControlConditions({
      unifiedAccessControlConditions: INPUT,
    });

    expect(OUTPUT).toBe(
      'Owns at least 0.00001 ETH or balanceOf(:userAddress, 8) on contract address 0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88 should have a result of more than 0'
    );
  });

  it('should humanizeAccessControlConditions', async () => {
    const INPUT: UnifiedAccessControlConditions = [
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

    const OUTPUT = await humanizer.humanizeAccessControlConditions({
      unifiedAccessControlConditions: INPUT,
    });

    expect(OUTPUT).toBe(
      'Owns at least 0.00001 ETH or balanceOf(:userAddress, 8) on contract address 0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88 should have a result of more than 0'
    );
  });

  it('should humanize acc', async () => {
    const result = await humanizeAccessControlConditions({
      unifiedAccessControlConditions: [
        {
          chain: 'goerli',
          method: 'balanceOf',
          parameters: [':userAddress'],
          conditionType: 'evmBasic',
          contractAddress: '0x5b8B8C9aD976aFCAd24fd6CF424294d372c190Ac',
          returnValueTest: {
            value: '100000000000000000000',
            comparator: '>='
          },
          standardContractType: 'ERC20'
        }
      ]
    });
    expect(result).toContain("0x5b8B8C9aD976aFCAd24fd6CF424294d372c190Ac");
    expect(result).toContain("100.0");
    expect(result).toContain("at least");
  });
});