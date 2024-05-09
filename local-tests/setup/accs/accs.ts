import {
  LPACC_EVM_ATOM,
  LPACC_EVM_BASIC,
  LPACC_SOL,
} from '@lit-protocol/accs-schemas';

export namespace AccessControlConditions {
  export const getEmvBasicAccessControlConditions = ({
    userAddress,
  }): LPACC_EVM_BASIC[] => {
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
  }): LPACC_SOL[] => {
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
  }): LPACC_EVM_ATOM[] => {
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
