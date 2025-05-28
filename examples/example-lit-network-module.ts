import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { hexToBigInt, keccak256, toBytes } from 'viem';
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

  // process.exit();

  // ==================== EOA Auth ====================

  // 1. Get the authenticator
  const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');

  const authData = await ViemAccountAuthenticator.authenticate(myAccount);
  console.log('✅ authData:', authData);

  const authSig = JSON.parse(authData.accessToken);

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

  // const res = await litClient.viewPKPPermissions({
  //   tokenId:
  //     '88433575961444214305788192241948774655153841244103756866583908638207006919428',
  // });

  // console.log('✅ viewPKPPermissions:', res);

  // mintPkpAsDappOwner();

  // ==== Ends.
  // 👇 Minting a PKP with EOA Auth Method. This is then owned by the auth method
  // This will add two auth methods to the PKP:
  // 1. The auth data you just provided
  // 2. The PKP itself as an ETH auth method - where authMethodType is native 1, and authMethodId is the PKP ETH address
  const mintedPkpWithEoaAuth = await litClient.mintWithAuth({
    account: myAccount,
    authData: authData,
    scopes: ['sign-anything'],
  });

  console.log('✅ mintedPkpWithEoaAuth:', mintedPkpWithEoaAuth);
  // process.exit();
  const authDataOwnedPKPAddress = mintedPkpWithEoaAuth.data.ethAddress;

  // 109734918876740043449243837973253228498051142089612774504367627695589417285312n
  // const authDataOwnedPKPTokenId =
  //   109734918876740043449243837973253228498051142089612774504367627695589417285312n;
  const authDataOwnedTokenId = mintedPkpWithEoaAuth.data.tokenId;

  // 0xEd3D66c87153ABaEB39Bf56d4F54F138fe317947
  // const authDataOwnedPKPAddress = '0xEd3D66c87153ABaEB39Bf56d4F54F138fe317947';
  const authDataOwnedAddress = mintedPkpWithEoaAuth.data.ethAddress;

  // const authDataOwnedPKPPublicKey =
  //   '0x0423f5c59e528ec8d8b5820c2965a8723f4e54e1c83c48913550325c1538dfe06949b40850c007b3dabede1af87143ec5f38fec6d0f3a4cfb1c3bb3aa39219bf31';
  const authDataOwnedPKPPublicKey = mintedPkpWithEoaAuth.data.pubkey;

  // Let's check the permissions of the PKP
  const pkpPermissionsManager = await litClient.getPKPPermissionsManager({
    pkpIdentifier: {
      tokenId: authDataOwnedTokenId,
    },
    account: myAccount,
  });

  const permissionContext = await pkpPermissionsManager.getPermissionsContext();

  console.log('✅ permissionContext:', permissionContext);

  // The PKP address should have a scope of sign-anything, let's check that
  const pkpEthAddressPermission =
    await pkpPermissionsManager.getPermittedAuthMethodScopes({
      authMethodType: 1,
      authMethodId: authDataOwnedPKPAddress.toLowerCase(),
    });

  console.log('✅ pkpEthAddressPermission:', pkpEthAddressPermission);

  // if (pkpEthAddressPermission[1] === false) {
  //   console.log('❌ scope is not found! adding sign-anything');
  //   const addingScopeRes =
  //     await pkpPermissionsManager.addPermittedAuthMethodScope({
  //       authMethodType: 1,
  //       authMethodId: authDataOwnedPKPAddress,
  //       scopeId: 1,
  //     });
  //   console.log('✅ addedScopeRes');

  //   // check the permissions again
  //   const pkpEthAddressPermission2 =
  //     await pkpPermissionsManager.getPermittedAuthMethodScopes({
  //       authMethodType: 1,
  //       authMethodId: authDataOwnedPKPAddress,
  //     });

  //   console.log('✅ pkpEthAddressPermission2:', pkpEthAddressPermission2);

  //   // now transfer it to the PKP itself
  //   const transferRes = await pkpPermissionsManager.transferPKP(
  //     authDataOwnedPKPAddress
  //   );

  //   console.log("✅ Transferred PKP to itself");

  //   // console.log('✅ transferRes:', transferRes);
  // }

  // // Check the permissions context again
  // const permissionContext2 = await pkpPermissionsManager.getPermissionsContext();

  // console.log('✅ permissionContext2:', permissionContext2);

  // process.exit();

  const _authManager = createAuthManager({
    // on browser, use browser storage plugin by default
    storage: storagePlugins.localStorageNode({
      appName: 'my-app', // namespace for isolating auth data
      networkName: 'naga-dev', // useful for distinguishing environments
      storagePath: './lit-auth-storage', // file path for storing session data
    }),
  });

  const customAuthContext = await _authManager.createCustomAuthContext({
    authConfig: {
      statement: 'I authorize the Lit Protocol to mint a PKP for me.',
      domain: 'example.com',
      resources: [
        ['pkp-signing', '*'],
        ['lit-action-execution', '*'],
      ],
      capabilityAuthSigs: [authSig],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    },
    litClient: litClient,
    customAuthParams: {
      litActionIpfsId: `QmWL2r7CPi5dDKZetRrj6eVfzwv5Y472QJew9c5B9iRU6j`,
      jsParams: {},
    },
    pkpPublicKey: authDataOwnedPKPPublicKey,
  });

  console.log('✅ customAuthContext:', customAuthContext);

  // process.exit();

  // now get the authContext
  // const _authContext = await authManager2.createPkpAuthContext({
  //   authData: authData2,
  //   pkpPublicKey: mintedPkpWithEoaAuth.data.pubkey,
  //   authConfig: {
  //     statement: 'I authorize the Lit Protocol to mint a PKP for me.',
  //     domain: 'example.com',
  //     resources: [
  //       ['pkp-signing', '*'],
  //       ['lit-action-execution', '*'],
  //     ],
  //     capabilityAuthSigs: [],
  //     expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
  //   },
  //   litClient: litClient,
  // });

  // console.log('✅ _authContext:', _authContext);

  const signres = await litClient.chain.ethereum.pkpSign({
    pubKey: mintedPkpWithEoaAuth.data.pubkey,
    toSign: 'hello',
    authContext: customAuthContext,
  });

  console.log('✅ signres:', signres);

  // ==================== PKP Viem Account Integration ====================
  
  console.log('🔗 Creating PKP Viem Account...');
  
  // Create a viem-compatible account using the PKP
  const pkpViemAccount = await litClient.getPkpViemAccount({
    authContext: customAuthContext,
    pkpPublicKey: mintedPkpWithEoaAuth.data.pubkey,
    chain: 'ethereum',
  });

  console.log('✅ PKP Viem Account created:', {
    address: pkpViemAccount.address,
    type: pkpViemAccount.type,
    source: pkpViemAccount.source,
  });

  // Demonstrate message signing with PKP Viem Account
  console.log('✍️ Signing message with PKP Viem Account...');
  
  const messageSignature = await pkpViemAccount.signMessage({
    message: 'Hello from PKP Viem Account!',
  });

  console.log('✅ Message signed with PKP Viem Account:', messageSignature);

  console.log('💡 You can now use this pkpViemAccount with any viem wallet client');
  console.log('💡 Example: createWalletClient({ account: pkpViemAccount, chain: sepolia, transport: http() })');

  process.exit();
})();
