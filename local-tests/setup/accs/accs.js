export var AccessControlConditions;
(function (AccessControlConditions) {
    AccessControlConditions.getEmvBasicAccessControlConditions = ({ userAddress, }) => {
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
    AccessControlConditions.getSolBasicAccessControlConditions = ({ userAddress, }) => {
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
    AccessControlConditions.getCosmosBasicAccessControlConditions = ({ userAddress, }) => {
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
})(AccessControlConditions || (AccessControlConditions = {}));
//# sourceMappingURL=accs.js.map