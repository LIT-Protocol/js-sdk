import {
  LitActionResource,
  LitPKPResource,
  generateAuthSig,
  createSiweMessageWithResources,
} from '@lit-protocol/auth-helpers';
import {
  AuthCallbackParams,
  AuthSig,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import {
  LIT_ABILITY,
  CENTRALISATION_BY_NETWORK,
} from '@lit-protocol/constants';
import { TinnyPerson } from '../tinny-person';
import { TinnyEnvironment } from '../tinny-environment';

export const getEoaAuthContext = (
  devEnv: TinnyEnvironment,
  person: TinnyPerson,
  resourceAbilityRequests?: LitResourceAbilityRequest[]
) => {
  const centralisation =
    CENTRALISATION_BY_NETWORK[devEnv.litNodeClient.config.litNetwork];

  // Use default resourceAbilityRequests if not provided
  return {
    pkpPublicKey: person.authMethodOwnedPkp.publicKey,
    chain: 'ethereum',
    resourceAbilityRequests: resourceAbilityRequests || [
      {
        resource: new LitPKPResource('*'),
        ability: LIT_ABILITY.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LIT_ABILITY.LitActionExecution,
      },
    ],
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

      const toSign = await createSiweMessageWithResources({
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
    ...(centralisation === 'decentralised' && {
      capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
    }),
  };
};

export const getEoaAuthContextWithCapacityDelegations = (
  devEnv: TinnyEnvironment,
  fromWallet: ethers.Wallet,
  capacityDelegationAuthSig: AuthSig
) => {
  const centralisation =
    CENTRALISATION_BY_NETWORK[devEnv.litNodeClient.config.litNetwork];

  return {
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LIT_ABILITY.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LIT_ABILITY.LitActionExecution,
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

      const toSign = await createSiweMessageWithResources({
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
    ...(centralisation === 'decentralised' && {
      capabilityAuthSigs: [
        capacityDelegationAuthSig ?? devEnv.superCapacityDelegationAuthSig,
      ],
    }),
  };
};
