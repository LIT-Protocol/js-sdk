import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder

import { ConditionItem } from '@litprotocol-dev/constants';
import {
    canonicalUnifiedAccessControlConditionFormatter,
    // TEST: canonicalSolRpcConditionFormatter
    // TEST: canonicalAccessControlConditionFormatter
    // TEST: canonicalEVMContractConditionFormatter
    // TEST: canonicalCosmosConditionFormatter
} from '@litprotocol-dev/shared-utils';

// import {
// hashUnifiedAccessControlConditions,
// TEST: hashUnifiedAccessControlConditions
// } from './access_control_conditions/hashing'


// ---------- Test Cases ----------
describe('eth.ts', () => {
    it('pass', () => {
        expect(1).toBe(1);
    });

    it('should format canonical unified access control (ETH + SOLANA Wallet Addresses with "AND" operator)', async () => {

        const EXPECTED_INPUT : Array<ConditionItem> = [
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
            }
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

        const test = canonicalUnifiedAccessControlConditionFormatter(EXPECTED_INPUT);

        expect(test).toStrictEqual(EXPECTED_OUTPUT);
    });

    it('should FAIL to format canonical unified access control if key "conditionType" doesnt exist', async () => {
        console.log = jest.fn();

        let test;

        try {
            test = canonicalUnifiedAccessControlConditionFormatter(
                [
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
                ]
            );
        } catch (e) {
            console.log(e);
        }

        expect((console.log as any).mock.calls[0][0].message).toContain(
            'You passed an invalid access control condition that is missing or has a wrong'
        );
    });

    it('should FAIL to format canonical unified access control (key: foo, value: bar)', async () => {
        console.log = jest.fn();

        const MOCK_ACCS_UNKNOWN_KEY : any = [
            {
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
        ];

        try {
            test = canonicalUnifiedAccessControlConditionFormatter(
                MOCK_ACCS_UNKNOWN_KEY
            );
        } catch (e) {
            console.log(e);
        }

        expect((console.log as any).mock.calls[0][0].errorCode).toBe(
            'invalid_access_control_condition'
        );
    });
});
