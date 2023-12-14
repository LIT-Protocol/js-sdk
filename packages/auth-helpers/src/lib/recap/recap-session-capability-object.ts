import { SiweMessage } from 'siwe';
import { Recap } from 'siwe-recap';
import {
  AttenuationsObject,
  CID,
  ILitResource,
  ISessionCapabilityObject,
  LitAbility,
  PlainJSON,
} from '../models';
import { getRecapNamespaceAndAbility } from './utils';
import { sanitizeSiweMessage } from '../siwe';
import { AuthSig } from '@lit-protocol/types';

export class RecapSessionCapabilityObject implements ISessionCapabilityObject {
  #inner: Recap;

  constructor(
    att: AttenuationsObject = {},
    prf: Array<CID> | Array<string> = []
  ) {
    this.#inner = new Recap(att, prf);
  }

  /**
   * Adds a Rate Limit Authorization Signature (AuthSig) as a proof to the Recap object.
   * This method serializes the AuthSig object into a JSON string and adds it to the proofs
   * of the Recap object. The AuthSig typically contains authentication details like signature,
   * method of derivation, the signed message, and the address of the signer. This proof is
   * used to verify that the user has the necessary authorization, such as a Rate Limit Increase NFT.
   *
   * @param authSig The AuthSig object containing the rate limit authorization details.
   */
  addRateLimitAuthSig(authSig: AuthSig): void {

    // Serialize the AuthSig object into a JSON string
    const serializedAuthSig = JSON.stringify(authSig);

    // Add the serialized AuthSig as a proof to the Recap object
    this.#inner.addProof(serializedAuthSig);
  }

  static decode(encoded: string): RecapSessionCapabilityObject {
    const recap = Recap.decode_urn(encoded);
    return new this(
      recap.attenuations,
      recap.proofs.map((cid: any) => cid.toString())
    );
  }

  static extract(siwe: SiweMessage): RecapSessionCapabilityObject {
    const recap = Recap.extract_and_verify(siwe);
    return new this(
      recap.attenuations,
      recap.proofs.map((cid: any) => cid.toString())
    );
  }

  get attenuations(): AttenuationsObject {
    return this.#inner.attenuations;
  }

  get proofs(): Array<CID> {
    return this.#inner.proofs.map((cid: any) => cid.toString());
  }

  get statement(): string {
    return sanitizeSiweMessage(this.#inner.statement);
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
  addCapabilityForResource(
    litResource: ILitResource,
    ability: LitAbility
  ): void {
    // Validate Lit ability is compatible with the Lit resource.
    if (!litResource.isValidLitAbility(ability)) {
      throw new Error(
        `The specified Lit resource does not support the specified ability.`
      );
    }

    const { recapNamespace, recapAbility } =
      getRecapNamespaceAndAbility(ability);

    return this.addAttenuation(
      litResource.getResourceKey(),
      recapNamespace,
      recapAbility
    );
  }

  verifyCapabilitiesForResource(
    litResource: ILitResource,
    ability: LitAbility
  ): boolean {
    // Validate Lit ability is compatible with the Lit resource.
    // The only exception is if there's a wildcard resource key in the session capability object.
    if (!litResource.isValidLitAbility(ability)) {
      return false;
    }

    // Get the attenuations object.
    const attenuations = this.attenuations;

    const { recapNamespace, recapAbility } =
      getRecapNamespaceAndAbility(ability);
    const recapAbilityToCheckFor = `${recapNamespace}/${recapAbility}`;

    // Find an attenuated resource key to match against.
    const attenuatedResourceKey =
      this.#getResourceKeyToMatchAgainst(litResource);

    if (!attenuations[attenuatedResourceKey]) {
      // No attenuations specified for this resource.
      return false;
    }

    // Check whether the exact Recap namespace/ability pair is present.
    const attenuatedRecapAbilities: string[] = Object.keys(
      attenuations[attenuatedResourceKey]
    );

    for (const attenuatedRecapAbility of attenuatedRecapAbilities) {
      // Return early if the attenuated recap ability is a wildcard.
      if (attenuatedRecapAbility === '*/*') {
        return true;
      }

      if (attenuatedRecapAbility === recapAbilityToCheckFor) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns the attenuated resource key to match against. This supports matching
   * against a wildcard resource key too.
   *
   * @example If the attenuations object contains the following:
   *
   * ```
   * {
   *   'lit-acc://*': {
   *    '*\/*': {}
   *   }
   * }
   * ```
   *
   * Then, if the provided litResource is 'lit-acc://123', the method will return 'lit-acc://*'.
   */
  #getResourceKeyToMatchAgainst(litResource: ILitResource): string {
    const attenuatedResourceKeysToMatchAgainst: string[] = [
      `${litResource.resourcePrefix}://*`,
      litResource.getResourceKey(),
    ];

    for (const attenuatedResourceKeyToMatchAgainst of attenuatedResourceKeysToMatchAgainst) {
      if (this.attenuations[attenuatedResourceKeyToMatchAgainst]) {
        return attenuatedResourceKeyToMatchAgainst;
      }
    }

    return '';
  }

  addAllCapabilitiesForResource(litResource: ILitResource): void {
    return this.addAttenuation(litResource.getResourceKey(), '*', '*');
  }
}
