import {
  LitActionResource,
  LitPKPResource,
  craftAuthSig,
  createSiweMessageWithRecaps,
} from '@lit-protocol/auth-helpers';
import { DevEnv } from '../tinny-setup';
import {
  AuthCallbackParams,
  AuthSig,
  LitAbility,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { LitNetwork } from '@lit-protocol/constants';

export const getEoaSessionSigs = async (
  devEnv: DevEnv,
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
        walletAddress: devEnv.hotWallet.address,
        nonce: devEnv.lastestBlockhash,
        litNodeClient: devEnv.litNodeClient,
      });

      const authSig = await craftAuthSig({
        signer: devEnv.hotWallet,
        toSign,
      });

      return authSig;
    },

    // -- only add this for manzano network because of rate limiting
    ...(devEnv.litNodeClient.config.litNetwork === LitNetwork.Manzano
      ? { capabilityAuthSigs: [devEnv.capacityDelegationAuthSig] }
      : {}),
  });

  log('[getEoaSessionSigs]: ', getEoaSessionSigs);

  return sessionSigs;
};

export const getEoaSessionSigsWithCapacityDelegations = async (
  devEnv: DevEnv,
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
        nonce: devEnv.lastestBlockhash,
        litNodeClient: devEnv.litNodeClient,
      });

      const authSig = await craftAuthSig({
        signer: fromWallet,
        toSign,
      });

      return authSig;
    },
    capabilityAuthSigs: [capacityDelegationAuthSig],
  });

  log('[getEoaSessionSigs]: ', getEoaSessionSigs);

  return sessionSigs;
};
