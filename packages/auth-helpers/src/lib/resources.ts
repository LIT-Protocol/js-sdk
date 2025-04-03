import { hashAccessControlConditions } from '@lit-protocol/access-control-conditions';
import {
  InvalidArgumentException,
  LIT_ABILITY,
  LIT_ABILITY_VALUES,
  LIT_RESOURCE_PREFIX,
  LIT_RESOURCE_PREFIX_VALUES,
} from '@lit-protocol/constants';
import { AccessControlConditions, ILitResource } from '@lit-protocol/types';
import { formatPKPResource } from './utils';

abstract class LitResourceBase {
  abstract resourcePrefix: LIT_RESOURCE_PREFIX_VALUES;
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
  public readonly resourcePrefix = LIT_RESOURCE_PREFIX.AccessControlCondition;

  /**
   * Creates a new LitAccessControlConditionResource.
   * @param resource The identifier for the resource. This should be the
   * hashed key value of the access control condition.
   */
  constructor(resource: string) {
    super(resource);
  }

  isValidLitAbility(litAbility: LIT_ABILITY_VALUES): boolean {
    return (
      litAbility === LIT_ABILITY.AccessControlConditionDecryption ||
      litAbility === LIT_ABILITY.AccessControlConditionSigning
    );
  }

  /**
   * Composes a resource string by hashing access control conditions and appending a data hash.
   *
   * @param {AccessControlConditions} accs - The access control conditions to hash.
   * @param {string} dataToEncryptHash - The hash of the data to encrypt.
   * @returns {Promise<string>} The composed resource string in the format 'hashedAccs/dataToEncryptHash'.
   */
  public static async generateResourceString(
    accs: AccessControlConditions,
    dataToEncryptHash: string
  ): Promise<string> {
    if (!accs || !dataToEncryptHash) {
      throw new InvalidArgumentException(
        {
          info: {
            accs,
            dataToEncryptHash,
          },
        },
        'Invalid input: Access control conditions and data hash are required.'
      );
    }

    const hashedAccs = await hashAccessControlConditions(accs);
    const hashedAccsStr = Buffer.from(new Uint8Array(hashedAccs)).toString(
      'hex'
    );

    const resourceString = `${hashedAccsStr}/${dataToEncryptHash}`;

    return resourceString;
  }
}

export class LitPKPResource extends LitResourceBase implements ILitResource {
  public readonly resourcePrefix = LIT_RESOURCE_PREFIX.PKP;

  /**
   * Creates a new LitPKPResource.
   * @param resource The identifier for the resource. This should be the
   * PKP token ID.
   */
  constructor(resource: string) {
    const fixedResource = formatPKPResource(resource);
    super(fixedResource);
  }

  isValidLitAbility(litAbility: LIT_ABILITY_VALUES): boolean {
    return litAbility === LIT_ABILITY.PKPSigning;
  }
}

export class LitPaymentDelegationResource
  extends LitResourceBase
  implements ILitResource
{
  public readonly resourcePrefix = LIT_RESOURCE_PREFIX.PaymentDelegation;

  /**
   * Creates a new LitPaymentDelegationResource.
   * @param resource The identifier for the resource. This should be the
   * Payment Delegation token ID.
   */
  constructor(resource: string) {
    super(resource);
  }

  isValidLitAbility(litAbility: LIT_ABILITY_VALUES): boolean {
    return litAbility === LIT_ABILITY.PaymentDelegation;
  }
}

export class LitActionResource extends LitResourceBase implements ILitResource {
  public readonly resourcePrefix = LIT_RESOURCE_PREFIX.LitAction;

  /**
   * Creates a new LitActionResource.
   * @param resource The identifier for the resource. This should be the
   * Lit Action IPFS CID.
   */
  constructor(resource: string) {
    super(resource);
  }

  isValidLitAbility(litAbility: LIT_ABILITY_VALUES): boolean {
    return litAbility === LIT_ABILITY.LitActionExecution;
  }
}

export function parseLitResource(resourceKey: string): ILitResource {
  if (resourceKey.startsWith(LIT_RESOURCE_PREFIX.AccessControlCondition)) {
    return new LitAccessControlConditionResource(
      resourceKey.substring(
        `${LIT_RESOURCE_PREFIX.AccessControlCondition}://`.length
      )
    );
  } else if (resourceKey.startsWith(LIT_RESOURCE_PREFIX.PKP)) {
    return new LitPKPResource(
      resourceKey.substring(`${LIT_RESOURCE_PREFIX.PKP}://`.length)
    );
  } else if (resourceKey.startsWith(LIT_RESOURCE_PREFIX.PaymentDelegation)) {
    return new LitPaymentDelegationResource(
      resourceKey.substring(
        `${LIT_RESOURCE_PREFIX.PaymentDelegation}://`.length
      )
    );
  } else if (resourceKey.startsWith(LIT_RESOURCE_PREFIX.LitAction)) {
    return new LitActionResource(
      resourceKey.substring(`${LIT_RESOURCE_PREFIX.LitAction}://`.length)
    );
  }
  throw new InvalidArgumentException(
    {
      info: {
        resourceKey,
      },
    },
    `Invalid resource prefix`
  );
}
