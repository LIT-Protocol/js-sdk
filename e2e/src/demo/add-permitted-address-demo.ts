// Run this command for this demo:
// LOG_LEVEL=silent NETWORK=naga-dev bun run ./e2e/src/demo/add-permitted-address-demo.ts

//
// This test if a PKP EOA Auth Method could add a permitted address via the PKPViemAccount
// 
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { nonceManager } from 'viem';
import { fundAccount } from '../helper/fundAccount';
import { createLitClient } from '@lit-protocol/lit-client';
import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';

// -- Configurations
const { nagaLocal } = await import('@lit-protocol/networks');
const LOCAL_NETWORK_FUNDING_AMOUNT = '1';

// -- Master account to fund the alice(test) account
const localMasterAccount = privateKeyToAccount(
  process.env['LOCAL_MASTER_ACCOUNT'] as `0x${string}`,
  {
    nonceManager: nonceManager,
  }
);

// -- EOA Test account via Viem
const aliceViemAccount = privateKeyToAccount(generatePrivateKey());

// -- Using the authenticator to get the Auth Data
const aliceViemAccountAuthData = await ViemAccountAuthenticator.authenticate(
  aliceViemAccount
);

console.log("✅ aliceViemAccountAuthData:", aliceViemAccountAuthData);

try {
  await fundAccount(aliceViemAccount, localMasterAccount, nagaLocal, {
    ifLessThan: LOCAL_NETWORK_FUNDING_AMOUNT,
    thenFundWith: LOCAL_NETWORK_FUNDING_AMOUNT,
  });
  console.log("✅ Account Funded.")
} catch (e) {
  throw new Error("❌ Failed to fund account.")
}

/**
 * ====================================
 * Initialise the LitClient
 * ====================================
 */
const litClient = await createLitClient({ network: nagaLocal });
console.log("✅ Created Lit Client")

/**
 * ====================================
 * Initialise the AuthManager
 * ====================================
 */
const authManager = createAuthManager({
  storage: storagePlugins.localStorageNode({
    appName: 'my-local-testing-app',
    networkName: 'local-test',
    storagePath: './lit-auth-local',
  }),
});
console.log("✅ Created Auth Manager")

// Minting a new PKP
const tx = await litClient.mintWithAuth({
  account: aliceViemAccount,
  authData: aliceViemAccountAuthData,
  scopes: ['sign-anything'],
});
console.log("✅ TX 1 done");
console.log("ℹ️ tx:", tx)

const pkpInfo = tx.data;
console.log("✅ pkpInfo:", pkpInfo);

const pkpPermissionsManagerForAliceViemAccount = await litClient.getPKPPermissionsManager({
  pkpIdentifier: {
    tokenId: pkpInfo.tokenId,
  },
  account: aliceViemAccount,
});

console.log("✅ pkpPermissionsManagerForAliceViemAccount:", await pkpPermissionsManagerForAliceViemAccount.getPermissionsContext());

// check is address permitted
const aliceViemAccountIsPermitted = await pkpPermissionsManagerForAliceViemAccount.isPermittedAddress({
  address: aliceViemAccount.address,
});

console.log(`❗️ ${aliceViemAccount.address} is ${aliceViemAccountIsPermitted ? 'permitted' : 'NOT permitted'}`);

// check if pkp address is permitted
const pkpIsPermitted = await pkpPermissionsManagerForAliceViemAccount.isPermittedAddress({
  address: pkpInfo.ethAddress,
});

console.log(`❗️ ${pkpInfo.ethAddress} is ${pkpIsPermitted ? 'permitted' : 'NOT permitted'}`);


const authContext = await authManager.createPkpAuthContext({
  authData: aliceViemAccountAuthData,
  pkpPublicKey: pkpInfo.pubkey,
  authConfig: {
    capabilityAuthSigs: [],
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    statement: "",
    domain: "",
    resources: [
      ["pkp-signing", "*"],
      ["lit-action-execution", "*"],
    ],
  },
  litClient,
});

console.log("authContext:", authContext);

const pkpViemAccount = await litClient.getPkpViemAccount({
  pkpPublicKey: pkpInfo.pubkey,
  authContext: authContext,
  chainConfig: nagaLocal.getChainConfig(),
});

await fundAccount(pkpViemAccount, localMasterAccount, nagaLocal, {
  ifLessThan: LOCAL_NETWORK_FUNDING_AMOUNT,
  thenFundWith: LOCAL_NETWORK_FUNDING_AMOUNT,
});

const pkpViemAccountPermissionsManager = await litClient.getPKPPermissionsManager({
  pkpIdentifier: {
    tokenId: pkpInfo.tokenId,
  },
  account: pkpViemAccount,
});

try {
  const tx2 = await pkpViemAccountPermissionsManager.addPermittedAddress({
    address: "0x1234567890123456789012345678901234567890",
    scopes: ["sign-anything"],
  });
  console.log('tx2:', tx2)
} catch (e) {
  throw new Error(e);
}

console.log("✅ pkpViemAccountPermissionsManager:", await pkpViemAccountPermissionsManager.getPermissionsContext());

process.exit();