import { AuthCallback, AuthMethod, AuthSig, ExecuteJsResponse, JsonExecutionSdkParams, JsonPkpSignSdkParams, SessionSigsMap, SigResponse } from '@lit-protocol/types';

// import { DecryptRequest, DecryptResponse } from './decrypt';
// import { EncryptResponse, EncryptSdkParams } from './encrypt';
// import { ClaimKeyResponse, ClaimProcessor, ClaimRequest } from './pkp-permissions';
// import { SignSessionKeyProp, SignSessionKeyResponse } from './sign-session-key';
// import { CapacityCreditsReq, CapacityCreditsRes } from './token-auth';

export interface ILitNodeClient {
  config: any;
  connectedNodes: Set<string>;
  serverKeys: Record<string, Record<string, string>>;
  latestBlockhash: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  getLatestBlockhash: () => Promise<string>;

  // Methods being moved / removed
  // setDefaultMaxPrice: (product: string, price: bigint) => void;
  // getPkpAuthContext: (params: any) => any; // Define specific types if kept
  // getMaxPricesForNodeProduct: (params: any) => Promise<any>; // Define specific types if kept
  // createCapacityDelegationAuthSig: (params: CapacityCreditsReq) => Promise<CapacityCreditsRes>;
  // pkpSign: (params: JsonPkpSignSdkParams) => Promise<SigResponse>;
  // encrypt: (params: EncryptSdkParams) => Promise<EncryptResponse>;
  // decrypt: (params: DecryptRequest) => Promise<DecryptResponse>;
  // executeJs: (params: JsonExecutionSdkParams) => Promise<ExecuteJsResponse>;
  // claimKeyId: (params: ClaimRequest<ClaimProcessor>) => Promise<ClaimKeyResponse>;

  // Other potential methods to review/remove based on refactoring goals
  // getSessionSigs: (params: any) => Promise<SessionSigsMap>; // Define specific types
  // signSessionKey: (params: SignSessionKeyProp) => Promise<SignSessionKeyResponse>;
} 