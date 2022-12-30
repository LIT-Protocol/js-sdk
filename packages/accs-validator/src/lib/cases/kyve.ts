// https://developer.litprotocol.com/docs/AccessControlConditions/cosmosConditions
export default [
  {
    conditionType: 'cosmos',
    path: '/kyve/registry/v1beta1/funders_list/0',
    chain: 'kyve',
    returnValueTest: {
      key: '$.funders.*.account',
      comparator: 'contains',
      value: ':userAddress',
    },
  },
];
