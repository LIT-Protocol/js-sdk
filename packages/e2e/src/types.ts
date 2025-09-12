import { createAuthManager } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { privateKeyToAccount } from 'viem/accounts';

export type ViemAccount = ReturnType<typeof privateKeyToAccount>;
export type LitClientInstance = Awaited<ReturnType<typeof createLitClient>>;
export type AuthManagerInstance = Awaited<ReturnType<typeof createAuthManager>>;
export type AuthContext = Awaited<
  ReturnType<
    | AuthManagerInstance['createEoaAuthContext']
    | AuthManagerInstance['createPkpAuthContext']
    | AuthManagerInstance['createCustomAuthContext']
  >
>;
