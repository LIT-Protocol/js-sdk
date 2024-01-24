import { SiweMessage } from 'siwe';
import { AttenuationsObject, CID, ISessionCapabilityObject } from './models';
import { RecapSessionCapabilityObject } from './recap/recap-session-capability-object';

/**
 *
 * newSessionCapabilityObject is a function that abstracts away the details of
 * creating and verifying a session capability object. For example, it uses
 * the SIWE Recap object to create the capability object, but that detail is
 * hidden from the user.
 *
 * This function serves as an abstraction and router to the
 * underlying implementation of the ISessionCapabilityObject.
 *
 * @param attenuations the attenuations you want to add to the capability object
 * @param proof the proofs you want to add to the capability object
 * @returns a ISessionCapabilityObject
 */
export function newSessionCapabilityObject(
  attenuations: AttenuationsObject = {},
  proof: Array<CID> = []
): ISessionCapabilityObject {
  return new RecapSessionCapabilityObject(attenuations, proof);
}

export function decode(encoded: string): ISessionCapabilityObject {
  return RecapSessionCapabilityObject.decode(encoded);
}

export function extract(siwe: SiweMessage): ISessionCapabilityObject {
  return RecapSessionCapabilityObject.extract(siwe);
}
