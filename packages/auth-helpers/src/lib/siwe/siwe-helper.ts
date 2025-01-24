import { SiweMessage } from 'siwe';

import { ILitNodeClient, LitResourceAbilityRequest } from '@lit-protocol/types';

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
 * Adds recap capabilities to a SiweMessage.
 * @param siweMessage - The SiweMessage to add recap capabilities to.
 * @param resources - An array of LitResourceAbilityRequest objects representing the resources and abilities to add.
 * @param litNodeClient - The LitNodeClient interface
 * @returns The updated SiweMessage with recap capabilities added.
 * @throws An error if the resources array is empty or if litNodeClient is not provided.
 * @throws An error if the generated capabilities fail to verify for any resource and ability.
 */
export const addRecapToSiweMessage = async ({
  siweMessage,
  resources,
  litNodeClient,
}: {
  siweMessage: SiweMessage;
  resources: LitResourceAbilityRequest[];
  litNodeClient: ILitNodeClient;
}) => {
  if (!resources || resources.length < 1) {
    throw new Error('resources is required');
  }

  if (!litNodeClient) {
    throw new Error('litNodeClient is required');
  }

  for (const request of resources) {
    const recapObject =
      await litNodeClient.generateSessionCapabilityObjectWithWildcards([
        request.resource,
      ]);

    recapObject.addCapabilityForResource(
      request.resource,
      request.ability,
      request.data || null
    );

    const verified = recapObject.verifyCapabilitiesForResource(
      request.resource,
      request.ability
    );

    if (!verified) {
      throw new Error(
        `Failed to verify capabilities for resource: "${request.resource}" and ability: "${request.ability}`
      );
    }

    siweMessage = recapObject.addToSiweMessage(siweMessage);
  }

  return siweMessage;
};
