import { ethers } from 'ethers';
import {
  AuthConfig,
  AuthManagerParams,
  BaseAuthContext,
  tryGetCachedAuthData,
} from '../auth-manager';
import { PkpAuthDepsSchema } from './getPkpAuthContextAdapter';

export interface ICustomAuthenticator {
  new (settings: any): ICustomAuthenticatorInstance;
  LIT_ACTION_CODE_BASE64?: string;
  LIT_ACTION_IPFS_ID?: string;
}

interface ICustomAuthenticatorInstance {
  // Method to perform external auth and return jsParams for the Lit Action
  // Accepts the config object which includes pkpPublicKey and other needed params
  authenticate(config: {
    pkpPublicKey: string;
    [key: string]: any;
  }): Promise<Record<string, any> | null>;
}

export async function getCustomAuthContextAdapter(
  upstreamParams: AuthManagerParams,
  params: {
    authenticator: ICustomAuthenticator; // Use the interface type
    settings: Record<string, any>; // For constructor
    config: { pkpPublicKey: string; [key: string]: any }; // For authenticate method
    authConfig: AuthConfig; // For SIWE/session
    litClient: BaseAuthContext<any>['litClient'];
  }
) {
  // 1. Instantiate the custom authenticator helper using 'settings'
  const customAuthHelper = new params.authenticator(params.settings);

  // 2. Call the helper's authenticate method using 'config'
  if (!customAuthHelper.authenticate) {
    throw new Error("Custom authenticator is missing 'authenticate' method.");
  }
  // Pass the entire config object to the authenticator's authenticate method
  const jsParams = await customAuthHelper.authenticate(params.config);
  if (!jsParams) {
    throw new Error('Custom authenticator failed to produce jsParams.');
  }

  // 3. Get the static Lit Action code/ID from the authenticator class
  const litActionCode = params.authenticator.LIT_ACTION_CODE_BASE64;
  const litActionIpfsId = params.authenticator.LIT_ACTION_IPFS_ID; // Optional
  if (!litActionCode && !litActionIpfsId) {
    throw new Error(
      'Custom authenticator is missing static LIT_ACTION_CODE_BASE64 or LIT_ACTION_IPFS_ID.'
    );
  }

  // 4. Extract pkpPublicKey (already available in params.config)
  const pkpPublicKey = params.config.pkpPublicKey;

  // 5. Get node dependencies, session key etc.
  const litClientConfig = PkpAuthDepsSchema.parse({
    nonce: await params.litClient.getLatestBlockhash(),
    currentEpoch: await params.litClient.getCurrentEpoch(),
    getSignSessionKey: params.litClient.getSignSessionKey,
    nodeUrls: await params.litClient.getMaxPricesForNodeProduct({
      product: 'LIT_ACTION', // Or appropriate product
    }),
  });
  const pkpAddress = ethers.utils.computeAddress(pkpPublicKey);
  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: pkpAddress,
    expiration: params.authConfig.expiration,
    type: 'LitAction', // Session type remains LitAction
  });

  // 6. Prepare the request body for the node signing function
  const requestBodyForCustomAuth = {
    sessionKey: authData.sessionKey.keyPair.publicKey,
    pkpPublicKey: pkpPublicKey,
    statement: params.authConfig.statement,
    domain: params.authConfig.domain,
    expiration: params.authConfig.expiration,
    resources: params.authConfig.resources,
    uri: authData.sessionKey.keyPair.publicKey,
    nonce: litClientConfig.nonce,
    ...(litActionCode && { code: litActionCode }),
    ...(litActionIpfsId && { litActionIpfsId: litActionIpfsId }),
    jsParams: jsParams, // Use the result from customAuthHelper.authenticate
    authMethods: [],
    epoch: litClientConfig.currentEpoch,
    // ... other fields like curveType, signingScheme ...
  };

  // 7. Return the auth context object
  return {
    chain: 'ethereum',
    pkpPublicKey: pkpPublicKey,
    resources: params.authConfig.resources,
    capabilityAuthSigs: params.authConfig.capabilityAuthSigs,
    expiration: params.authConfig.expiration,
    authNeededCallback: async () => {
      const authSig = await litClientConfig.getSignSessionKey({
        requestBody: requestBodyForCustomAuth,
        nodeUrls: litClientConfig.nodeUrls.map((node: any) => node.url),
      });
      return authSig;
    },
  };
}
