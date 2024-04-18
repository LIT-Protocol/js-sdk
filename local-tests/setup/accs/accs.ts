import { LPACC_EVM_BASIC } from '@lit-protocol/accs-schemas';

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
}
