import {
  LitActionResource,
  LitPKPResource,
  generateAuthSig,
  createSiweMessageWithRecaps,
} from '@lit-protocol/auth-helpers';
import {
  AuthCallbackParams,
  AuthSig,
  LitAbility,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { LitNetwork } from '@lit-protocol/constants';
import { TinnyPerson } from '../tinny-person';
import { TinnyEnvironment } from '../tinny-environment';

/**
 * Retrieves the session signatures for an EOA in a given Tinny environment.
 *
 * @param devEnv - The Tinny environment object.
 * @param person - The Tinny person object representing the EOA.
 * @param resourceAbilityRequests - Optional. An array of resource ability requests. If not provided, default requests will be used.
 * @returns A promise that resolves to the session signatures.
 */
export const getEoaSessionSigs = async (
  devEnv: TinnyEnvironment,
  person: TinnyPerson,
  resourceAbilityRequests?: LitResourceAbilityRequest[]
) => {
  if (devEnv.litNodeClient.config.litNetwork === LitNetwork.Manzano) {
    console.warn(
      'Manzano network detected. Adding capacityDelegationAuthSig to eoaSessionSigs'
    );
  }

  // Use default resourceAbilityRequests if not provided
  const _resourceAbilityRequests = resourceAbilityRequests || [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ];

  const sessionSigs = await devEnv.litNodeClient.getSessionSigs({
    chain: 'ethereum',
    resourceAbilityRequests: _resourceAbilityRequests,
    authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
    }: AuthCallbackParams) => {
      console.log('resourceAbilityRequests:', resourceAbilityRequests);

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
        walletAddress: person.wallet.address,
        nonce: await devEnv.litNodeClient.getLatestBlockhash(),
        litNodeClient: devEnv.litNodeClient,
      });

      const authSig = await generateAuthSig({
        signer: person.wallet,
        toSign,
      });

      return authSig;
    },

    // -- only add this for manzano network because of rate limiting
    ...(devEnv.litNodeClient.config.litNetwork === LitNetwork.Manzano
      ? { capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig] }
      : {}),
  });

  log('[getEoaSessionSigs]: ', getEoaSessionSigs);

  return sessionSigs;
};

export const getEoaSessionSigsWithCapacityDelegations = async (
  devEnv: TinnyEnvironment,
  fromWallet: ethers.Wallet,
  capacityDelegationAuthSig: AuthSig
) => {
  const sessionSigs = await devEnv.litNodeClient.getSessionSigs({
    chain: 'ethereum',
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
        walletAddress: fromWallet.address,
        nonce: await devEnv.litNodeClient.getLatestBlockhash(),
        litNodeClient: devEnv.litNodeClient,
      });

      const authSig = await generateAuthSig({
        signer: fromWallet,
        toSign,
      });

      return authSig;
    },
    capacityDelegationAuthSig: capacityDelegationAuthSig,
  });

  log('[getEoaSessionSigs]: ', getEoaSessionSigs);

  return sessionSigs;
};
