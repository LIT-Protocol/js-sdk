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
// ✅ NETWORK=manzano LIT_ENDPOINT_VERSION=v0 DEBUG=true  bun test "./local-tests/eoa-session-sigs/pkp-sign.test.ts" --timeout 600000
// ✅ NETWORK=localchain LIT_ENDPOINT_VERSION=v1 DEBUG=true  bun test "./local-tests/eoa-session-sigs/pkp-sign.test.ts" --timeout 600000

describe('EOA Session Signatures - pkpSign function', () => {
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

  test('simple sign', async () => {
    const runWithSessionSigs = await _dev.litNodeClient.pkpSign({
      toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
      pubKey: _dev.hotWalletOwnedPkp.publicKey,
      sessionSigs,
    });

    // {
    //   r: "40ea3e7acaed496155a4f5970e6bef3a33fc2733bd4704ff240efd646d4edceb",
    //   s: "261404a4b161900bfeff4221d6558ee7832a2473ab0cd7e74181f63229979d0f",
    //   recid: 0,
    //   signature: "0x40ea3e7acaed496155a4f5970e6bef3a33fc2733bd4704ff240efd646d4edceb261404a4b161900bfeff4221d6558ee7832a2473ab0cd7e74181f63229979d0f1b",
    //   publicKey: "041941EA5AA7EAF1986D08C9D8EF01F838144DA708361792A6E01F7D8CAEAF923D2C52C28C1E55813A30DCA55B93044C024345B84AFBAE6A23AA5BECFFBEAEF4A6",
    //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    // }
    expect(runWithSessionSigs).toBeDefined();
    expect(runWithSessionSigs.r).toBeDefined();
    expect(runWithSessionSigs.s).toBeDefined();
    expect(runWithSessionSigs.recid).toBeDefined();
    expect(runWithSessionSigs.signature).toContain('0x');
    expect(runWithSessionSigs.publicKey).toBeDefined();
    expect(runWithSessionSigs.dataSigned).toBeDefined();
  });
});
