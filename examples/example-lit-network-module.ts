import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { privateKeyToAccount } from 'viem/accounts';

// This is a copy/paste of an example that you could immdiately use it in the project
// export const createLitService = async () => {
//   return litClient;
// }

(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

  // Step 1: Convert your EOA private key to a viem account object
  const myAccount = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`
  );

  const accountAddress = myAccount.address;
  console.log('🔥 accountAddress:', accountAddress);

  // Step 2: Import and choose the Lit network to connect to
  // const { nagaDev } = await import('@lit-protocol/networks');
  const { nagaDev } = await import('@lit-protocol/networks');

  // Step 3: Instantiate the LitClient using the selected network
  const litClient = await createLitClient({ network: nagaDev });

  // ==================== EOA Auth ====================

  // 1. Get the authenticator
  const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');

  // 2. Authenticate the account
  const authData = await ViemAccountAuthenticator.authenticate(myAccount);
  console.log('✅ authData:', authData);

  // 3a. Mint a PKP using your account. This is then owned by the account
  // ❗️ You will need to manually add permissions to the PKP before it can be used.
  // const mintedPkpWithEoa = await litClient.mintWithEoa({
  //   account: myAccount,
  // });

  // console.log('✅ mintedPkpWithEoa:', mintedPkpWithEoa);

  // const pkpPermissionsManager = await litClient.getPKPPermissionsManager({
  //   pkpIdentifier: {
  //     tokenId:
  //       '19085041157665114725857884366388574531491480918527872268705580135992933734627n',
  //   },
  //   account: myAccount,
  // });

  // const permissionsContext =
  //   await pkpPermissionsManager.getPermissionsContext();

  // console.log('✅ permissionsContext:', permissionsContext);

  const res = await litClient.viewPKPPermissions({
    tokenId:
      '88433575961444214305788192241948774655153841244103756866583908638207006919428',
  });

  console.log('✅ viewPKPPermissions:', res);

  // 3b. Minting a PKP with EOA Auth Method. This is then owned by the auth method
  // const mintedPkpWithEoaAuth = await litClient.mintWithAuth({
  //   account: myAccount,
  //   authData: authData,
  //   scopes: ['sign-anything'],
  // });

  // console.log('✅ mintedPkpWithEoaAuth:', mintedPkpWithEoaAuth);

  // 4. You can also use the auth service to mint a PKP, just like any other auths

  process.exit();

  // Step 4: Create an AuthManager to manage authentication state
  // This uses a local storage backend (useful for Node environments)
  const authManager = createAuthManager({
    // on browser, use browser storage plugin by default
    storage: storagePlugins.localStorageNode({
      appName: 'my-app', // namespace for isolating auth data
      networkName: 'naga-dev', // useful for distinguishing environments
      storagePath: './lit-auth-storage', // file path for storing session data
    }),
  });

  // Step 6: Create an EOA-based auth context from your account and config
  const eoaAuthContext = await authManager.createEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig: {
      statement: 'I authorize the Lit Protocol to mint a PKP for me.',
      domain: 'example.com',
      resources: [
        ['pkp-signing', '*'],
        ['lit-action-execution', '*'],
      ],
      capabilityAuthSigs: [],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    },
    litClient: litClient,
  });

  console.log('✅ eoaAuthContext:', eoaAuthContext);

  // Step 7: Mint a new Programmable Key Pair (PKP) via the Lit Network
  const { data: mintedPkpInfo } = await litClient.mintPkp({
    authContext: eoaAuthContext,
    scopes: ['sign-anything'], // define permission scopes for the PKP
  });

  console.log('✅ PKP Minted:', mintedPkpInfo);
  process.exit();
  // Step 8: Use the PKP to sign a message with the given pubkey and scheme
  const signature2 = await litClient.chain.ethereum.pkpSign({
    pubKey: mintedPkpInfo.pubkey,
    toSign: 'hello',
    authContext: eoaAuthContext,
  });

  console.log('✅ Signature2:', signature2);

  // (Advanced) use the raw method to sign to pick the chain and signing scheme
  // const signature = await litClient.chain.raw.pkpSign({
  //   chain: 'ethereum',
  //   signingScheme: 'EcdsaK256Sha256',
  //   pubKey: mintedPkpInfo.pubkey,
  //   toSign: 'hello',
  //   authContext: eoaAuthContext,
  //   // Optional fee cap for using the Lit network
  //   // userMaxPrice: 1000000000000000000n,
  // });

  // console.log('✅ Signature:', signature);

  // const signature2 = await litClient.chain.bitcoin.pkpSign({
  //   signingScheme: 'SchnorrK256Taproot',
  //   toSign: 'hello',
  //   pubKey: mintedPkpInfo.pubkey,
  //   authContext: eoaAuthContext,
  // });

  // console.log('✅ Signature2:', signature2);

  // Optional: Disconnect from the Lit network
  await litClient.disconnect();
})();
