import { useCallback, useState } from 'react';
import { AuthMethod } from '@lit-protocol/types';
import { getSessionSigs } from '../utils/lit';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { IRelayPKP } from '@lit-protocol/types';
import { SessionSigs } from '@lit-protocol/types';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

export default function useSession() {
  const [sessionSigs, setSessionSigs] = useState<SessionSigs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  /**
   * Generate session sigs and store new session data
   */
  const initSession = useCallback(
    async (authMethod: AuthMethod, pkp: IRelayPKP): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        // Prepare session sigs params
        const chain = 'ethereum';
        const resourceAbilities = [
          {
            resource: new LitActionResource('*'),
            ability: LitAbility.PKPSigning,
          },
        ];
        const expiration = new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7
        ).toISOString(); // 1 week

        // -- check permissions
        const contractClient = new LitContracts();
        await contractClient.connect();

        const authId = await LitAuthClient.getAuthIdByAuthMethod(authMethod);
        
        const scopes = await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
          pkp.tokenId,
          authMethod.authMethodType,
          authId,
          3
        );

        if (!scopes[1] && !scopes[2]) {
          const msg = `Your PKP does not have the required permissions! Please use the 'addPermittedAuthMethodScope' method from the PKPPermissions contract to add the required permissions.\nRead more at https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes`;
          console.error(msg);
          alert(msg);
          return;
        }

        // Generate session sigs
        const sessionSigs = await getSessionSigs({
          pkpPublicKey: pkp.publicKey,
          authMethod,
          sessionSigsParams: {
            chain,
            expiration,
            resourceAbilityRequests: resourceAbilities,
          },
        });

        setSessionSigs(sessionSigs);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    initSession,
    sessionSigs,
    loading,
    error,
  };
}
