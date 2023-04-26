import { LitAbility, LitResourceBase, LitResourcePrefix } from './models';

export class LitAccessControlConditionResource extends LitResourceBase {
  resourcePrefix = LitResourcePrefix.AccessControlCondition;

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

export class LitPKPResource extends LitResourceBase {
  resourcePrefix = LitResourcePrefix.PKP;

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

export class LitRLIResource extends LitResourceBase {
  resourcePrefix = LitResourcePrefix.RLI;

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

export class LitLitActionResource extends LitResourceBase {
  resourcePrefix = LitResourcePrefix.LitAction;

  /**
   * Creates a new LitLitActionResource.
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
