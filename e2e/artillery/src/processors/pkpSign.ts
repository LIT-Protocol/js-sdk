import { createAuthManager, storagePlugins } from "@lit-protocol/auth";
import { createLitClient } from "@lit-protocol/lit-client";
import { privateKeyToAccount } from "viem/accounts";
import * as StateManager from "../StateManager";

// CONFIGURATIONS
const _network = process.env['NETWORK'];

const NETWORK_CONFIG = {
  'naga-dev': { importName: 'nagaDev', type: 'live' },
  'naga-test': { importName: 'nagaTest', type: 'live' },
  'naga-local': { importName: 'nagaLocal', type: 'local' },
  'naga-staging': { importName: 'nagaStaging', type: 'live' },
} as const;

const config = NETWORK_CONFIG[_network as keyof typeof NETWORK_CONFIG];
if (!config) {
  throw new Error(`❌ Invalid network: ${_network}`);
}

// Global variables to cache expensive operations
let litClient: any = null;
let authManager: any = null;
let aliceEoaAuthContext: any = null;
let networkModule: any = null;

/**
 * Initialize shared resources once
 */
const initializeSharedResources = async () => {
  if (!litClient) {
    console.log('🔧 Initializing shared resources...');
    
    // Import network module
    const networksModule = await import('@lit-protocol/networks');
    networkModule = networksModule[config.importName];
    
    // Create LitClient
    litClient = await createLitClient({ network: networkModule });
    
    // Create AuthManager
    authManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        appName: 'artillery-testing-app',
        networkName: `${_network}-artillery`,
        storagePath: './lit-auth-artillery',
      }),
    });
    
    console.log('✅ Shared resources initialized');
  }
};

/**
 * Create auth context from stored state
 */
const createAuthContextFromState = async () => {
  if (!aliceEoaAuthContext) {
    const state = await StateManager.readFile();
    
    // Validate that private key exists
    if (!state.aliceViemEoaAccount.privateKey) {
      throw new Error('❌ Private key not found in state. Run init.ts first.');
    }
    
    // Recreate the Viem account from stored private key
    const aliceViemEoaAccount = privateKeyToAccount(state.aliceViemEoaAccount.privateKey as `0x${string}`);
    
    // Recreate auth context
    aliceEoaAuthContext = await authManager.createEoaAuthContext({
      config: {
        account: aliceViemEoaAccount,
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
  
  return aliceEoaAuthContext;
};

/**
 * Artillery processor function for pkpSign testing
 */
export async function runPkpSignTest(requestParams: any, context: any, ee: any, next: any) {
  const startTime = Date.now();
  
  try {
    // Initialize shared resources (only happens once)
    await initializeSharedResources();
    
    // Read state
    const state = await StateManager.readFile();
    
    // Create auth context
    const authContext = await createAuthContextFromState();
    
    // Perform pkpSign operation
    const result = await litClient.chain.ethereum.pkpSign({
      authContext: authContext,
      pubKey: state.aliceViemEoaAccount.pkp.publicKey,
      toSign: `Hello from Artillery! ${Date.now()}`, // Unique message per request
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ pkpSign successful in ${duration}ms`);
    
    // For Artillery, just return - no need to call next()
    return;
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ pkpSign failed in ${duration}ms:`, error instanceof Error ? error.message : String(error));
    
    // Throw the error to let Artillery handle it
    throw error;
  }
}
