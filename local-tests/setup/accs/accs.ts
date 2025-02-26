import {
  AtomAcc,
  EvmBasicAcc,
  SolAcc,
} from '@lit-protocol/access-control-conditions-schemas';

export namespace AccessControlConditions {
  export const getEvmBasicAccessControlConditions = ({
    userAddress,
  }): EvmBasicAcc[] => {
    return [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: userAddress,
        },
      },
    ];
  };

  export const getSolBasicAccessControlConditions = ({
    userAddress,
  }): SolAcc[] => {
    return [
      {
        method: '',
        params: [':userAddress'],
        pdaParams: [],
        pdaInterface: { offset: 0, fields: {} },
        pdaKey: '',
        chain: 'solana',
        returnValueTest: {
          key: '',
          comparator: '=',
          value: userAddress,
        },
      },
    ];
  };

  export const getCosmosBasicAccessControlConditions = ({
    userAddress,
  }): AtomAcc[] => {
    return [
      {
        conditionType: 'cosmos',
        path: ':userAddress',
        chain: 'cosmos',
        returnValueTest: {
          key: '',
          comparator: '=',
          value: userAddress,
        },
      },
    ];
  };
}
