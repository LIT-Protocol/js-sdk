import {
  AccessControlConditions,
  AccsParams,
  ILitResource,
  LitAbility,
  LitResourcePrefix,
} from '@lit-protocol/types';
import { hashAccessControlConditions } from '@lit-protocol/access-control-conditions';
import { uint8arrayToString } from '@lit-protocol/uint8arrays';

abstract class LitResourceBase {
  abstract resourcePrefix: LitResourcePrefix;
  public readonly resource: string;

  constructor(resource: string) {
    this.resource = resource;
  }

  getResourceKey(): string {
    return `${this.resourcePrefix}://${this.resource}`;
  }

  toString(): string {
    return this.getResourceKey();
  }
}

export class LitAccessControlConditionResource
  extends LitResourceBase
  implements ILitResource
{
  public readonly resourcePrefix = LitResourcePrefix.AccessControlCondition;

  /**
   * Creates a new LitAccessControlConditionResource.
   * @param resource The identifier for the resource. This should be the
   * hashed key value of the access control condition.
   */
  constructor(resource: string) {
    super(resource);
  }

  isValidLitAbility(litAbility: LitAbility): boolean {
    return (
      litAbility === LitAbility.AccessControlConditionDecryption ||
      litAbility === LitAbility.AccessControlConditionSigning
    );
  }
  /**
   * Composes a resource string by hashing access control conditions and appending a data hash.
   *
   * @param {AccessControlConditions} accs - The access control conditions to hash.
   * @param {string} dataToEncryptHash - The hash of the data to encrypt.
   * @returns {Promise<string>} The composed resource string in the format 'hashedAccs/dataToEncryptHash'.
   */
  public static async composeLitActionResourceString(
    accs: AccessControlConditions,
    dataToEncryptHash: string
  ) {
    if (!accs || !dataToEncryptHash) {
      throw new Error(
        'Invalid input: Access control conditions and data hash are required.'
      );
    }

    const hashedAccs = await hashAccessControlConditions(accs);
    const hashedAccsStr = uint8arrayToString(
      new Uint8Array(hashedAccs),
      'base16'
    );

    const resourceString = `${hashedAccsStr}/${dataToEncryptHash}`;

    return resourceString;
  }
}

export class LitPKPResource extends LitResourceBase implements ILitResource {
  public readonly resourcePrefix = LitResourcePrefix.PKP;

  /**
   * Creates a new LitPKPResource.
   * @param resource The identifier for the resource. This should be the
   * PKP token ID.
   */
  constructor(resource: string) {
    super(resource);
  }

  isValidLitAbility(litAbility: LitAbility): boolean {
    return litAbility === LitAbility.PKPSigning;
  }
}

export class LitRLIResource extends LitResourceBase implements ILitResource {
  public readonly resourcePrefix = LitResourcePrefix.RLI;

  /**
   * Creates a new LitRLIResource.
   * @param resource The identifier for the resource. This should be the
   * RLI token ID.
   */
  constructor(resource: string) {
    super(resource);
  }

  isValidLitAbility(litAbility: LitAbility): boolean {
    return litAbility === LitAbility.RateLimitIncreaseAuth;
  }
}

export class LitActionResource extends LitResourceBase implements ILitResource {
  public readonly resourcePrefix = LitResourcePrefix.LitAction;

  /**
   * Creates a new LitActionResource.
   * @param resource The identifier for the resource. This should be the
   * Lit Action IPFS CID.
   */
  constructor(resource: string) {
    super(resource);
  }

  isValidLitAbility(litAbility: LitAbility): boolean {
    return litAbility === LitAbility.LitActionExecution;
  }
}

export function parseLitResource(resourceKey: string): ILitResource {
  if (resourceKey.startsWith(LitResourcePrefix.AccessControlCondition)) {
    return new LitAccessControlConditionResource(
      resourceKey.substring(
        `${LitResourcePrefix.AccessControlCondition}://`.length
      )
    );
  } else if (resourceKey.startsWith(LitResourcePrefix.PKP)) {
    return new LitPKPResource(
      resourceKey.substring(`${LitResourcePrefix.PKP}://`.length)
    );
  } else if (resourceKey.startsWith(LitResourcePrefix.RLI)) {
    return new LitRLIResource(
      resourceKey.substring(`${LitResourcePrefix.RLI}://`.length)
    );
  } else if (resourceKey.startsWith(LitResourcePrefix.LitAction)) {
    return new LitActionResource(
      resourceKey.substring(`${LitResourcePrefix.LitAction}://`.length)
    );
  }
  throw new Error(`Invalid resource prefix: ${resourceKey}`);
}
