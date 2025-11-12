import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient, LitClientType } from '@lit-protocol/lit-client';
import { z } from 'zod';
import * as StateManager from '../StateManager';
import { getLitNetworkModule } from '@lit-protocol/e2e';
import * as AccountManager from '../AccountManager';
import { createAccBuilder } from '@lit-protocol/access-control-conditions';

// PKP Sign Result Schema
const PkpSignResultSchema = z.object({
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex signature'),
  verifyingKey: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex verifying key'),
  signedData: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex signed data'),
  recoveryId: z.number().int().min(0).max(3, 'Recovery ID must be 0-3'),
  publicKey: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex public key'),
  sigType: z.string().min(1, 'Signature type cannot be empty'),
});

// Execute JS Result Schema
const ExecuteJsResultSchema = z.object({
  success: z.boolean(),
  signatures: z.record(
    z.string(),
    z.object({
      signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex signature'),
      verifyingKey: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex verifying key'),
      signedData: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex signed data'),
      recoveryId: z.number().int().min(0).max(3, 'Recovery ID must be 0-3'),
      publicKey: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex public key'),
      sigType: z.string().min(1, 'Signature type cannot be empty'),
    })
  ),
  response: z.string(),
  logs: z.string().optional(),
});

// Global variables to cache expensive operations
let litClient: LitClientType;
let authManager: any = null;
let masterAccountAuthContext: any = null;
let networkModule: any = null;
let masterAccount: any = null;

/**
 * Initialise shared resources once
 */
const initialiseSharedResources = async () => {
  if (!litClient) {
    console.log('🔧 Initializing shared resources...');

    // Import network module
    networkModule = await getLitNetworkModule();

    // Create LitClient
    litClient = await createLitClient({ network: networkModule });

    // Create AuthManager
    authManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'artillery-testing-app',
        networkName: `${process.env['NETWORK']}-artillery`,
        storagePath: './lit-auth-artillery',
      }),
    });

    console.log('✅ Shared resources initialised');
  }
};

/**
 * Create auth context from stored state
 */
const createAuthContextFromState = async () => {
  if (!masterAccountAuthContext) {
    const state = await StateManager.readFile();

    // Validate that master account authData and PKP exist
    if (!state.masterAccount.authData) {
      throw new Error(
        '❌ Master account authData not found in state. Run init.ts first.'
      );
    }

    if (!state.masterAccount.pkp) {
      throw new Error(
        '❌ Master account PKP not found in state. Run init.ts first.'
      );
    }

    // Get the master account from environment (same as init.ts)
    if (!masterAccount) {
      masterAccount = await AccountManager.getMasterAccount();
    }

    // Create auth context for master account
    masterAccountAuthContext = await authManager.createEoaAuthContext({
      config: {
        account: masterAccount,
      },
      authConfig: {
        statement: 'I authorize the Lit Protocol to execute this Lit Action.',
        domain: 'example.com',
        resources: [
          ['lit-action-execution', '*'],
          ['pkp-signing', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        capabilityAuthSigs: [],
        expiration: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      },
      litClient: litClient,
    });
  }

  return masterAccountAuthContext;
};

/**
 * test the '/web/pkp/sign' endpoint
 */
export async function runPkpSignTest() {
  const startTime = Date.now();

  try {
    // 1. Initialise shared resources (only happens once)
    await initialiseSharedResources();

    // 2. Read state
    const state = await StateManager.readFile();

    // Create auth context
    const authContext = await createAuthContextFromState();

    // Perform pkpSign operation
    const result = await litClient.chain.ethereum.pkpSign({
      authContext: authContext,
      pubKey: state.masterAccount.pkp.pubkey,
      toSign: `Hello from Artillery! ${Date.now()}`, // Unique message per request
      // userMaxPrice: 1000000000000000000n,
    });

    // Validate the result using Zod schema
    const validatedResult = PkpSignResultSchema.parse(result);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ pkpSign successful in ${duration}ms`);
    console.log('✅ pkpSign result:', validatedResult);

    // For Artillery, just return - no need to call next()
    return;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error(
      `❌ pkpSign failed in ${duration}ms:`,
      error instanceof Error ? error.message : String(error)
    );

    // Throw the error to let Artillery handle it
    // Handle specific errors to aggregate them
    if (
      error instanceof Error &&
      error.message.includes('unable to get signature share')
    ) {
      throw new Error('"PKP Sign" failed. unable to get signature share.');
    } else {
      throw error;
    }
  }
}

// test '/web/encryption/sign/v2' endpoint
export async function runEncryptDecryptTest() {
  const startTime = Date.now();

  try {
    // 1. Initialise shared resources (only happens once)
    await initialiseSharedResources();

    // 2. Read state
    const state = await StateManager.readFile();

    // Create auth context
    const authContext = await createAuthContextFromState();

    // Set up access control conditions requiring wallet ownership
    const addressToUse = authContext.account.address;
    const builder = createAccBuilder();
    const accs = builder
      .requireWalletOwnership(addressToUse)
      .on('ethereum')
      .build();

    // Encrypt data with the access control conditions
    const dataToEncrypt = 'Hello from PKP encrypt-decrypt test!';
    const encryptedData = await litClient.encrypt({
      dataToEncrypt,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    // Decrypt the data using the appropriate auth context
    const decryptedData = await litClient.decrypt({
      data: encryptedData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext,
    });

    // Assert that the decrypted data is the same as the original data
    if (decryptedData.convertedData !== dataToEncrypt) {
      throw new Error('❌ Decrypted data does not match the original data');
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ encrypt & decrypt successful in ${duration}ms`);

    // For Artillery, just return - no need to call next()
    return;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error(
      `❌ encrypt & decrypt failed in ${duration}ms:`,
      error instanceof Error ? error.message : String(error)
    );

    // Throw the error to let Artillery handle it
    throw error;
  }
}

// test '/web/execute/v2' endpoint
export async function runExecuteJSTest(context: any, _events: any) {
  const variant = context.scenario.variables.variant;

  console.log('🔍 variant:', variant);

  const startTime = Date.now();

  try {
    // 1. Initialise shared resources (only happens once)
    await initialiseSharedResources();

    // 2. Read state
    const state = await StateManager.readFile();

    // Create auth context
    const authContext = await createAuthContextFromState();

    // Set up access control conditions requiring wallet ownership
    const builder = createAccBuilder();
    const accs = builder
      .requireWalletOwnership(authContext.account.address)
      .on('ethereum')
      .build();

    let encryptedData: any;
    if (variant === 'decryptToSingleNode') {
      // Encrypt data with the access control conditions
      const dataToEncrypt = 'Hello from encrypt-decrypt test!';
      encryptedData = await litClient.encrypt({
        dataToEncrypt,
        unifiedAccessControlConditions: accs,
        chain: 'ethereum',
      });
    }

    // Perform executeJs operation
    const { litActionCode, jsParams } = getLitActionCodeAndJsParams(
      variant,
      state,
      encryptedData,
      accs,
      null
    );

    const result = await litClient.executeJs({
      code: litActionCode,
      authContext,
      jsParams,
    });

    // Validate the result using Zod schema
    const validatedResult = ExecuteJsResultSchema.parse(result);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ executeJs successful in ${duration}ms`);
    console.log('✅ executeJs result:', validatedResult);

    // For Artillery, just return - no need to call next()
    return;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error(
      `❌ executeJs failed in ${duration}ms:`,
      error instanceof Error ? error.message : String(error)
    );

    // Throw the error to let Artillery handle it
    throw error;
  }
}

// test '/web/sign_session_key' endpoint
export async function runSignSessionKeyTest() {
  // ❗️ IT'S IMPORTANT TO SET THIS TO FALSE FOR TESTING
  const DELEGATION_AUTH_SIG_CACHE = false;

  const startTime = Date.now();

  try {
    // 1. initialise shared resources
    await initialiseSharedResources();

    // 2. Read state
    const state = await StateManager.readFile();

    const masterAccountPkpAuthContext = await authManager.createPkpAuthContext({
      authData: state.masterAccount.authData,
      pkpPublicKey: state.masterAccount.pkp.publicKey,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        // 30m expiration
        expiration: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      },
      litClient: litClient,
      cache: {
        delegationAuthSig: DELEGATION_AUTH_SIG_CACHE,
      },
    });

    // console.log('✅ Master Account PKP Auth Context:', masterAccountPkpAuthContext);
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error(
      `❌ signSessionKey failed in ${duration}ms:`,
      error instanceof Error ? error.message : String(error)
    );

    // Throw the error to let Artillery handle it
    throw error;
  }
}

// String enum for the variant
type Variant =
  | 'sign'
  | 'broadcastAndCollect'
  | 'checkConditionsWithoutAuthSig'
  | 'signChildLitAction'
  | 'decryptToSingleNode'
  | 'runOnce';

function getLitActionCodeAndJsParams(
  variant: Variant,
  state: any,
  encryptedData?: any,
  accs?: any,
  authSig?: any
): {
  litActionCode: string;
  jsParams: any;
} {
  switch (variant) {
    case 'broadcastAndCollect':
      return {
        litActionCode: `
        (async () => {
          const resp = await Lit.Actions.broadcastAndCollect({
            name: 'some-name',
            value: 'some-value',
          });
          Lit.Actions.setResponse({ response: JSON.stringify(resp) });
        })();`,
        jsParams: undefined,
      };
    case 'checkConditionsWithoutAuthSig':
      return {
        litActionCode: `
        (async () => {
          const { accessControlConditions } = jsParams;
          const resp = await Lit.Actions.checkConditions({
            conditions: accessControlConditions,
            chain: 'ethereum',
          });
          Lit.Actions.setResponse({ response: JSON.stringify(resp.toString()) });
        })();`,
        jsParams: {
          accessControlConditions:
            accs || state.masterAccount.pkp.accessControlConditions,
        },
      };
    case 'signChildLitAction':
      return {
        litActionCode: `
        (async () => {
          const { sigName, publicKey } = jsParams;
          let utf8Encode = new TextEncoder();
          const toSign = utf8Encode.encode('This message is exactly 32 bytes');
          const _ = await Lit.Actions.call({ ipfsId: 'QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm', params: {
              toSign: Array.from(toSign),
              publicKey,
              sigName
          }});
        })();`,
        jsParams: {
          sigName: 'e2e-test-sig',
          publicKey: state.masterAccount.pkp.pubkey,
        },
      };
    case 'decryptToSingleNode':
      return {
        litActionCode: `
        (async () => {
          const { accessControlConditions, authSig, ciphertext, dataToEncryptHash } = jsParams;
          const resp = await Lit.Actions.decryptAndCombine({
            accessControlConditions,
            ciphertext,
            dataToEncryptHash,
            authSig,
            chain: 'ethereum',
          });
          Lit.Actions.setResponse({ response: JSON.stringify(resp) });
        })();`,
        jsParams: {
          accessControlConditions:
            accs || state.masterAccount.pkp.accessControlConditions,
          authSig,
          ciphertext: encryptedData?.ciphertext,
          dataToEncryptHash: encryptedData?.dataToEncryptHash,
        },
      };
    case 'runOnce':
      return {
        litActionCode: `
        (async () => {
          let temp = await Lit.Actions.runOnce(
            { waitForResponse: false, name: 'weather' },
            async () => {
              const url = 'https://api.weather.gov/gridpoints/TOP/31,80/forecast';
              const resp = await fetch(url).then((response) => response.json());
              const temp = resp.properties.periods[0].temperature;
              return temp;
            }
          );

          Lit.Actions.setResponse({ response: JSON.stringify(temp) });
        })();`,
        jsParams: undefined,
      };
    case 'sign':
      return {
        litActionCode: `
        (async () => {
          const { sigName, toSign, publicKey } = jsParams;
          const { keccak256, arrayify } = ethers.utils;
          
          const toSignBytes = new TextEncoder().encode(toSign);
          const toSignBytes32 = keccak256(toSignBytes);
          const toSignBytes32Array = arrayify(toSignBytes32);
          
          const sigShare = await Lit.Actions.signEcdsa({
            toSign: toSignBytes32Array,
            publicKey,
            sigName,
          });  
        })();`,
        jsParams: {
          message: 'Test message from e2e executeJs',
          sigName: 'e2e-test-sig',
          toSign: 'Test message from e2e executeJs',
          publicKey: state.masterAccount.pkp.pubkey,
        },
      };
    default:
      throw new Error(`Unknown variant: ${variant}`);
  }
}
