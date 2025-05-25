export const eoaNativeAuthFlow = async () => {
  const { init } = await import('./init');

  const { myAccount, litClient, authManager } = await init();

  // 1. Get the authenticator
  const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');

  const authDataViemAcconut = await ViemAccountAuthenticator.authenticate(
    myAccount
  );

  const authSig = JSON.parse(authDataViemAcconut.accessToken);

  console.log('✅ authSig:', authSig);

  // 2. Authenticate the account
  const authData = await ViemAccountAuthenticator.authenticate(myAccount);
  console.log('✅ authData:', authData);

  // 3a. Mint a PKP using your account. This is then owned by the account
  // ❗️ You will need to manually add permissions to the PKP before it can be used.
  const mintedPkpWithEoa = await litClient.mintWithEoa({
    account: myAccount,
  });

  console.log('✅ mintedPkpWithEoa:', mintedPkpWithEoa);
};
