import { LIT_ABILITY, LIT_ABILITY_VALUES } from '@lit-protocol/constants';
import { ILitResource, LitResourceAbilityRequest } from '@lit-protocol/types';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
  LitPaymentDelegationResource,
} from './resources'; // Assuming these are exported from resources.ts

// Renamed for clarity, representing the type of ability string.
export type ShorthandAbilityType =
  | typeof LIT_ABILITY.PKPSigning
  | typeof LIT_ABILITY.LitActionExecution
  | typeof LIT_ABILITY.AccessControlConditionSigning
  | typeof LIT_ABILITY.AccessControlConditionDecryption
  | typeof LIT_ABILITY.PaymentDelegation;

export type ResourceShorthandTuple = [ShorthandAbilityType, string]; // [ability, resourceId]
export type ResourceShorthandObject = {
  // New object shorthand
  ability: ShorthandAbilityType;
  resource: string;
};

// Represents an array containing either tuples or objects, or a mix (though typically uniform).
export type ResourceShorthandInput = (
  | ResourceShorthandTuple
  | ResourceShorthandObject
)[];

/**
 * Type guard to check if the given resources are in a shorthand format
 * (either array of tuples or array of objects) that needs transformation.
 * It does not check for the fully structured LitResourceAbilityRequest[].
 * @param resources - The resources to check.
 * @returns True if resources are in a known shorthand format, false otherwise.
 */
export function isResourceShorthandInput(
  resources: any
): resources is ResourceShorthandInput {
  if (!Array.isArray(resources)) {
    return false;
  }
  if (resources.length === 0) {
    return true; // Empty array is a valid shorthand input
  }

  const firstElement = resources[0];

  // Check if it's an array of tuples
  if (
    Array.isArray(firstElement) &&
    firstElement.length === 2 &&
    typeof firstElement[0] === 'string' &&
    typeof firstElement[1] === 'string'
  ) {
    // Further check if all elements match this pattern (optional, can be done in transform)
    return resources.every(
      (item: any) =>
        Array.isArray(item) &&
        item.length === 2 &&
        typeof item[0] === 'string' &&
        typeof item[1] === 'string'
    );
  }

  // Check if it's an array of objects
  if (
    typeof firstElement === 'object' &&
    firstElement !== null &&
    'ability' in firstElement &&
    'resource' in firstElement &&
    typeof firstElement.ability === 'string' &&
    typeof firstElement.resource === 'string'
  ) {
    // Further check if all elements match this pattern (optional, can be done in transform)
    return resources.every(
      (item: any) =>
        typeof item === 'object' &&
        item !== null &&
        'ability' in item &&
        'resource' in item &&
        typeof item.ability === 'string' &&
        typeof item.resource === 'string'
    );
  }

  return false; // Not a recognized shorthand format
}

/**
 * Transforms an array of resource shorthands (tuples or objects)
 * into an array of full LitResourceAbilityRequest objects.
 * @param shorthandInput - The array of resource shorthands.
 * @returns An array of LitResourceAbilityRequest objects.
 * @throws Error if an unknown shorthand resource type or format is encountered.
 */
export function transformShorthandResources(
  shorthandInput: ResourceShorthandInput
): LitResourceAbilityRequest[] {
  return shorthandInput.map((item) => {
    let abilityValue: ShorthandAbilityType;
    let resourceId: string;

    if (Array.isArray(item)) {
      // It's a tuple [ability, resourceId]
      if (
        item.length === 2 &&
        typeof item[0] === 'string' &&
        typeof item[1] === 'string'
      ) {
        abilityValue = item[0] as ShorthandAbilityType; // Type assertion
        resourceId = item[1];
      } else {
        throw new Error('Invalid resource shorthand tuple format.');
      }
    } else if (
      typeof item === 'object' &&
      item !== null &&
      'ability' in item &&
      'resource' in item
    ) {
      // It's an object { ability, resource }
      if (
        typeof item.ability === 'string' &&
        typeof item.resource === 'string'
      ) {
        abilityValue = item.ability as ShorthandAbilityType; // Type assertion
        resourceId = item.resource;
      } else {
        throw new Error(
          'Invalid resource shorthand object format: ability or resource is not a string.'
        );
      }
    } else {
      throw new Error('Unknown item format in resource shorthand array.');
    }

    let resourceInstance: ILitResource;
    let abilityEnum: LIT_ABILITY_VALUES;

    switch (abilityValue) {
      case LIT_ABILITY.PKPSigning:
        resourceInstance = new LitPKPResource(resourceId);
        abilityEnum = LIT_ABILITY.PKPSigning;
        break;
      case LIT_ABILITY.LitActionExecution:
        resourceInstance = new LitActionResource(resourceId);
        abilityEnum = LIT_ABILITY.LitActionExecution;
        break;
      case LIT_ABILITY.AccessControlConditionSigning:
        resourceInstance = new LitAccessControlConditionResource(resourceId);
        abilityEnum = LIT_ABILITY.AccessControlConditionSigning;
        break;
      case LIT_ABILITY.AccessControlConditionDecryption:
        resourceInstance = new LitAccessControlConditionResource(resourceId);
        abilityEnum = LIT_ABILITY.AccessControlConditionDecryption;
        break;
      case LIT_ABILITY.PaymentDelegation:
        resourceInstance = new LitPaymentDelegationResource(resourceId);
        abilityEnum = LIT_ABILITY.PaymentDelegation;
        break;
      default:
        const exhaustiveCheck: never = abilityValue;
        throw new Error('Unknown shorthand ability type: ' + exhaustiveCheck);
    }

    return {
      resource: resourceInstance,
      ability: abilityEnum,
    };
  });
}
