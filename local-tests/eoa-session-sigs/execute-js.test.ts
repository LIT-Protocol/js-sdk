import {
  LitActionResource,
  LitPKPResource,
  craftAuthSig,
  createSiweMessageWithRecaps,
} from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallbackParams,
  LitAbility,
  SessionSigs,
} from '@lit-protocol/types';
import { expect, test, describe, beforeAll, afterAll } from 'bun:test';
import { ethers } from 'ethers';
import { DevEnv, devEnv } from 'local-tests/setup/env-setup';
import { LitE2eManager } from 'local-tests/setup/utils';

// Test commands:
// ✅ NETWORK=manzano LIT_ENDPOINT_VERSION=v0 DEBUG=true  bun test "./local-tests/eoa-session-sigs/execute-js.test.ts" --timeout 600000
// ✅ NETWORK=localchain LIT_ENDPOINT_VERSION=v1 DEBUG=true  bun test "./local-tests/eoa-session-sigs/execute-js.test.ts" --timeout 600000

describe('EOA Session Signatures - executeJs Function', () => {
  let sessionSigs: SessionSigs;
  let _dev: DevEnv;

  beforeAll(async () => {
    _dev = await devEnv({
      env: LitE2eManager.getNetworkEnv(),
      debug: LitE2eManager.getDebugEnv(),
    });

    sessionSigs = await _dev.litNodeClient.getSessionSigs({
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
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }: AuthCallbackParams) => {
        if (!expiration) {
          throw new Error('expiration is required');
        }

        if (!resourceAbilityRequests) {
          throw new Error('resourceAbilityRequests is required');
        }

        if (!uri) {
          throw new Error('uri is required');
        }

        const toSign = await createSiweMessageWithRecaps({
          uri: uri,
          expiration: expiration,
          resources: resourceAbilityRequests,
          walletAddress: _dev.hotWallet.address,
          nonce: _dev.lastestBlockhash,
          litNodeClient: _dev.litNodeClient,
        });

        const authSig = await craftAuthSig({
          signer: _dev.hotWallet,
          toSign,
        });

        return authSig;
      },
    });
  });

  test('Concurrent Execution', async () => {
    // Test concurrent execution logic here

    const fn = async (index: number) => {
      console.log('🔥 Running index:', index);

      return await _dev.litNodeClient.executeJs({
        sessionSigs,
        code: `(async () => {
          const sigShare = await LitActions.signEcdsa({
            toSign: dataToSign,
            publicKey,
            sigName: "sig",
          });
        })();`,
        jsParams: {
          dataToSign: ethers.utils.arrayify(
            ethers.utils.keccak256([1, 2, 3, 4, 5])
          ),
          publicKey: _dev.hotWalletOwnedPkp.publicKey,
        },
      });
    };

    const result = await Promise.all([fn(1), fn(2), fn(3)]);

    // for loop with index
    for (let i = 0; i < result.length; i++) {
      expect(result).toBeDefined();
      expect(result[i].signatures.sig.r).toBeDefined();
      expect(result[i].signatures.sig.s).toBeDefined();
      expect(result[i].signatures.sig.signature).toContain('0x');
      expect(result[i].signatures.sig.dataSigned).toBeDefined();
    }
  });
});
