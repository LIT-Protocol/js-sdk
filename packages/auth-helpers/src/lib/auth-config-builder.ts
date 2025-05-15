/**
 * @module AuthConfigBuilder
 * This module provides a builder for creating AuthConfig objects in a fluent manner.
 * It simplifies the process of constructing authentication configurations and defining
 * resource capabilities directly within a single builder.
 *
 * @example
 * // import { createAuthConfigBuilder } from './auth-config-builder';
 *
 * // async function setupAuth() {
 * //   const authConfig = createAuthConfigBuilder()
 * //     .addStatement('This is a custom statement for authentication.')
 * //     .addDomain('myapp.example.com')
 * //     .addPKPSigningRequest('*') // Directly add resource capabilities
 * //     .addLitActionExecutionRequest('my-lit-action-ipfs-id') // Example Lit Action IPFS ID
 * //     .build();
 * //   console.log('Constructed AuthConfig:', authConfig);
 * // }
 * // setupAuth();
 */
import { AuthConfigSchema } from '@lit-protocol/schemas';
import {
  AuthSig,
  LitResourceAbilityRequest,
  ILitResource,
} from '@lit-protocol/types';
import { LIT_ABILITY, LIT_ABILITY_VALUES } from '@lit-protocol/constants';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
  LitPaymentDelegationResource,
} from './resources'; // Corrected path: from ../lib/auth-config-builder.ts to ../lib/resources/

import { z } from 'zod';

// Infer the AuthConfig type from the Zod schema
type AuthConfig = z.infer<typeof AuthConfigSchema>;

// Type for the items in the internal resources array, matching what ResourceBuilder produced
type ResourceRequest = {
  resource: ILitResource;
  ability: LIT_ABILITY_VALUES;
};

/**
 * Interface for the AuthConfigBuilder.
 * Defines the fluent API for constructing an AuthConfig object and its associated resources.
 */
interface IAuthConfigBuilder {
  addCapabilityAuthSigs: (sigs: AuthSig[]) => IAuthConfigBuilder;
  addExpiration: (expiration: string | Date) => IAuthConfigBuilder;
  addStatement: (statement: string) => IAuthConfigBuilder;
  addDomain: (domain: string) => IAuthConfigBuilder;

  // Methods for adding resource capabilities directly
  addPKPSigningRequest: (resourceId: string) => IAuthConfigBuilder;
  addLitActionExecutionRequest: (resourceId: string) => IAuthConfigBuilder;
  addAccessControlConditionSigningRequest: (
    resourceId: string
  ) => IAuthConfigBuilder;
  addAccessControlConditionDecryptionRequest: (
    resourceId: string
  ) => IAuthConfigBuilder;
  addPaymentDelegationRequest: (resourceId: string) => IAuthConfigBuilder;

  build: () => AuthConfig;
}

/**
 * Creates and returns a new instance of the AuthConfigBuilder.
 */
export const createAuthConfigBuilder = (): IAuthConfigBuilder => {
  const configInProgress: Partial<Omit<AuthConfig, 'resources'>> = {};
  const resourcesArray: ResourceRequest[] = [];

  const builder: IAuthConfigBuilder = {
    addCapabilityAuthSigs(sigs: AuthSig[]): IAuthConfigBuilder {
      configInProgress.capabilityAuthSigs = sigs;
      return builder;
    },
    addExpiration(expiration: string | Date): IAuthConfigBuilder {
      if (expiration instanceof Date) {
        configInProgress.expiration = expiration.toISOString();
      } else {
        configInProgress.expiration = expiration;
      }
      return builder;
    },
    addStatement(statement: string): IAuthConfigBuilder {
      configInProgress.statement = statement;
      return builder;
    },
    addDomain(domain: string): IAuthConfigBuilder {
      configInProgress.domain = domain;
      return builder;
    },

    // Resource capability methods
    addPKPSigningRequest(resourceId: string): IAuthConfigBuilder {
      resourcesArray.push({
        resource: new LitPKPResource(resourceId),
        ability: LIT_ABILITY.PKPSigning,
      });
      return builder;
    },
    addLitActionExecutionRequest(resourceId: string): IAuthConfigBuilder {
      resourcesArray.push({
        resource: new LitActionResource(resourceId),
        ability: LIT_ABILITY.LitActionExecution,
      });
      return builder;
    },
    addAccessControlConditionSigningRequest(
      resourceId: string
    ): IAuthConfigBuilder {
      resourcesArray.push({
        resource: new LitAccessControlConditionResource(resourceId),
        ability: LIT_ABILITY.AccessControlConditionSigning,
      });
      return builder;
    },
    addAccessControlConditionDecryptionRequest(
      resourceId: string
    ): IAuthConfigBuilder {
      resourcesArray.push({
        resource: new LitAccessControlConditionResource(resourceId),
        ability: LIT_ABILITY.AccessControlConditionDecryption,
      });
      return builder;
    },
    addPaymentDelegationRequest(resourceId: string): IAuthConfigBuilder {
      resourcesArray.push({
        resource: new LitPaymentDelegationResource(resourceId),
        ability: LIT_ABILITY.PaymentDelegation,
      });
      return builder;
    },

    build: (): AuthConfig => {
      const finalConfig = {
        ...configInProgress,
        resources: resourcesArray as LitResourceAbilityRequest[], // Cast needed if ResourceRequest is not strictly LitResourceAbilityRequest
      };

      // if resources is empty, throw an error
      if (resourcesArray.length === 0) {
        throw new Error(
          `🤯 Resources array is empty, please add at least one resource to the auth config. You can add resources using the following methods:
          - addPKPSigningRequest
          - addLitActionExecutionRequest
          - addAccessControlConditionSigningRequest
          - addAccessControlConditionDecryptionRequest
          - addPaymentDelegationRequest
          `
        );
      }

      try {
        // Ensure default values for top-level AuthConfig props are applied
        // by parsing an object that includes the resources array.
        const parsedConfig = AuthConfigSchema.parse(finalConfig);
        return parsedConfig;
      } catch (e) {
        if (e instanceof z.ZodError) {
          console.error('AuthConfig validation failed:', e.errors);
        }
        throw new Error(`Failed to build AuthConfig: ${(e as Error).message}`);
      }
    },
  };

  return builder;
};
