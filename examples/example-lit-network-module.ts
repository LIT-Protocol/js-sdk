import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { hexToBigInt, keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// This is a copy/paste of an example that you could immdiately use it in the project
// export const createLitService = async () => {
//   return litClient;
// }

// authData: {
//   authMethodType: 88911,
//   authMethodId: "0xafaad0959448d8adf2c0b59b60ac15c677d68f982ac8eb8468b9ae2a73d2ebbe",
// }
const authData = {
  authMethodType: 88911,
  authMethodId: keccak256(toBytes('lit')),
};

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

  const authDataViemAcconut = await ViemAccountAuthenticator.authenticate(
    myAccount
  );

  const authSig = JSON.parse(authDataViemAcconut.accessToken);

  // 2. Authenticate the account
  // const authData = await ViemAccountAuthenticator.authenticate(myAccount);
  // console.log('✅ authData:', authData);

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

  // ========== Providing PKP for your user ==========

  // Imagine you are an existing site owner, and you want to provide PKPs for your users.
  class myDappBackend {
    // Create a unique secret name of your dApp (you can share it if you want to share the authMethodType)
    uniqueDappName: string = 'my-supa-dupa-app-name';

    // [❗️REQUIRED] a very big unique number for your unique dApp name
    // This will be used to generate a unique authData for each user
    // and be used to validate inside the Lit Action / immutable javascript.
    uniqueAuthMethodType: bigint = hexToBigInt(
      keccak256(toBytes(this.uniqueDappName))
    );

    // [❗️REQUIRED] You will need to know the hexed version of the unique authMethodType
    // to be compared against with on Lit Action
    // ❗️❗️You will probably only need to know this value once and hardcode it
    // on the Lit Action validation code.
    // eg. permittedAuthMethod["auth_method_type"] === "0x15f85"
    hexedUniqueAuthMethodType = keccak256(toBytes(this.uniqueDappName));

    // [❗️REQUIRED] Validation IPFS CID
    // https://explorer.litprotocol.com/ipfs/QmYLeVmwJPVs7Uebk85YdVPivMyrvoeKR6X37kyVRZUXW4
    public static validationIpfsCid =
      'QmYLeVmwJPVs7Uebk85YdVPivMyrvoeKR6X37kyVRZUXW4';

    // [DEMO] Not a very safe database of registered users
    public registeredUsers: Array<{
      userId: string;
      password: string;
      pkpPublicKey: string | null;
    }> = [
      { userId: 'alice', password: 'password-1', pkpPublicKey: null },
      { userId: 'bob', password: 'password-2', pkpPublicKey: null },
    ];

    printSiteInfo() {
      console.log(
        `✍️ Unique Auth Method Type: ${this.hexedUniqueAuthMethodType}`
      );
      console.log('🔐 validationIpfsCid:', myDappBackend.validationIpfsCid);
    }

    // [❗️REQUIRED] Generate a unique auth data for each user
    // Customise this to your needs.
    private _generateAuthData(userId: string) {
      const uniqueUserId = `${this.uniqueDappName}-${userId}`;

      return {
        authMethodType: this.uniqueAuthMethodType,
        authMethodId: keccak256(toBytes(uniqueUserId)),
      };
    }

    async mintPKPForUser(userId: string) {
      // 1. Check if the user is registered
      if (!this.registeredUsers.find((user) => user.userId === userId)) {
        throw new Error('User not registered');
      }

      // 2. Generate the auth data from the unique user id
      const uniqueUserAuthData = this._generateAuthData(userId);
      console.log('✅ uniqueUserAuthData:', uniqueUserAuthData);

      // 3. Mint a PKP for the user. Then, we will send the PKP to itself, since itself is also
      // a valid ETH Wallet. The owner of the PKP will have NO permissions. To access the PKP,
      // the user will need to pass the immutable validation code which lives inside the Lit Action.
      const { pkpData: mintedPKP, validationIpfsCid } =
        await litClient.mintWithCustomAuth({
          account: myAccount,
          authData: uniqueUserAuthData,
          scope: 'sign-anything',
          validationIpfsCid: myDappBackend.validationIpfsCid,
        });

      console.log('✅ validationIpfsCid:', validationIpfsCid);
      console.log('✅ mintedPKP:', mintedPKP);
      console.log(
        '✅ hexedUniqueAuthMethodType:',
        this.hexedUniqueAuthMethodType
      );

      // find the user first
      const user = this.registeredUsers.find((user) => user.userId === userId);
      if (!user) {
        throw new Error('User not found');
      }

      // update the user with the PKP public key
      user.pkpPublicKey = mintedPKP.data.pubkey;
    }
  }

  class myDappFrontend {
    constructor(private readonly myDappBackend: myDappBackend) {
      this.myDappBackend = myDappBackend;
    }

    userDashboard(userId: string) {
      const user = this.myDappBackend.registeredUsers.find(
        (user) => user.userId === userId
      );
      const uniqueAuthMethodId = `${this.myDappBackend.uniqueDappName}-${userId}`;

      if (!user) {
        throw new Error('User not found');
      }

      return {
        getMyPkpPublicKey() {
          return user.pkpPublicKey;
        },

        getAuthMethodId() {
          return keccak256(toBytes(uniqueAuthMethodId));
        },

        // Ideally, as the site owner you will publish this to the public
        // so they can see the validation logic.
        getValidationIpfsCid() {
          return myDappBackend.validationIpfsCid;
        },
      };
    }
  }

  // ========== As the site owner ==========
  const ownerDapp = new myDappBackend();
  ownerDapp.printSiteInfo();
  await ownerDapp.mintPKPForUser('alice');

  // ========== As a user ==========
  const frontend = new myDappFrontend(ownerDapp);
  // Then as a user, first i will want to get the PKP public key if i don't have it already.
  // then i will also need to know the validation IPFS CID.
  const userDashboard = frontend.userDashboard('alice');
  const userPkpPublicKey = userDashboard.getMyPkpPublicKey();
  const dAppValidationIpfsCid = userDashboard.getValidationIpfsCid();
  const authMethodId = userDashboard.getAuthMethodId();

  console.log('✅ userPkpPublicKey:', userPkpPublicKey);

  // Then, in order to sign with the PKP the site owner minted for you, you will need to get the authContext from the authManager
  const userAuthManager = createAuthManager({
    // on browser, use browser storage plugin by default
    storage: storagePlugins.localStorageNode({
      appName: 'my-app', // namespace for isolating auth data
      networkName: 'naga-dev', // useful for distinguishing environments
      storagePath: './lit-auth-storage', // file path for storing session data
    }),
  });
  const userAuthContext = await userAuthManager.createCustomAuthContext({
    pkpPublicKey: userPkpPublicKey!,
    authConfig: {
      resources: [
        ['pkp-signing', '*'],
        ['lit-action-execution', '*'],
      ],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    },
    litClient: litClient,
    customAuthParams: {
      litActionIpfsId: dAppValidationIpfsCid,
      jsParams: {
        pkpPublicKey: userPkpPublicKey,
        username: 'alice',
        password: 'lit',
        authMethodId: authMethodId,
      },
    },
  });

  console.log('✅ userAuthContext:', userAuthContext);

  // Finally, the user can sign with the PKP
  const userSignRes = await litClient.chain.ethereum.pkpSign({
    pubKey: userPkpPublicKey!,
    toSign: 'hello',
    authContext: userAuthContext,
  });

  console.log('✅ userSignRes:', userSignRes);

  // mintPkpAsDappOwner();
  process.exit();
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
