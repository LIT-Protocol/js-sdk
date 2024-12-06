import { ethers } from 'ethers';

import { LitActionResource } from '@lit-protocol/auth-helpers';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

export const signWithLitActionCode = `(async () =>  {
            const signature = await Lit.Actions.signAndCombineEcdsa({
              toSign,
              publicKey,
              sigName,
            });

            Lit.Actions.setResponse({ response: signature });
          })();`;

interface ExecuteLitActionBase {
  litNodeClient: LitNodeClient;
  pkpPublicKey: string;
  authSigner: ethers.Wallet;
  ipfsId?: string;
  code: string;
  jsParams: Record<string, any>;
}

interface ExecuteCodeLitAction extends ExecuteLitActionBase {
  code: string;
}

interface ExecuteIPFSLitAction extends ExecuteLitActionBase {
  ipfsId: string;
}

type ExecuteLitAction = ExecuteCodeLitAction | ExecuteIPFSLitAction;

export async function executeLitAction({
  litNodeClient,
  pkpPublicKey,
  authSigner,
  ipfsId,
  code,
  jsParams,
}: ExecuteLitAction) {
  const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
    pkpPublicKey,
    capabilityAuthSigs: [],
    authMethods: [
      await EthWalletProvider.authenticate({
        signer: authSigner,
        litNodeClient: litNodeClient,
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      }),
    ],
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LIT_ABILITY.LitActionExecution,
      },
    ],
  });

  const executeJsResponse = await litNodeClient.executeJs({
    ipfsId,
    code,
    jsParams,
    sessionSigs: pkpSessionSigs,
  });

  return executeJsResponse;
}
