import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient, LitClientType } from '@lit-protocol/lit-client';
import { z } from 'zod';
import * as StateManager from '../StateManager';
import * as NetworkManager from '../../../src/helper/NetworkManager';
import * as AccountManager from '../AccountManager';

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
    networkModule = await NetworkManager.getLitNetworkModule();

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
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
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
      pubKey: state.masterAccount.pkp.publicKey,
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
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
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
