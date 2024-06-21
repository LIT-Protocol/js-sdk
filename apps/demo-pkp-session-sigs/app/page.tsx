'use client';

import { ProviderType } from '@lit-protocol/constants';
import { Long, PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPSuiWallet } from '@lit-protocol/pkp-sui';
import { LitAbility, LitPKPResource } from '@lit-protocol/auth-helpers';
import { GoogleProvider, LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { AuthCallbackParams } from '@lit-protocol/types';
import { JsonRpcProvider, testnetConnection } from '@mysten/sui.js';
import { ethers } from 'ethers';
import { useState } from 'react';

import { LitLogo } from '@/components/LitLogo';

export default function Home() {
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');

  async function go() {
    try {
      setStatus('Creating a LitAuthClient instance...');
      setResponse('');

      // -- 1. Create a LitAuthClient instance
      const litNodeClient = new LitNodeClient({
        litNetwork: 'cayenne',
        debug: true,
      });

      await litNodeClient.connect();

      setStatus('Creating a LitAuthClient instance...');
      // -- 2. Create a LitAuthClient instance
      const litAuthClient = new LitAuthClient({
        litRelayConfig: {
          relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
        },
        litNodeClient: litNodeClient,
      });

      setStatus('Creating an auth provider...');

      // -- 3. Create an auth provider
      const authProvider = litAuthClient.initProvider<GoogleProvider>(
        ProviderType.Google
      );

      setStatus('Checking if user is already signed in...');
      // -- 4. Check if user is already signed in
      const url = new URL(window.location.href);
      const provider = url.searchParams.get('provider');

      // -- 4a. redirect to sign in if no provider
      if (!provider) {
        setStatus('Redirecting to sign in...');
        await authProvider.signIn();
        return;
      }

      setStatus('Authenticating...');
      // -- 4b. authenticate
      const authMethod = await authProvider.authenticate();
      setResponse(`authMethod: ${JSON.stringify(authMethod)}`);

      setStatus('Fetching user PKPs...');
      // -- 5. fetch user pkps, if none, create one, and use it
      let pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);

      if (pkps.length <= 0) {
        try {
          setStatus('Creating PKP...');
          await authProvider.mintPKPThroughRelayer(authMethod);
        } catch (e) {
          setStatus('Failed to mint PKP');
          return;
        }
        setStatus('Fetching user PKPs...');
        pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);
      }

      const pkp = pkps[pkps.length - 1];
      setResponse(`pkp: ${JSON.stringify(pkp)}`);

      setStatus('Getting session sigs...');
      // -- 6. get session sigs
      const resourceAbilityRequests = [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
      ];
      const authNeededCallback = async (params: AuthCallbackParams) => {
        const response = await litNodeClient.signSessionKey({
          resourceAbilityRequests,
          pkpPublicKey: pkp.publicKey,
          statement: params.statement,
          authMethods: [authMethod],
          expiration: params.expiration,
          resources: params.resources,
          chainId: 1,
        });
        return response.authSig;
      };
      const sessionSigs = await authProvider?.getSessionSigs({
        pkpPublicKey: pkp.publicKey,
        authMethod: authMethod,
        // resourceAbilityRequests,
        sessionSigsParams: {
          chain: 'ethereum',
          resourceAbilityRequests,
          authNeededCallback,
        },
      });
      setResponse(`sessionSigs: ${JSON.stringify(sessionSigs)}`);

      setStatus('Using pkpSign with the session sigs...');
      // -- 7. Try to use pkpSign with the session sigs
      const TO_SIGN = ethers.utils.arrayify(
        ethers.utils.keccak256([1, 2, 3, 4, 5])
      );

      const pkpSignRes = await litNodeClient?.pkpSign({
        toSign: TO_SIGN,
        pubKey: pkp.publicKey,
        sessionSigs: sessionSigs,
      });
      setResponse(`pkpSignRes: ${JSON.stringify(pkpSignRes)}`);

      // -- 8. Create PKPWallet instances
      setStatus('Creating PKP*Wallet instances...');
      // -- 8.1 Create a PKPEthersWallet instance
      const pkpEthersWallet = new PKPEthersWallet({
        authContext: {
          client: litNodeClient,
          getSessionSigsProps: {
            chain: 'ethereum',
            expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
            resourceAbilityRequests,
            authNeededCallback,
          },
        },
        pkpPubKey: pkp.publicKey,
        litNodeClient,
      });

      // -- 8.2 Create a PKPCosmosWallet instance
      const pkpCosmosWallet = new PKPCosmosWallet({
        addressPrefix: 'cosmos',
        authContext: {
          client: litNodeClient,
          getSessionSigsProps: {
            chain: 'cosmos',
            expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
            resourceAbilityRequests,
            authNeededCallback,
          },
        },
        pkpPubKey: pkp.publicKey,
        litNodeClient,
      });
      // -- 8.3 Create a PKPSuiWallet instance
      const pkpSuiWallet = new PKPSuiWallet(
        {
          authContext: {
            client: litNodeClient,
            getSessionSigsProps: {
              chain: 'sui',
              expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
              resourceAbilityRequests,
              authNeededCallback,
            },
          },
          pkpPubKey: pkp.publicKey,
          litNodeClient,
        },
        new JsonRpcProvider(testnetConnection)
      );

      await Promise.all([
        pkpEthersWallet.init(),
        pkpCosmosWallet.init(),
        pkpSuiWallet.init(),
      ]);

      setStatus(
        'Using those PKP*Wallet instances to sign a message...'
      );
      // -- 9.1 Use the PKPEthersWallet instance to sign a message
      const signature = await pkpEthersWallet.signMessage(TO_SIGN);

      // -- 9.2 Use the PKPCosmosWallet instance to sign a message
      const cosmosAddress = await pkpCosmosWallet.getAddress();
      const cosmosSignature = await pkpCosmosWallet.signDirect(cosmosAddress, {
        chainId: 'cosmos',
        accountNumber: new Long(1),
        authInfoBytes: TO_SIGN, // We just want the PKP to sign the msg, we are not sending a tx. This is not important then
        bodyBytes: TO_SIGN,
      });
      // -- 9.2 Use the PKPSuiWallet instance to sign a message
      const suiSignature = await pkpSuiWallet.signData(TO_SIGN);
      setResponse(`
      Eth signature: ${JSON.stringify(signature)}
      ------------------------------------------------------
      Cosmos signature: ${JSON.stringify(cosmosSignature)}
      ------------------------------------------------------
      Sui signature: ${JSON.stringify(suiSignature)}
      `);

      setStatus('Signed messages:');
    } catch (error) {
      console.error(error);
      setStatus('Error');
      setResponse((error as Error).message);
    }
  }

  return (
    <main className="max-w-screen-lg mx-auto px-4">
      <div className="flex justify-center mt-10">
        <LitLogo />
      </div>

      <div className="flex justify-center mt-10 px-4">
        <h1 className="text-5xl font-bold text-center">
          Lit Protocol:: Session Sigs
        </h1>
      </div>

      <div className="flex justify-center mt-10">
        <button onClick={go} className="lit-button">
          Go
        </button>
      </div>

      <div className="flex justify-center mt-10 text-white w-full px-4">
        <p className="break-all">{status}</p>
      </div>

      <div className="flex justify-center mt-10 text-white w-full px-4">
        <p className="break-all">{response}</p>
      </div>
    </main>
  );
}
