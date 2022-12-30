// https://developer.litprotocol.com/docs/AccessControlConditions/cosmosConditions
export default [
  {
    conditionType: "cosmos",
    path: ":userAddress",
    chain: 'cosmos',
    returnValueTest: {
      key: "",
      comparator: "=",
      value: "cosmos1vn6zl0924yj86jrp330wcwjclzdharljq03a8h",
    },
  },
];