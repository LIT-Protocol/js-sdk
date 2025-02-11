import { ethers } from 'ethers';

import { LitActionResource } from '@lit-protocol/auth-helpers';
import { LIT_ABILITY, LIT_NETWORK } from '@lit-protocol/constants';
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

interface ExecuteLitAction {
  litNodeClient: LitNodeClient;
  capacityTokenId?: string;
  pkpEthAddress: string;
  pkpPublicKey: string;
  authSigner: ethers.Wallet;
  ipfsId?: string;
  code?: string;
  jsParams?: Record<string, unknown>;
}

const ONE_MINUTE = 1 * 60 * 1000;

export async function executeLitAction({
  litNodeClient,
  capacityTokenId,
  pkpEthAddress,
  pkpPublicKey,
  authSigner,
  ipfsId,
  code,
  jsParams,
}: ExecuteLitAction) {
  const expiration = new Date(Date.now() + ONE_MINUTE).toISOString();

  const executeJsResponse = await litNodeClient.executeJs({
    ipfsId,
    code,
    jsParams,
    authContext: litNodeClient.getPkpAuthContext({
      pkpPublicKey,
      capabilityAuthSigs: [],
      authMethods: [
        await EthWalletProvider.authenticate({
          signer: authSigner,
          litNodeClient: litNodeClient,
          expiration,
        }),
      ],
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      expiration,
    }),
  });

  return executeJsResponse;
}
