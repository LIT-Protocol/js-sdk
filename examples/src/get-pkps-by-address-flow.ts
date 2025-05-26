export const getPKPsByAddressFlow = async () => {
  const { init } = await import('./init');
  const { myAccount, litClient } = await init();
  console.log('myAccount.address:', myAccount.address);
  const pkps = await litClient.viewPKPsByAddress({
    ownerAddress: "0x5D467fe98ff120fe0C85F2217bC61732571b28EC",
    pagination: {
      limit: 21,
      offset: 0,
    },
  });
  console.log('pkps:', pkps);
};

getPKPsByAddressFlow();
