import { SiweMessage } from 'siwe';
import { Recap } from 'siwe-recap';
import {
  AttenuationsObject,
  CID as CIDString,
  ILitResource,
  ISessionCapabilityObject,
  LitAbility,
  PlainJSON,
} from '../models';
import { getRecapNamespaceAndAbility } from './utils';
import { sanitizeSiweMessage } from '../siwe';
import { AuthSig } from '../models';
import { IPFSBundledSDK } from '@lit-protocol/lit-third-party-libs';

export class RecapSessionCapabilityObject implements ISessionCapabilityObject {
  #inner: Recap;

  constructor(
    att: AttenuationsObject = {},
    prf: Array<CIDString> | Array<string> = []
  ) {
    this.#inner = new Recap(att, prf);
  }

  // static async sha256(data: Buffer): Promise<ArrayBuffer> {
  //   const digest = await crypto.subtle.digest('SHA-256', data);
  //   return digest;
  // }

  // This should ideally be placed in the IPFSBundledSDK package, but for some reasons
  // there seems to be bundling issues where the jest test would fail, but somehow
  // works here.
  public static async strToCID(data: string | Uint8Array | object): Promise<string> {
    let content: Uint8Array;

    // Check the type of data and convert accordingly
    if (typeof data === 'string') {
      // console.log("Type A");
      // Encode the string directly if data is a string
      content = new TextEncoder().encode(data);
    } else if (data instanceof Uint8Array) {
      // console.log("Type B");
      // Use the Uint8Array directly
      content = data;
    } else if (typeof data === 'object') {
      // console.log("Type C");
      // Stringify and encode if data is an object
      const contentStr = JSON.stringify(data);
      content = new TextEncoder().encode(contentStr);
    } else {
      // console.log("Type D");
      throw new Error("Invalid content type");
    }

    // Create the CID
    let ipfsId;
    for await (const { cid } of IPFSBundledSDK.importer(
      [{ content }],
      new IPFSBundledSDK.MemoryBlockstore(),
      { onlyHash: true }
    )) {
      ipfsId = cid;
    }

    // Validate the IPFS ID
    if (!ipfsId) {
      throw new Error("Could not create IPFS ID");
    }

    // Return the IPFS ID as a string
    return ipfsId.toString();
  }

  /**
   * Adds a Rate Limit Authorization Signature (AuthSig) as an proof to the Recap object.
   * This method serializes the AuthSig object into a JSON string and adds it to the proof
   * of the Recap object. The AuthSig typically contains authentication details like signature,
   * method of derivation, the signed message, and the address of the signer. This proof is
   * used to verify that the user has the necessary authorization, such as a Rate Limit Increase NFT.
   *
   * @param authSig The AuthSig object containing the rate limit authorization details.
   */
  async addRateLimitAuthSig(authSig: AuthSig) {

    const ipfsId = await RecapSessionCapabilityObject.strToCID(authSig);

    try {
      this.addProof(ipfsId);
    } catch (e: any) {
      throw new Error(e);
    }
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

  get proofs(): Array<CIDString> {
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
    ability: LitAbility,
    data: any = {}
  ): void {
    // Validate Lit ability is compatible with the Lit resource.
    if (!litResource.isValidLitAbility(ability)) {
      throw new Error(
        `The specified Lit resource does not support the specified ability.`
      );
    }

    const { recapNamespace, recapAbility } =
      getRecapNamespaceAndAbility(ability);

    if (!data) {
      return this.addAttenuation(
        litResource.getResourceKey(),
        recapNamespace,
        recapAbility,
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
