import { ILitResource, LitAbility, LitResourcePrefix } from './models';

abstract class LitResourceBase {
  abstract resourcePrefix: LitResourcePrefix;
  public readonly resource: string;

  constructor(resource: string) {
    this.resource = resource;
  }

  getResourceKey(): string {
    return `${this.resourcePrefix}/${this.resource}`;
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

export class LitWildcardResource
  extends LitResourceBase
  implements ILitResource
{
  public readonly resourcePrefix = LitResourcePrefix.Wildcard;

  /**
   * Creates a new LitWildcardResource.
   */
  constructor() {
    super('*');
  }

  isValidLitAbility(_: LitAbility): boolean {
    return true;
  }
}

export function parseLitResource(resourceKey: string): ILitResource {
  if (resourceKey.startsWith(LitResourcePrefix.AccessControlCondition)) {
    return new LitAccessControlConditionResource(
      resourceKey.substring(LitResourcePrefix.AccessControlCondition.length + 1)
    );
  } else if (resourceKey.startsWith(LitResourcePrefix.PKP)) {
    return new LitPKPResource(
      resourceKey.substring(LitResourcePrefix.PKP.length + 1)
    );
  } else if (resourceKey.startsWith(LitResourcePrefix.RLI)) {
    return new LitRLIResource(
      resourceKey.substring(LitResourcePrefix.RLI.length + 1)
    );
  } else if (resourceKey.startsWith(LitResourcePrefix.LitAction)) {
    return new LitActionResource(
      resourceKey.substring(LitResourcePrefix.LitAction.length + 1)
    );
  } else if (resourceKey.startsWith(LitResourcePrefix.Wildcard)) {
    return new LitWildcardResource();
  }
  throw new Error(`Invalid resource prefix: ${resourceKey}`);
}
