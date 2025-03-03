import { SiweMessage } from 'siwe';
import { Recap } from 'siwe-recap';

import {
  InvalidArgumentException,
  LIT_ABILITY_VALUES,
} from '@lit-protocol/constants';
import {
  AttenuationsObject,
  CID as CIDString,
  DefinedJson,
  ILitResource,
  ISessionCapabilityObject,
} from '@lit-protocol/types';

import { getRecapNamespaceAndAbility } from './utils';
import { sanitizeSiweMessage } from '../siwe/siwe-helper';

export type Restriction = Record<string, DefinedJson>;

export class RecapSessionCapabilityObject implements ISessionCapabilityObject {
  private _inner: Recap;

  constructor(att: AttenuationsObject = {}, prf: CIDString[] | string[] = []) {
    this._inner = new Recap(att, prf);
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
    return this._inner.attenuations;
  }

  get proofs(): CIDString[] {
    return this._inner.proofs.map((cid) => cid.toString());
  }

  get statement(): string {
    return sanitizeSiweMessage(this._inner.statement);
  }

  addProof(proof: string): void {
    return this._inner.addProof(proof);
  }

  addAttenuation(
    resource: string,
    namespace = '*',
    name = '*',
    restriction: Restriction = {}
  ) {
    return this._inner.addAttenuation(resource, namespace, name, restriction);
  }

  addToSiweMessage(siwe: SiweMessage): SiweMessage {
    return this._inner.add_to_siwe_message(siwe);
  }

  encodeAsSiweResource(): string {
    return this._inner.encode();
  }

  /** LIT specific methods */
  addCapabilityForResource(
    litResource: ILitResource,
    ability: LIT_ABILITY_VALUES,
    data: Restriction = {}
  ): void {
    // Validate Lit ability is compatible with the Lit resource.
    if (!litResource.isValidLitAbility(ability)) {
      throw new InvalidArgumentException(
        {
          info: {
            litResource,
            ability,
          },
        },
        `The specified Lit resource does not support the specified ability.`
      );
    }

    const { recapNamespace, recapAbility } =
      getRecapNamespaceAndAbility(ability);

    if (!data) {
      return this.addAttenuation(
        litResource.getResourceKey(),
        recapNamespace,
        recapAbility
      );
    }

    return this.addAttenuation(
      litResource.getResourceKey(),
      recapNamespace,
      recapAbility,
      data
    );
  }

  verifyCapabilitiesForResource(
    litResource: ILitResource,
    ability: LIT_ABILITY_VALUES
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
      this._getResourceKeyToMatchAgainst(litResource);

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
  private _getResourceKeyToMatchAgainst(litResource: ILitResource): string {
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
