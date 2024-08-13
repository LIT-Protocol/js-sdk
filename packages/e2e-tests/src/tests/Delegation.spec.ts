/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { expect, jest } from '@jest/globals';

import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import {
  TinnyEnvironment,
  getEoaSessionSigsWithCapacityDelegations,
} from '@lit-protocol/tinny';

describe('Delegation', () => {
  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    //@ts-expect-error is defined
    devEnv = global.devEnv;
  });

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  it('PKP to PKP delegation executeJS', async () => {
    const alice = await devEnv.createRandomPerson();
    const bob = await devEnv.createRandomPerson();

    // Checking the scopes of the PKP owned by Bob
    const bobsAuthMethodAuthId = await LitAuthClient.getAuthIdByAuthMethod(
      bob.authMethod
    );

    const scopes =
      await bob.contractsClient?.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        bob.authMethodOwnedPkp?.tokenId!,
        AuthMethodType.EthWallet,
        bobsAuthMethodAuthId,
        3
      );

    if (!scopes![AuthMethodScope.SignAnything]) {
      throw new Error('Bob does not have the "SignAnything" scope on his PKP');
    }

    // As a dApp owner, create a capacity delegation authSig for Bob's PKP wallet
    const capacityDelegationAuthSig =
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      await alice.createCapacityDelegationAuthSig([bob.pkp?.ethAddress!]);

    // As a dApp owner, delegate the capacity credits NFT to Bob
    const bobPkpSessionSigs = await devEnv.litNodeClient?.getPkpSessionSigs({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      pkpPublicKey: bob.authMethodOwnedPkp?.publicKey!,
      authMethods: [bob.authMethod!],
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
      capabilityAuthSigs: [capacityDelegationAuthSig],
    });

    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: bobPkpSessionSigs,
      code: `(async () => {
                const sigShare = await LitActions.signEcdsa({
                toSign: dataToSign,
                publicKey,
                sigName: "sig",
                });
            })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: bob.authMethodOwnedPkp?.publicKey,
      },
    });

    devEnv.releasePrivateKeyFromUser(alice);
    devEnv.releasePrivateKeyFromUser(bob);

    // -- Expected output:
    // {
    //   claims: {},
    //   signatures: {
    //     sig: {
    //       r: "00fdf6f2fc3f13410393939bb678c8ec26c0eb46bfc39dbecdcf58540b7f9237",
    //       s: "480b578c78137150db2420669c47b220001b42a0bb4e92194ce7b76f6fd78ddc",
    //       recid: 0,
    //       signature: "0x00fdf6f2fc3f13410393939bb678c8ec26c0eb46bfc39dbecdcf58540b7f9237480b578c78137150db2420669c47b220001b42a0bb4e92194ce7b76f6fd78ddc1b",
    //       publicKey: "0465BFEE5CCFF60C0AF1D9B9481B680C2E34894A88F68F44CC094BA27501FD062A3C4AC61FA850BFA22D81D41AF72CBF983909501440FE51187F5FB3D1BC55C44E",
    //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //     },
    //   },
    //   decryptions: [],
    //   response: undefined,
    //   logs: "",
    // }

    // -- assertions
    expect(res?.signatures?.sig.r).toBeDefined();
    expect(res?.signatures?.sig.s).toBeDefined();
    expect(res?.signatures?.sig.dataSigned).toBeDefined();
    expect(res?.signatures?.sig.publicKey).toBeDefined();

    // -- signatures.sig.signature must start with 0x
    expect(res?.signatures.sig.signature.startsWith('0x')).toBeDefined();
  });

  it('PKP to EOA ExecuteJs', async () => {
    const alice = await devEnv.createRandomPerson();
    const bob = await devEnv.createRandomPerson();

    const appOwnersCapacityDelegationAuthSig =
      await alice.createCapacityDelegationAuthSig([bob.wallet.address]);

    // 4. Bob receives the capacity delegation authSig use it to generate session sigs
    const bobsSessionSigs = await getEoaSessionSigsWithCapacityDelegations(
      devEnv,
      bob.wallet,
      appOwnersCapacityDelegationAuthSig
    );

    // -- printing out the recaps from the session sigs
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bobsSingleSessionSig =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      bobsSessionSigs![devEnv.litNodeClient?.config?.bootstrapUrls[0]!];

    // 5. Bob can now execute JS code using the capacity credits NFT
    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: bobsSessionSigs,
      code: `(async () => {
            const sigShare = await LitActions.signEcdsa({
              toSign: dataToSign,
              publicKey,
              sigName: "sig",
            });
          })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: bob.pkp?.publicKey,
      },
    }).finally(() => {
      devEnv.releasePrivateKeyFromUser(alice);
      devEnv.releasePrivateKeyFromUser(bob);
    });

    // Expected output:
    // {
    //   claims: {},
    //   signatures: {
    //     sig: {
    //       r: "0f4b8b20369a8a021aae7c2083076715820e32d2b18826ea7ccea525a9adadc2",
    //       s: "43aa338fa2c90e13c88d9b432d7ee6c8e3df006b8ef94ad5b4ab32d64b507f17",
    //       recid: 1,
    //       signature: "0x0f4b8b20369a8a021aae7c2083076715820e32d2b18826ea7ccea525a9adadc243aa338fa2c90e13c88d9b432d7ee6c8e3df006b8ef94ad5b4ab32d64b507f171c",
    //       publicKey: "0406A76D2A6E3E729A537640C8C41592BBC2675799CCBBF310CD410691C028C529C5A8DE8016933CEC0B06EC7AA0FFAFBA2791158A11D382C558376DF392F436AD",
    //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //     },
    //   },
    //   decryptions: [],
    //   response: undefined,
    //   logs: "",
    // }

    // -- assertions
    expect(res?.signatures?.sig.r).toBeDefined();
    expect(res?.signatures?.sig.s).toBeDefined();
    expect(res?.signatures?.sig.dataSigned).toBeDefined();
    expect(res?.signatures?.sig.publicKey).toBeDefined();

    // -- signatures.sig.signature must start with 0x
    expect(res?.signatures.sig.signature.startsWith('0x')).toBeDefined();

    // -- signatures.sig.recid must be parseable as a number
    expect(isNaN(res?.signatures.sig.recid)).toBeTruthy();
  });

  it('PKP to EOA PKP Sign', async () => {
    const alice = await devEnv.createRandomPerson();
    const bob = await devEnv.createRandomPerson();

    const appOwnersCapacityDelegationAuthSig =
      await alice.createCapacityDelegationAuthSig([bob.wallet.address]);

    // 4. Bob receives the capacity delegation authSig use it to generate session sigs
    const bobsSessionSigs = await getEoaSessionSigsWithCapacityDelegations(
      devEnv,
      bob.wallet,
      appOwnersCapacityDelegationAuthSig
    );

    // 5. Bob can now execute JS code using the capacity credits NFT
    const res = await devEnv.litNodeClient?.pkpSign({
      sessionSigs: bobsSessionSigs!,
      toSign: alice.loveLetter,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      pubKey: bob.pkp?.publicKey!,
    }).finally(() => {
      devEnv.releasePrivateKeyFromUser(alice);
      devEnv.releasePrivateKeyFromUser(bob);
    });

    // Expected output:
    // {
    //       r: "0f4b8b20369a8a021aae7c2083076715820e32d2b18826ea7ccea525a9adadc2",
    //       s: "43aa338fa2c90e13c88d9b432d7ee6c8e3df006b8ef94ad5b4ab32d64b507f17",
    //       recid: 1,
    //       signature: "0x0f4b8b20369a8a021aae7c2083076715820e32d2b18826ea7ccea525a9adadc243aa338fa2c90e13c88d9b432d7ee6c8e3df006b8ef94ad5b4ab32d64b507f171c",
    //       publicKey: "0406A76D2A6E3E729A537640C8C41592BBC2675799CCBBF310CD410691C028C529C5A8DE8016933CEC0B06EC7AA0FFAFBA2791158A11D382C558376DF392F436AD",
    //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //     },
    //
    // }

    // -- assertions
    expect(res?.r).toBeDefined();
    expect(res?.s).toBeDefined();
    expect(res?.dataSigned).toBeDefined();
    expect(res?.publicKey).toBeDefined();

    // -- signatures.sig.signature must start with 0x
    expect(res?.signature.startsWith('0x')).toBeDefined();

    // -- signatures.sig.recid must be parseable as a number
    expect(isNaN(res?.recid!)).toBeTruthy();
  });
});
