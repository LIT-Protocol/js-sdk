import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createAuthConfigBuilder } from '@lit-protocol/auth-helpers';
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
  // createClient
  const myAccount = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`
  );

  // Step 2: Import and choose the Lit network to connect to
  // const { nagaDev } = await import('@lit-protocol/networks');
  const { nagaDev } = await import('@lit-protocol/networks');

  // Step 3: Instantiate the LitClient using the selected network
  const litClient = await createLitClient({ network: nagaDev });

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

  // Step 5: Build a reusable auth configuration (authConfig)
  const authConfig = createAuthConfigBuilder()
    // .addExpiration(new Date(Date.now() + 1000 * 60 * 15).toISOString()) // valid for 15 mins
    // .addStatement('🔥THIS IS A TEST STATEMENT🔥') // custom user-facing message
    // .addCapabilityAuthSigs([]) // empty for now; add session capabilities later
    .addDomain('localhost:3000') // where the request originates
    .addPKPSigningRequest('*') // wildcard scope for PKP signing
    .addLitActionExecutionRequest('*') // wildcard scope for Lit Actions
    .build();

  // Step 6: Create an EOA-based auth context from your account and config
  const eoaAuthContext = await authManager.createEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig,
    litClient: litClient,
  });

  // Step 7: Mint a new Programmable Key Pair (PKP) via the Lit Network
  const { data: mintedPkpInfo } = await litClient.mintPkp({
    authContext: eoaAuthContext,
    scopes: ['sign-anything'], // define permission scopes for the PKP
  });

  console.log('✅ PKP Minted:', mintedPkpInfo);

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
