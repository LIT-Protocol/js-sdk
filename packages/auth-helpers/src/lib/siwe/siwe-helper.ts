import { SiweMessage } from 'siwe';

import {
  InvalidArgumentException,
  UnknownError,
} from '@lit-protocol/constants';
import {
  CapacityDelegationFields,
  ILitResource,
  ISessionCapabilityObject,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';

import { RecapSessionCapabilityObject } from '../recap/recap-session-capability-object';
import { LitResourceAbilityRequestSchema } from '@lit-protocol/schemas';
import { z } from 'zod';

/**
 * Sanitizes a SIWE message by unescaping double-escaped newlines and replacing escaped double quotes with single quotes.
 *
 * @param message - The SIWE message to sanitize.
 * @returns The sanitized SIWE message.
 */
export function sanitizeSiweMessage(message: string): string {
  let sanitizedMessage = message.replace(/\\\\n/g, '\\n');

  sanitizedMessage = sanitizedMessage.replace(/\\"/g, "'");

  return sanitizedMessage;
}

/**
 * Creates the resource data for a capacity delegation request.
 * @param params - The capacity delegation fields.
 * @returns The capacity delegation request object.
 */
export const createCapacityCreditsResourceData = (
  params: CapacityDelegationFields
): z.infer<(typeof LitResourceAbilityRequestSchema)['shape']['data']> => {
  return {
    ...(params.delegateeAddresses
      ? {
          delegate_to: params.delegateeAddresses.map((address) =>
            address.startsWith('0x') ? address.slice(2) : address
          ),
        }
      : {}),
    ...(params.uses !== undefined ? { uses: params.uses.toString() } : {}),
  };
};

/**
 * Generates wildcard capability for each of the LIT resources
 * specified.
 * @param litResources is an array of LIT resources
 * @param addAllCapabilities is a boolean that specifies whether to add all capabilities for each resource
 */
export const generateSessionCapabilityObjectWithWildcards = async (
  litResources: ILitResource[],
  addAllCapabilities?: boolean
): Promise<ISessionCapabilityObject> => {
  const sessionCapabilityObject = new RecapSessionCapabilityObject({}, []);

  // disable for now
  const _addAllCapabilities = addAllCapabilities ?? false;

  if (_addAllCapabilities) {
    for (const litResource of litResources) {
      sessionCapabilityObject.addAllCapabilitiesForResource(litResource);
    }
  }

  return sessionCapabilityObject;
};

/**
 * Adds recap capabilities to a SiweMessage.
 * @param siweMessage - The SiweMessage to add recap capabilities to.
 * @param resources - An array of LitResourceAbilityRequest objects representing the resources and abilities to add.
 * @returns The updated SiweMessage with recap capabilities added.
 * @throws An error if the resources array is empty or if litNodeClient is not provided.
 * @throws An error if the generated capabilities fail to verify for any resource and ability.
 */
export const addRecapToSiweMessage = async ({
  siweMessage,
  resources,
}: {
  siweMessage: SiweMessage;
  resources: LitResourceAbilityRequest[];
}) => {
  if (!resources || resources.length < 1) {
    throw new InvalidArgumentException(
      {
        info: {
          resources,
          siweMessage,
        },
      },
      'resources is required'
    );
  }

  for (const request of resources) {
    const recapObject = await generateSessionCapabilityObjectWithWildcards([
      request.resource,
    ]);

    recapObject.addCapabilityForResource(
      request.resource,
      request.ability,
      request.data
    );

    const verified = recapObject.verifyCapabilitiesForResource(
      request.resource,
      request.ability
    );

    if (!verified) {
      throw new UnknownError(
        {
          info: {
            recapObject,
            request,
          },
        },
        `Failed to verify capabilities for resource: "${request.resource}" and ability: "${request.ability}`
      );
    }

    siweMessage = recapObject.addToSiweMessage(siweMessage);
  }

  return siweMessage;
};
