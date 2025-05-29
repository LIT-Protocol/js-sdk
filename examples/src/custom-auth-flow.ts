import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { hexToBigInt, keccak256, toBytes } from 'viem';
import { init } from './init';

export const customAuthFlow = async () => {
  const { myAccount, litClient } = await init();

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
      // console.log('✅ uniqueUserAuthData:', uniqueUserAuthData);

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

      // console.log('✅ validationIpfsCid:', validationIpfsCid);
      // console.log('✅ mintedPKP:', mintedPKP);
      // console.log(
      //   '✅ hexedUniqueAuthMethodType:',
      //   this.hexedUniqueAuthMethodType
      // );

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
};

customAuthFlow();
