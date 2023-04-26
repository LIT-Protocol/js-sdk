import { SiweMessage } from 'siwe';
import { AttenuationsObject, CID, SessionCapabilityObjectImpl } from './models';
import { RecapSessionCapabilityObject } from './recap/recap-session-capability-object';

/**
 *
 * newSessionCapabilityObject is a function that abstracts away the details of
 * creating and verifying a session capability object. For example, it uses
 * the SIWE Recap object to create the capability object, but that detail is
 * hidden from the user.
 *
 * This function serves as an abstraction and router to the
 * underlying implementation of the SessionCapabilityObjectImpl.
 *
 * @param att the attenuations you want to add to the capability object
 * @param prf the proofs you want to add to the capability object
 * @returns a SessionCapabilityObjectImpl
 */
export function newSessionCapabilityObject(
  att: AttenuationsObject = {},
  prf: Array<CID> = []
): SessionCapabilityObjectImpl {
  return new RecapSessionCapabilityObject(att, prf);
}

export function decode(encoded: string): SessionCapabilityObjectImpl {
  return RecapSessionCapabilityObject.decode(encoded);
}

export function extract(siwe: SiweMessage): SessionCapabilityObjectImpl {
  return RecapSessionCapabilityObject.extract(siwe);
}
