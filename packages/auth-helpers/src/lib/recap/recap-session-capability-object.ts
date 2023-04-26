import { SiweMessage } from 'siwe';
import { Recap } from 'siwe-recap';
import {
  AttenuationsObject,
  CID,
  LitAbility,
  PlainJSON,
  ISessionCapabilityObject,
} from '../models';
import { getRecapNamespaceAndAbility, getRecapResourceKey } from './utils';

export class RecapSessionCapabilityObject implements ISessionCapabilityObject {
  #inner: Recap;

  constructor(
    att: AttenuationsObject = {},
    prf: Array<CID> | Array<string> = []
  ) {
    this.#inner = new Recap(att, prf);
  }

  static decode(encoded: string): RecapSessionCapabilityObject {
    const recap = Recap.decode_urn(encoded);
    return new this(
      recap.attenuations,
      recap.proofs.map((cid) => cid.toString())
    );
  }

  static extract(siwe: SiweMessage): RecapSessionCapabilityObject {
    const recap = Recap.extract_and_verify(siwe);
    return new this(
      recap.attenuations,
      recap.proofs.map((cid) => cid.toString())
    );
  }

  get attenuations(): AttenuationsObject {
    return this.#inner.attenuations;
  }

  get proofs(): Array<CID> {
    return this.#inner.proofs.map((cid) => cid.toString());
  }

  get statement(): string {
    return this.#inner.statement;
  }

  addProof(proof: string): void {
    return this.#inner.addProof(proof);
  }

  addAttenuation(
    resource: string,
    namespace: string = '*',
    name: string = '*',
    restriction: { [key: string]: PlainJSON } = {}
  ) {
    return this.#inner.addAttenuation(resource, namespace, name, restriction);
  }

  addToSiweMessage(siwe: SiweMessage): SiweMessage {
    return this.#inner.add_to_siwe_message(siwe);
  }

  encodeAsSiweResource(): string {
    return this.#inner.encode();
  }

  /** LIT specific methods */

  addCapabilityForResource(resource: string, ability: LitAbility): void {
    const { recapNamespace, recapAbility } =
      getRecapNamespaceAndAbility(ability);

    return this.addAttenuation(
      getRecapResourceKey(resource, ability),
      recapNamespace,
      recapAbility
    );
  }

  verifyCapabilitiesForResource(
    resource: string,
    ability: LitAbility
  ): boolean {
    // Get the attenuations object.
    const attenuations = this.attenuations;

    const { recapNamespace, recapAbility } =
      getRecapNamespaceAndAbility(ability);
    const recapAbilityToCheckFor = `${recapNamespace}/${recapAbility}`;
    const resourceKey = getRecapResourceKey(resource, ability);

    if (!attenuations[resourceKey]) {
      // No attenuations specified for this resource.
      return false;
    }

    // Check whether the exact Recap namespace/ability pair is present.
    const attenuatedRecapAbilities: string[] = Object.keys(
      attenuations[resourceKey]
    );

    for (const attenuatedRecapAbility of attenuatedRecapAbilities) {
      if (attenuatedRecapAbility === recapAbilityToCheckFor) {
        return true;
      }
    }

    return false;
  }
}
