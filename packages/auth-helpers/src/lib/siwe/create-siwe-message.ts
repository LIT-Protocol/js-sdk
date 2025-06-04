import { computeAddress } from '@ethersproject/transactions';
import { SiweMessage } from 'siwe';

import { getGlobal, InvalidArgumentException } from '@lit-protocol/constants';
import {
  BaseSiweMessage,
  CapacityDelegationFields,
  WithCapacityDelegation,
  WithRecap,
} from '@lit-protocol/types';

import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import {
  addRecapToSiweMessage,
  createCapacityCreditsResourceData,
} from './siwe-helper';

const globalScope = getGlobal();

/**
 * Schema for parameters needed to create a PKP SIWE message
 */
export const CreatePKPSiweMessageParamsSchema = z.object({
  /** Public key of the PKP that will sign */
  pkpPublicKey: HexPrefixedSchema,
  /** URI identifying the session key */
  sessionKeyUri: z.string(),
  /** Nonce from the Lit Node */
  nonce: z.string(),
  /** Expiration time for the session */
  expiration: z.string(),
  /** Optional statement to append to the default SIWE statement */
  statement: z.string().optional(),
  /** Optional domain for the SIWE message */
  domain: z.string().optional(),
  /** Optional resources and abilities for SIWE ReCap */
  resources: z.array(z.any()).optional(), // Using any here as LitResourceAbilityRequest is imported
});

/**
 * Creates the specific SIWE message that needs to be signed by a PKP
 * to authorize a session key.
 * @param params - Parameters for creating the PKP SIWE message.
 * @returns A promise that resolves to the prepared SIWE message string.
 */
export const createPKPSiweMessage = async (
  params: z.infer<typeof CreatePKPSiweMessageParamsSchema>
): Promise<string> => {
  let siweMessage;

  // Compute the address from the public key.
  const pkpEthAddress = computeAddress(params.pkpPublicKey);

  let siwe_statement = 'Lit Protocol PKP session signature';
  if (params.statement) {
    siwe_statement += ' ' + params.statement;
  }

  const siweParams = {
    domain: params.domain || globalScope.location?.host || 'litprotocol.com',
    walletAddress: pkpEthAddress,
    statement: siwe_statement,
    uri: params.sessionKeyUri,
    version: '1',
    chainId: 1,
    expiration: params.expiration,
    nonce: params.nonce,
  };

  if (params.resources) {
    siweMessage = await createSiweMessageWithResources({
      ...siweParams,
      resources: params.resources,
    });
  } else {
    siweMessage = await createSiweMessage(siweParams);
  }

  return siweMessage;
};

/**
 * Creates a SIWE
 * @param { BaseSiweMessage } params - The parameters for creating the SIWE message.
 * @returns A promise that resolves to the created SIWE message as a string.
 * @throws An error if the walletAddress parameter is missing.
 */
export const createSiweMessage = async <T extends BaseSiweMessage>(
  params: T
): Promise<string> => {
  // -- validations
  if (!params.walletAddress) {
    throw new InvalidArgumentException(
      {
        info: {
          params,
        },
      },
      'walletAddress is required'
    );
  }

  const ONE_WEEK_FROM_NOW = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7
  ).toISOString();

  const siweParams = {
    domain: params?.domain ?? 'localhost',
    address: params.walletAddress,
    statement:
      params?.statement ??
      'This is a test statement.  You can put anything you want here.',
    uri: params?.uri ?? 'https://localhost/login',
    version: params?.version ?? '1',
    chainId: params?.chainId ?? 1,
    nonce: params.nonce,
    expirationTime: params?.expiration ?? ONE_WEEK_FROM_NOW,
  };

  let siweMessage = new SiweMessage(siweParams);

  // -- create a message with capacity credits
  if (
    'dAppOwnerWallet' in params || // required param
    'uses' in params || // optional
    'delegateeAddresses' in params // optional
    // 'capacityTokenId' in params // optional
  ) {
    const ccParams = params as CapacityDelegationFields;

    const capabilities = createCapacityCreditsResourceData(ccParams);

    params.resources = [
      {
        // TODO: new resource to be used
        //   resource: new LitRLIResource(ccParams.capacityTokenId ?? '*'),
        //   ability: LIT_ABILITY.RateLimitIncreaseAuth,

        // @ts-expect-error - TODO: new resource to be used
        resource: null,

        // @ts-expect-error - TODO: new ability to be used
        ability: null,
        // @ts-expect-error Complaining because of index signature in destination
        data: capabilities,
      },
    ];
  }

  // -- add recap resources if needed
  if (params.resources) {
    siweMessage = await addRecapToSiweMessage({
      siweMessage,
      resources: params.resources,
    });
  }

  return siweMessage.prepareMessage();
};

/**
 * Creates a SIWE message with recaps added to it.
 *
 * @param { WithRecap } params - The parameters for creating the SIWE message with recaps.
 * @returns A Promise that resolves to a string representing the SIWE message.
 */
export const createSiweMessageWithResources = async (
  params: WithRecap
): Promise<string> => {
  return createSiweMessage({
    ...params,
  });
};

/**
 * Creates a SIWE message with capacity delegation.
 * @param { WithCapacityDelegation } params - The parameters for creating the SIWE message.
 * @returns A Promise that resolves to the created SIWE message.
 * @throws An error if litNodeClient is not provided.
 */
export const createSiweMessageWithCapacityDelegation = async (
  params: WithCapacityDelegation
) => {
  return createSiweMessage({
    ...params,
  });
};
